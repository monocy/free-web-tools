# -*- coding: utf-8 -*-
from __future__ import annotations
from flask import Blueprint, render_template, jsonify, request

def setup_routes(app, ctx, url_prefix: str):
    bp = Blueprint("official_web_tools_100x", __name__, url_prefix=url_prefix or None)

    @bp.get("/")
    def index():
        meta = {
            "site_title": "Free Web Tools",
            "slogan": "便利ツールを1箇所に集約したWebアプリ集"
        }
        tools = [
            {"id": "wish-timer", "name": "原神 ガチャタイマー", "description": "原神のガチャ終了/開始までの残り時間をカウントダウンします。"},
            {"id": "damage-calc", "name": "原神 ダメージ計算機", "description": "ステータスを入力してダメージ期待値を算出します。"},
            {"id": "er-sim", "name": "元素チャージシミュレーター", "description": "元素オーブ・粒子の生成とチャージ効率を検証します。"}
        ]
        return render_template("index.html", meta=meta, tools=tools)

    @bp.get("/api/tools")
    def api_tools():
        return jsonify({"status": "ok", "tools": []})

    app.register_blueprint(bp)
