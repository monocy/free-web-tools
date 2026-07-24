# -*- coding: utf-8 -*-
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import main as boot

def main():
    settings = boot.load_settings([])
    settings.setdefault("assets", {}).setdefault("system/flask_server", {})
    settings["assets"]["system/flask_server"]["smoke_only"] = True
    settings["assets"]["system/flask_server"]["enabled"] = True
    
    kernel = boot.Kernel(settings)
    kernel.discover()
    kernel.load()
    
    app = kernel.services.get("flask_app")
    if app is None:
        raise RuntimeError("Flask app load failed.")
        
    client = app.test_client()
    rv = client.get("/")
    assert rv.status_code == 200
    assert "Free Web Tools".encode("utf-8") in rv.data
    
    # clock tool check
    rv = client.get("/tools/clock", follow_redirects=True)
    assert rv.status_code == 200
    assert "Clock".encode("utf-8") in rv.data
    print("[PASS] Smoke app check")
    
    kernel.unload()
    return 0

if __name__ == "__main__":
    sys.exit(main())
