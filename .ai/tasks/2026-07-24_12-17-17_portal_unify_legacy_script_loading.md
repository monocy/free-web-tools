# [x] portal_unify_legacy_script_loading

## タスク内容
ポータル全体およびすべての個別ツール（およびテンプレート）において、アセットのロード方法から ES Modules（`import`/`export`）および `<script type="module">` を完全に排除し、相対パス基準のレガシーな標準 `<script>` タグによるグローバルロードに統一します。これにより、完全なオフライン環境やローカル直接起動（ダブルクリック）であっても、一切の CORS 制限を受けることなくポータルおよびツールが 100% 確実に動作するようにします。

1. **共通アセットの非モジュール化 (static/js/settings_modal.js & background_modal.js)**:
   - `static/js/settings_modal.js` の `export default {` を `const SettingsModal = {` に変更する。
   - `static/js/background_modal.js` の `export default {` を `const BackgroundModal = {` に変更する。

2. **親ポータルのインポート修正 (templates/base.html)**:
   - `<head>` 内（または `<body>` の該当箇所）で、通常のスクリプトタグを使用して共通ファイルを順に読み込む。
     ```html
     <script src="/static/js/portal_common.js"></script>
     <script src="/static/js/settings_modal.js"></script>
     <script src="/static/js/background_modal.js"></script>
     ```
   - メインスクリプトブロックを `<script type="module">` から通常の `<script>` に変更する。
   - 内部の `import SettingsModal ...`, `import BackgroundModal ...`, `import { usePortalCommon } ...` の記述をすべて削除する。

3. **個別ツールのインポート修正 (tools/calculator/index.html)**:
   - 電卓本番用 HTML において、共通 CSS/JS をパブリック URL ではなくローカル相対パスでのレガシーロードに変更する。
     ```html
     <link rel="stylesheet" href="../../static/css/portal.css">
     <script src="../../static/js/portal_common.js"></script>
     <script src="../../static/js/settings_modal.js"></script>
     <script src="../../static/js/background_modal.js"></script>
     <script src="./js/workspace.js"></script>
     ```
   - メインスクリプトを `type="module"` から通常の `<script>` に変更し、内部の `import` 記述（SettingsModal, BackgroundModal, usePortalCommon）をすべて削除する。

4. **新規追加用テンプレートの修正 (tool-template/index.html)**:
   - 電卓と同様に、相対パスによるレガシーロード構成（`../../static/css/portal.css` など）に変更し、`import` 記述をすべて排除して通常の `<script>` タグに統一する。

5. **テスト検証**:
   - `python .ai/tools/jules/verify_portal.py` および `python .ai/tools/jules/run_all_tests.py` を実行して、すべてのポータル監査および個別ツールスモークテストが正常に PASS することを確認する。
   - ローカルブラウザで `calculator/index.html` および `calculator/dev.html` を直接ダブルクリックで開き、CORS エラーなく完全にポータル共通デザインや設定モーダルがロードされて動作することを目視確認する。
   - 本番デプロイ前の Playwright 動作結果スクリーンショット（`.jpg`）が正しく保存されることを確認する。

6. **本番デプロイの実行**:
   - `python E:\Tfiles\Tbox\Sites\.ai\scripts\deploy_site_to_lolipop.py --site free-web-tools --verify --expect "Free Web Tools"` を実行して本番へアップロードする。

7. **コミット・プッシュとバンプ**:
   - 各サブモジュールの変更（`index.html` 等）をコミット・プッシュし、親リポジトリ側でバンプさせてプッシュする。

## 実行履歴
- 2026-07-24 12:17:17 タスク起票。Julesへの実行引き渡し待ち。
