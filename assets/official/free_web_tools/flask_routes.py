# -*- coding: utf-8 -*-
from __future__ import annotations
import os
from pathlib import Path
from flask import Blueprint, render_template, jsonify, send_file, abort

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
        
        # 動的にツールの一覧をスキャン
        tools = []
        if tools_dir.is_dir():
            for d in sorted(tools_dir.iterdir()):
                if d.is_dir() and (d / "index.html").is_file():
                    tool_id = d.name
                    name = tool_id.replace("-", " ").title()
                    # 個別ツール名・説明の表示マッピング
                    if tool_id == "clock":
                        name = "Live Clock (デジタル時計)"
                        desc = "美しくネオンが光る、デスクトップ表示にも最適なフル画面対応のデジタル時計。"
                    else:
                        desc = f"便利な {name} ツールです。"
                        
                    tools.append({
                        "id": tool_id,
                        "name": name,
                        "description": desc
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
        tools_list = []
        if tools_dir.is_dir():
            for d in tools_dir.iterdir():
                if d.is_dir() and (d / "index.html").is_file():
                    tools_list.append(d.name)
        return jsonify({"status": "ok", "tools": tools_list})

    app.register_blueprint(bp)
