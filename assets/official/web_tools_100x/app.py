# -*- coding: utf-8 -*-
from __future__ import annotations
import json
from pathlib import Path
from flask import render_template, jsonify, request

class App:
    def __init__(self, ctx):
        self.ctx = ctx
        self.root = Path(__file__).resolve().parents[3]
        
    def on_load(self):
        self.ctx.log("web-tools-100x route loader loaded")
        flask_app = self.ctx.service("flask_app")
        if flask_app:
            self.register_routes(flask_app)
            
    def register_routes(self, app):
        @app.route("/")
        def index():
            meta = {
                "site_title": "Webツール集",
                "slogan": "便利ツールを1箇所に集約したWebアプリ集"
            }
            # 空のプレースホルダーデータを返す
            tools = [
                {"id": "wish-timer", "name": "原神 ガチャタイマー", "description": "原神のガチャ終了/開始までの残り時間をカウントダウンします。"},
                {"id": "damage-calc", "name": "原神 ダメージ計算機", "description": "ステータスを入力してダメージ期待値を算出します。"},
                {"id": "er-sim", "name": "元素チャージシミュレーター", "description": "元素オーブ・粒子の生成とチャージ効率を検証します。"}
            ]
            return render_template("index.html", meta=meta, tools=tools)

        @app.route("/api/tools")
        def api_tools():
            return jsonify({"status": "ok", "tools": []})
