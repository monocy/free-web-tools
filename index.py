#!/usr/local/bin/python3
"""CGI entry for free-web-tools (gen3)."""
import cgitb

cgitb.enable()

import os
import sys

_APP_ROOT = os.path.dirname(os.path.abspath(__file__))
_REMOTE_ROOT = "/home/users/1/parallel.jp-stone/web/free-web-tools"
for _p in (_REMOTE_ROOT, _APP_ROOT):
    if _p and _p not in sys.path:
        sys.path.insert(0, _p)

os.environ.setdefault("PYTHONIOENCODING", "utf-8")

from wsgiref.handlers import CGIHandler

from cgi_app import app


class FixedScriptNameCGIHandler(CGIHandler):
    def add_cgi_vars(self):
        super().add_cgi_vars()
        script_name = os.environ.get("SCRIPT_NAME", "")
        if script_name.endswith("/index.py"):
            cleaned = script_name[: -len("/index.py")]
            os.environ["SCRIPT_NAME"] = cleaned
            self.os_environ["SCRIPT_NAME"] = cleaned


FixedScriptNameCGIHandler().run(app)
