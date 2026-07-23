"""Shared logic for common/root - server-technology agnostic.

routes.py (aiohttp) and flask_routes.py (flask) are thin adapters over
these functions (unification spec U-D3: "common logic in a plain module,
each entry is a thin adapter").
"""
from __future__ import annotations


def info(ctx) -> dict:
    loop = ctx.service("loop")
    return {
        "asset": "common/root",
        "records": [r.key for r in ctx.records],
        "loaded": [r.key for r in ctx.records if r.instance is not None],
        "services": sorted(ctx._kernel.services.keys()),
        "frame": getattr(loop, "frame", None),
    }


def index_html(ctx, server_kind: str) -> str:
    rows = "".join(
        f"<li>{r.key}{' (loaded)' if r.instance is not None else ''}</li>"
        for r in ctx.records)
    return f"""<!doctype html>
<meta charset="utf-8">
<title>asset system prototype</title>
<h1>common/root on <em>{server_kind}</em></h1>
<p>same asset folder, server chosen by composition.</p>
<ul>{rows}</ul>
<p><a href="api/info">api/info</a></p>
"""


def shutdown(ctx) -> dict:
    ctx.request_shutdown()
    return {"ok": True, "message": "shutdown requested"}
