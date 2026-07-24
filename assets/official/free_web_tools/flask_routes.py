# -*- coding: utf-8 -*-
from __future__ import annotations
import os
import csv
import json
from pathlib import Path
from flask import Blueprint, render_template, jsonify, send_file, abort

def load_catalog_from_path() -> list[dict]:
    # W:\ style paths. Normalized to forward slashes for cross-platform safety.
    drive_paths = [
        "W:/マイドライブ/Webツール集_spark/Webツール一覧.json",
        "W:/マイドライブ/Webツール集_spark/Webツール一覧.csv",
        "W:/マイドライブ/Webツール集_spark/Webツール一覧.xlsx",
        "W:/マイドライブ/Webツール集_spark/Webツール一覧.gsheet"
    ]
    
    local_dir = Path(__file__).resolve().parent
    fallback_paths = [
        local_dir / "Webツール一覧.json",
        local_dir / "tools_catalog.json"
    ]
    
    all_paths = [Path(p) for p in drive_paths] + fallback_paths
    
    for path in all_paths:
        if not path.is_file():
            continue
            
        ext = path.suffix.lower()
        try:
            if ext == ".json":
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data
            elif ext == ".csv":
                with open(path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    data = []
                    for row in reader:
                        enabled_str = str(row.get("enabled", "true")).lower()
                        enabled = enabled_str in ("true", "1", "yes", "on")
                        data.append({
                            "id": row.get("id", "").strip(),
                            "name": row.get("name", "").strip(),
                            "description": row.get("description", "").strip(),
                            "enabled": enabled,
                            "icon": row.get("icon", "").strip() or "🛠️"
                        })
                    if data:
                        return data
            elif ext == ".xlsx":
                try:
                    import openpyxl
                    wb = openpyxl.load_workbook(path, read_only=True)
                    sheet = wb.active
                    rows = list(sheet.iter_rows(values_only=True))
                    if not rows:
                        continue
                    headers = [str(cell).strip() if cell is not None else "" for cell in rows[0]]
                    data = []
                    for row in rows[1:]:
                        row_dict = dict(zip(headers, row))
                        if not any(row_dict.values()):
                            continue
                        enabled_val = str(row_dict.get("enabled", "true")).lower()
                        enabled = enabled_val in ("true", "1", "yes", "on")
                        data.append({
                            "id": str(row_dict.get("id", "") or "").strip(),
                            "name": str(row_dict.get("name", "") or "").strip(),
                            "description": str(row_dict.get("description", "") or "").strip(),
                            "enabled": enabled,
                            "icon": str(row_dict.get("icon", "") or "").strip() or "🛠️"
                        })
                    if data:
                        return data
                except Exception:
                    pass
            elif ext == ".gsheet":
                # Check if this .gsheet file is actually JSON with a spreadsheet URL
                with open(path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    if isinstance(content, list):
                        return content
        except Exception:
            pass
            
    # Absolute fallback
    return [
        {
            "id": "clock",
            "name": "Live Clock (デジタル時計)",
            "description": "美しくネオンが光る、デスクトップ表示にも最適なフル画面対応のデジタル時計。",
            "enabled": True,
            "icon": "⏰"
        }
    ]

def setup_routes(app, ctx, url_prefix: str):
    bp = Blueprint("official_free_web_tools", __name__, url_prefix=url_prefix or None)
    
    # ツールアセットのベースパス
    tools_dir = Path(__file__).resolve().parent / "tools"

    @bp.get("/")
    def index():
        meta = {
            "site_title": "Free Web Tools",
            "slogan": "便利ツールを1箇所に集約したWebアプリ集"
        }
        
        # カタログデータを読み込み
        catalog = load_catalog_from_path()
        
        tools = []
        for item in catalog:
            if not item.get("enabled", True):
                continue
            tool_id = item.get("id")
            if not tool_id:
                continue
            
            tool_index = tools_dir / tool_id / "index.html"
            if tool_index.is_file():
                tools.append({
                    "id": tool_id,
                    "name": item.get("name") or tool_id.replace("-", " ").title(),
                    "description": item.get("description") or f"便利な {tool_id} ツールです。",
                    "icon": item.get("icon") or "🛠️"
                })
                    
        return render_template("index.html", meta=meta, tools=tools)

    # 各ツールの配信ルート
    @bp.get("/tools/<tool_id>")
    @bp.get("/tools/<tool_id>/")
    def render_tool(tool_id: str):
        if ".." in tool_id or "/" in tool_id or "\\" in tool_id:
            abort(400)
            
        tool_index = tools_dir / tool_id / "index.html"
        if not tool_index.is_file():
            abort(404)
            
        return send_file(str(tool_index), mimetype='text/html')

    @bp.get("/api/tools")
    def api_tools():
        catalog = load_catalog_from_path()
        tools_list = []
        for item in catalog:
            if item.get("enabled", True):
                tool_id = item.get("id")
                if tool_id and (tools_dir / tool_id / "index.html").is_file():
                    tools_list.append(tool_id)
        return jsonify({"status": "ok", "tools": tools_list})



    @bp.get("/i18n.json")
    def get_i18n():
        i18n_path = Path(__file__).resolve().parent / "i18n.json"
        if not i18n_path.is_file():
            abort(404)
        return send_file(str(i18n_path), mimetype='application/json')

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        with open("E:/Tfiles/Tbox/Sites/free-web-tools/flask_error.log", "a", encoding="utf-8") as f:
            f.write(f"Exception: {str(e)}\n")
            f.write(traceback.format_exc())
            f.write("\n" + "="*40 + "\n")
        return f"Error: {str(e)}", 500

    app.register_blueprint(bp)
