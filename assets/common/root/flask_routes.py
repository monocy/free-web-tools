"""Flask adapter for common/root (cgi template contract: setup_routes)."""
from flask import Blueprint, jsonify

from . import web_core


def setup_routes(app, ctx, url_prefix: str):
    bp = Blueprint(url_prefix.strip("/").replace("/", "_"), __name__,
                   url_prefix=url_prefix)

    @bp.get("/")
    def index():
        return web_core.index_html(ctx, "flask")

    @bp.get("/api/info")
    def info():
        return jsonify(web_core.info(ctx))

    @bp.post("/api/shutdown")
    def shutdown():
        return jsonify(web_core.shutdown(ctx))

    app.register_blueprint(bp)
