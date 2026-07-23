"""Universal asset boot kernel.

main.py is nothing but a boot: it discovers asset folders, loads their
kernel entries, runs at most one claimed "main", then unloads and exits.

- No server. No loop. Servers and loops are assets (system/aiohttp_server,
  system/flask_server, system/frame_loop) and can be added/removed/swapped.
- If no asset claims a main, assets simply run on_load and the process exits
  (batch mode).

usage:
    python main.py [--settings settings/engine.json] [--settings more.json]

Settings merge order (deep merge, later wins):
    settings.json -> each --settings overlay -> user_settings.json
"""
from __future__ import annotations

import importlib.machinery
import importlib.util
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent


def _log(*msg) -> None:
    """Always stderr — stdout is the CGI/WSGI response body."""
    print(*msg, file=sys.stderr)




def deep_merge(base: dict, over: dict) -> dict:
    out = dict(base)
    for k, v in over.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def load_settings(argv: list[str]) -> dict:
    files = [ROOT / "settings.json"]
    args = list(argv[1:])
    while args:
        a = args.pop(0)
        if a == "--settings" and args:
            files.append(ROOT / args.pop(0))
    files.append(ROOT / "user_settings.json")
    s: dict = {"asset_roots": ["${project}/assets"], "assets": {}}
    for f in files:
        if f.is_file():
            s = deep_merge(s, json.loads(f.read_text(encoding="utf-8")))
    return s


class Record:
    """One discovered asset folder (asset = folder with meta.json)."""

    def __init__(self, key: str, path: pathlib.Path, meta: dict,
                 root: pathlib.Path):
        self.key = key            # "namespace/name"
        self.path = path
        self.meta = meta
        self.root = root          # the asset root this came from (multi-root)
        self.instance = None      # kernel entry instance (None = data asset)
        # unique, import-safe package name so an asset can live at ANY path
        # (other projects included) without dotted-path / namespace collisions
        self.pkg = "asset__" + re.sub(r"[^0-9a-zA-Z]+", "_", key)


class Ctx:
    """The only API the kernel hands to an asset."""

    def __init__(self, kernel: "Kernel", record: Record):
        self._kernel = kernel
        self.key = record.key
        self.dir = record.path
        self.settings = kernel.asset_settings(record)
        self.records = kernel.records          # all assets (for host assets)

    def provide(self, name, obj):
        self._kernel.services[name] = obj

    def service(self, name):
        return self._kernel.services.get(name)

    def claim_main(self, fn, priority: int = 0):
        self._kernel.mains.append((priority, len(self._kernel.mains), self.key, fn))

    def request_shutdown(self):
        self._kernel.shutdown = True

    @property
    def shutdown_requested(self) -> bool:
        return self._kernel.shutdown

    def import_entry(self, record: Record, entry: str):
        """Import a file inside an asset folder as a module (host assets use
        this to load their own entry kinds, e.g. routes.py). Works for assets
        at ANY path, including other projects' asset roots."""
        return self._kernel.import_entry(record, entry)

    def log(self, *msg):
        _log(f"[{self.key}]", *msg)


