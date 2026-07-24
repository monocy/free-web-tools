# [x] portal_dev_html_standalone_file_cors_fix

## タスク内容
`dev.html` をローカルのファイルシステム (`file:///` プロトコル) からダブルクリック等で直接ブラウザで開いた際に、ES Modules インポート (`type="module"` 内の `import ... from './js/workspace.js'`) がブラウザの CORS ポリシーでブロックされて起動不能になるバグを修正します。コンポーネントファイルをインライン直書きするのではなく、モジュール構文を使わずにレガシーな通常の `<script src="./js/workspace.js"></script>` として読み込む方式に統一します。

1. **電卓コンポーネントの非モジュール化 (tools/calculator/js/workspace.js)**:
   - `calculator/js/workspace.js` 内から `export default ToolWorkspace;` などのモジュール構文を削除し、単に `const ToolWorkspace = { ... };` とするだけの標準的なグローバルスコープ定義の JS ファイルにする。

2. **本番用HTMLおよび開発用HTMLの修正 (tools/calculator/index.html & dev.html)**:
   - `calculator/index.html` と `dev.html` の両方の HTML において、`<script src="./js/workspace.js"></script>` タグを追加してコンポーネントファイルを読み込む。
   - `calculator/index.html` および `dev.html` 内のメインスクリプトから `import ToolWorkspace` 記述を削除し、グローバル変数として読み込まれた `ToolWorkspace` を `createApp` の `components` に直接登録・マウントする。
   - `dev.html` のメインスクリプトは `type="module"` ではなく、通常の `<script>` タグにすることで、CORSポリシーによるブロックを完全に回避し、ダブルクリックで 100% 確実に起動するようにする。

3. **新規ツール用テンプレートの修正 (tool-template/)**:
   - `tool-template/index.html`, `tool-template/dev.html`, `tool-template/js/workspace.js` も同様に通常の `<script src="./js/workspace.js"></script>` による読み込み・グローバル登録構成に変更する。

4. **テスト検証**:
   - `python .ai/tools/jules/verify_portal.py` および `python .ai/tools/jules/run_all_tests.py` を実行して、ポータル検証およびスモークテストが正常に PASS することを確認する。
   - ローカルのブラウザで `calculator/dev.html` を直接ダブルクリックして開き、CORS エラーが出ず、電卓が正常に動作することを確認する。

5. **本番デプロイの実行**:
   - `python E:\Tfiles\Tbox\Sites\.ai\scripts\deploy_site_to_lolipop.py --site free-web-tools --verify` を実行し、修正した `dev.html` および `workspace.js` を本番サーバーへアップロードする。

6. **コミット・プッシュとバンプ**:
   - `calculator` サブモジュール内で変更をコミット・プッシュし、親リポジトリ側でバンプさせてプッシュする。

## 実行履歴
- 2026-07-24 11:42:10 タスク起票。
- 2026-07-24 11:43:24 ユーザー指示に基づき、インライン化ではなくレガシーな <script> 読み込みによる共有構成に変更。Julesへ再送。
