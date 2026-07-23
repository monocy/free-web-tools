# [x] portal_common_assets

## タスク内容
ポータルのCSSスタイル（テーマ、スクロールバー等）およびVue 3の設定・テーマ・文字サイズ・背景管理などのコアロジックを共通アセット（モジュール）化し、親ポータルおよびすべての個別ツール（clock, calculator, qr-code, stopwatch, timer）で一貫して再利用できるようにリファクタリングします。

1. **共通 CSS (`static/css/portal.css`) の新設**:
   - `assets/official/free_web_tools/static/css/portal.css` を新規作成する。
   - base.html に直書きされていたカラーテーマ変数（`:root`, `.theme-light`, `.theme-neon`）、細型＆半透明スクロールバー設定、オーバーレイスクロールバー設定、グラスモルフィズムヘッダー等のスタイルを移行する。

2. **共通 JS (`static/js/portal_common.js`) の新設**:
   - `assets/official/free_web_tools/static/js/portal_common.js` を新規作成する。
   - `settings` の定義、LocalStorage保存・復元、テーマ適用、fontSize変更時のhtml要素フォントサイズ動的書き換え、全画面状態監視、翻訳ヘルパー（t）等をカプセル化した Compositions 関数 `usePortalCommon(translations)` を `export` する。

3. **配信ルートの追加 (flask_routes.py)**:
   - `/static/css/portal.css` および `/static/js/portal_common.js` を配信する Blueprint 静的配信ルートを flask_routes.py に追加する。

4. **親ポータルおよびテンプレートへの適用 (templates/base.html)**:
   - templates/base.html 内の `<style>` 内の移行済みCSSを削除し、外部CSSとしてインポートする。
   - Vue 3 の setup() 内を `usePortalCommon` に置き換え、ロジックをリファクタリングする。

5. **個別ツールへの適用**:
   - `tool-template/index.html` および 5 つのツール（`clock`, `calculator`, `qr-code`, `stopwatch`, `timer`）の `index.html` に対し、共通CSSを head で読み込ませ、Vue モジュールとして `portal_common.js`、`settings_modal.js`、`background_modal.js` を読み込み・マウントするように統合する。
   - 各個別ツールの `i18n.json` に共通設定項目の翻訳キーが漏れなく含まれるようにする。

6. **テスト検証**:
   - `verify_portal.py` および `run_all_tests.py` を実行して、親サイトおよび全ツールのスモークテストが正常に PASS することを確認する。
   - 変更されたファイルをコミット・プッシュする。

## 実行履歴
- 2026-07-24 08:42:24 タスク起票。Julesへの実行引き渡し待ち。
