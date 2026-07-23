"""aiohttp adapter for common/root (ptapp SubApp contract: create_app)."""
from aiohttp import web

from . import web_core


def create_app() -> web.Application:
    app = web.Application()

    async def index(request):
        ctx = request.app["kernel_ctx"]
        return web.Response(text=web_core.index_html(ctx, "aiohttp"),
                            content_type="text/html")

    async def info(request):
        return web.json_response(web_core.info(request.app["kernel_ctx"]))

    async def shutdown(request):
        return web.json_response(web_core.shutdown(request.app["kernel_ctx"]))

    app.router.add_get("/", index)
    app.router.add_get("/api/info", info)
    app.router.add_post("/api/shutdown", shutdown)
    return app
