# [x] portal_ui_fine_tuning

## タスク内容
ポータルの UI について、右下の全画面表示ボタンを目立たないように微調整し、言語切替プルダウンの各言語ラベルをネイティブ表記に固定します。

1. **全画面表示ボタンの微調整 (base.html)**:
   - `templates/base.html` 内の右下全画面表示フローティングボタンについて、位置をより端（例: `bottom-3 right-3`）に寄せ、サイズを小さく（例: `w-8 h-8`、アイコンサイズも縮小）する。
   - 目立たなくするために初期不透明度を `opacity-40` 程度に落とし、ホバー時のみ `hover:opacity-90` になるようにスタイルを調整する。

2. **言語選択プルダウンのラベル調整 (settings_modal.js)**:
   - `assets/official/free_web_tools/static/js/settings_modal.js` の言語切替プルダウン（`<select>`）のオプション表示テキストを、現在の言語設定に依存しない固定表記（ネイティブ表記）にする。
   - `value="ja"` は常に `日本語`、`value="en"` は常に `English` と表示されるように修正する。

3. **テスト検証**:
   - `python .ai/tools/jules/verify_portal.py` を実行して、Playwright 監査テストが正常に PASS することを確認する。
   - 変更された親リポジトリのファイルをコミット・プッシュする。

## 実行履歴
- 2026-07-24 07:29:36 タスク起票。Julesへの実行引き渡し待ち。
