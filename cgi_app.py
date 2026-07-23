r"""gen3 CGI/WSGI entry for Sites (system/flask_server + smoke_only)."""
from __future__ import annotations

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import main  # gen3 kernel


def create_app():
    settings = main.load_settings(["cgi_app"])
    fs = settings.setdefault("assets", {}).setdefault("system/flask_server", {})
    fs["enabled"] = True
    fs["smoke_only"] = True
    fs.pop("threaded", None)

    kernel = main.Kernel(settings)
    kernel.discover()
    kernel.load()
    app = kernel.services.get("flask_app")
    if app is None:
        raise RuntimeError(
            "system/flask_server did not provide flask_app "
            "(enabled? smoke_only?)"
        )
    return app


app = create_app()


if __name__ == "__main__":
    from werkzeug.serving import run_simple

    run_simple("127.0.0.1", 8021, app)
