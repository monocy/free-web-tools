"""Flask web host as an asset (cgi flask template equivalent).

Sites vendored copy of 2026-07-18_test_asset_system flask_server, with:
- hosts.flask.prefix ("" = site at /)
- template_folder / static_folder relative to project ROOT
- smoke_only: build app + provide flask_app, do not claim_main
"""
from __future__ import annotations

import pathlib
import threading
import time

ROOT = pathlib.Path(__file__).resolve().parents[3]


class FlaskServer:
    def __init__(self, ctx):
        self.ctx = ctx
        self.caps = set(ctx.settings.get("capabilities", ["web"]))
        self.thread: threading.Thread | None = None

    def flask_entry(self, rec) -> str | None:
        hosts = rec.meta.get("hosts")
        if isinstance(hosts, dict):
            ent = hosts.get("flask")
            if not isinstance(ent, dict):
                return None
            req = set(ent.get("requires") or [])
            if not req <= self.caps:
                return None
            return ent.get("entry", "flask_routes.py")
        if (rec.path / "flask_routes.py").is_file():
            return "flask_routes.py"
        return None

    def flask_prefix(self, rec) -> str:
        hosts = rec.meta.get("hosts") or {}
        ent = hosts.get("flask") if isinstance(hosts, dict) else None
        if isinstance(ent, dict) and "prefix" in ent:
            return ent.get("prefix") or ""
        settings = rec.meta.get("settings") or {}
        if "url_prefix" in settings:
            return settings.get("url_prefix") or ""
        return f"/{rec.key}"

    def on_load(self):
        from flask import Flask
        tpl = self.ctx.settings.get("template_folder", "templates")
        static = self.ctx.settings.get("static_folder")
        kwargs = {"template_folder": str(ROOT / tpl)}
        if static:
            sp = ROOT / static
            if sp.is_dir():
                kwargs["static_folder"] = str(sp)
        self.app = Flask("asset_host", **kwargs)
        mounted = []
        for rec in self.ctx.records:
            entry = self.flask_entry(rec)
            if entry is None or not (rec.path / entry).is_file():
                continue
            try:
                mod = self.ctx.import_entry(rec, entry)
                prefix = self.flask_prefix(rec)
                # Guest assets need their own Ctx (dir/settings), not the host's.
                guest_ctx = type(self.ctx)(self.ctx._kernel, rec)
                mod.setup_routes(self.app, guest_ctx, url_prefix=prefix)
                mounted.append(f"{rec.key}@{prefix or '/'}")
            except Exception as e:
                self.ctx.log(f"mount failed {rec.key}: {e}")
        self.ctx.log("mounted:", mounted or "(none)")
        self.ctx.provide("web_server", self)
        self.ctx.provide("flask_app", self.app)
        if self.ctx.settings.get("smoke_only"):
            self.ctx.log("smoke_only: app ready, not serving")
            return
        if self.ctx.settings.get("threaded", False):
            self.thread = threading.Thread(
                target=self._serve, name="flask-server", daemon=True)
            self.thread.start()
        else:
            self.ctx.claim_main(self._serve,
                                priority=self.ctx.settings.get("priority", 5))

    def _serve(self):
        from werkzeug.serving import make_server
        host = self.ctx.settings.get("host", "127.0.0.1")
        port = int(self.ctx.settings.get("port", 8802))
        srv = make_server(host, port, self.app, threaded=True)
        t = threading.Thread(target=srv.serve_forever, daemon=True)
        t.start()
        self.ctx.log(f"serving http://{host}:{port}/")
        while not self.ctx.shutdown_requested:
            time.sleep(0.2)
        srv.shutdown()
        t.join(timeout=5)
        self.ctx.log("server stopped")

    def on_unload(self):
        if self.thread is not None:
            self.thread.join(timeout=5)


def create_asset(ctx):
    return FlaskServer(ctx)