class Kernel:
    def __init__(self, settings: dict):
        self.settings = settings
        self.records: list[Record] = []
        self.loaded: list[Record] = []
        self.services: dict = {}
        self.mains: list = []
        self.shutdown = False

    # -- settings ----------------------------------------------------------
    def asset_settings(self, rec: Record) -> dict:
        return deep_merge(rec.meta.get("settings", {}),
                          self.settings["assets"].get(rec.key, {}))

    # -- asset roots (multi-root: reference other projects by path) --------
    def resolve_root(self, p: str) -> pathlib.Path:
        """${project} -> this main.py's dir. Relative paths resolve against it.
        Absolute paths (e.g. D:/ProjectA/assets) are used as-is."""
        p = p.replace("${project}", str(ROOT))
        path = pathlib.Path(p)
        if not path.is_absolute():
            path = ROOT / path
        return path.resolve()

    def asset_roots(self) -> list[pathlib.Path]:
        raw = self.settings.get("asset_roots")
        if raw is None and self.settings.get("assets_dir"):     # back-compat
            raw = [self.settings["assets_dir"]]
        return [self.resolve_root(r) for r in (raw or ["${project}/assets"])]

    # -- discover ----------------------------------------------------------
    def discover(self):
        """Scan every asset root in order. Same {ns}/{name} from a later root
        OVERRIDES an earlier one (moon 'place-to-fork': list shared/engine
        roots first, the project's own root last so the project wins)."""
        by_key: dict[str, Record] = {}
        for root in self.asset_roots():
            if not root.exists():
                _log(f">> asset root not found (skipped): {root}")
                continue
            _log(f">> asset root: {root}")
            for meta_path in sorted(root.glob("*/*/meta.json")):
                path = meta_path.parent
                key = f"{path.parent.name}/{path.name}"
                try:
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                except json.JSONDecodeError as e:
                    _log(f"!! bad meta.json, skip {key}: {e}")
                    continue
                if key in by_key:
                    _log(f">> override {key}: {by_key[key].root} <- {root}")
                by_key[key] = Record(key, path, meta, root)
        self.records = list(by_key.values())

    # -- import (file-based: an asset can live at any path) ----------------
    def _ensure_pkg(self, rec: Record) -> str:
        if rec.pkg not in sys.modules:
            spec = importlib.machinery.ModuleSpec(
                rec.pkg, loader=None, is_package=True)
            spec.submodule_search_locations = [str(rec.path)]
            sys.modules[rec.pkg] = importlib.util.module_from_spec(spec)
        return rec.pkg

    def import_entry(self, rec: Record, entry: str):
        pkg = self._ensure_pkg(rec)           # makes `from . import x` work
        name = f"{pkg}.{pathlib.Path(entry).stem}"
        if name in sys.modules:
            return sys.modules[name]
        spec = importlib.util.spec_from_file_location(
            name, str(rec.path / entry))
        mod = importlib.util.module_from_spec(spec)
        sys.modules[name] = mod
        spec.loader.exec_module(mod)
        return mod

    # -- load --------------------------------------------------------------
    def kernel_entry(self, rec: Record) -> str | None:
        """hosts declaration wins over detection (unification spec U-D3)."""
        hosts = rec.meta.get("hosts")
        if isinstance(hosts, dict):
            ent = hosts.get("kernel")
            if not isinstance(ent, dict):
                return None
            return ent.get("entry", "asset.py")
        return "asset.py" if (rec.path / "asset.py").is_file() else None

    # -- dependency ordering (unification spec U-D5) ----------------------
    def canon_id(self, rec: Record) -> str:
        """canonical package id = package.id, else {ns}.{name} from folder."""
        pid = (rec.meta.get("package") or {}).get("id")
        return pid or rec.key.replace("/", ".")

    def dep_ids(self, rec: Record) -> list[str]:
        deps = (rec.meta.get("package") or {}).get("dependencies") or {}
        return [d.replace("/", ".") for d in deps]      # accept / and . forms

    def provide_ids(self, rec: Record) -> list[str]:
        prov = (rec.meta.get("package") or {}).get("provides") or {}
        return [p.replace("/", ".") for p in prov]

    def topo_order(self, recs: list[Record]) -> list[Record]:
        """Providers before dependents. Ties broken by (order, key) so the
        numeric `order` still works as a hint within a dependency layer.
        Cycles and missing deps are reported and skipped (never crash)."""
        index: dict[str, Record] = {}
        for rec in recs:
            index[self.canon_id(rec)] = rec              # real id
            for pid in self.provide_ids(rec):
                index.setdefault(pid, rec)               # virtual (provides)
        okey = lambda r: (self.asset_settings(r).get("order", 100), r.key)
        state: dict[str, int] = {}          # 0 unvisited / 1 visiting / 2 done
        result: list[Record] = []
        warned: set[str] = set()

        def visit(rec: Record, path: list[str]):
            state[rec.key] = 1
            for dep in self.dep_ids(rec):
                target = index.get(dep)
                if target is None:
                    if dep not in warned:
                        warned.add(dep)
                        _log(f"!! dep '{dep}' of {rec.key} not among "
                              "loadable assets (ignored for ordering)")
                    continue
                if target.key == rec.key:
                    continue
                st = state.get(target.key, 0)
                if st == 1:
                    _log("!! dependency cycle: "
                          f"{' -> '.join(path + [rec.key, target.key])} "
                          "(edge skipped)")
                    continue
                if st == 0:
                    visit(target, path + [rec.key])
            state[rec.key] = 2
            result.append(rec)

        for rec in sorted(recs, key=okey):
            if state.get(rec.key, 0) == 0:
                visit(rec, [])
        return result

    def load(self):
        okey = lambda r: (self.asset_settings(r).get("order", 100), r.key)
        loadable: list[Record] = []
        entries: dict[str, str] = {}
        for rec in sorted(self.records, key=okey):
            if not self.asset_settings(rec).get("enabled", True):
                continue
            entry = self.kernel_entry(rec)
            if entry is None:
                _log(f">> data asset (no kernel entry): {rec.key}")
                continue
            loadable.append(rec)
            entries[rec.key] = entry
        for rec in self.topo_order(loadable):
            ctx = Ctx(self, rec)
            try:
                mod = ctx.import_entry(rec, entries[rec.key])
                rec.instance = mod.create_asset(ctx)
                if hasattr(rec.instance, "on_load"):
                    rec.instance.on_load()
            except Exception as e:
                import traceback
                _log(f"!! load failed, skip {rec.key}: {e}")
                traceback.print_exc()
                rec.instance = None
                continue
            self.loaded.append(rec)
            _log(f">> loaded {rec.key}")

    # -- run ---------------------------------------------------------------
    def run(self):
        if not self.mains:
            _log(">> no main claimed - batch done")
            return
        self.mains.sort()
        prio, _, key, fn = self.mains[-1]
        for _, _, other, _ in self.mains[:-1]:
            _log(f">> main claim by {other} yields to {key}")
        _log(f">> main = {key} (priority {prio})")
        try:
            fn()
        except KeyboardInterrupt:
            pass
        self.shutdown = True

    # -- unload ------------------------------------------------------------
    def unload(self):
        for rec in reversed(self.loaded):
            if hasattr(rec.instance, "on_unload"):
                try:
                    rec.instance.on_unload()
                except Exception as e:
                    _log(f"!! unload error {rec.key}: {e}")
        _log(">> bye")


def main():
    sys.path.insert(0, str(ROOT))
    kernel = Kernel(load_settings(sys.argv))
    kernel.discover()
    kernel.load()
    kernel.run()
    kernel.unload()


if __name__ == "__main__":
    main()
