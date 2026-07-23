# Web Tool Scaffolding & Development Guide

このドキュメントは、`free-web-tools` プロジェクトに新しく便利ツールを追加する際、ユーザー体験（UX）と品質を共通化するための**開発ガイドライン**です。
すべての新規ツールは、本リポジトリの [tool-template/](file:///E:/Tfiles/Tbox/Sites/free-web-tools/tool-template/) ディレクトリをコピーして作成されます。

---

## 1. 共通化されたアセット仕様

新規ツールを作成する際は、以下の5つの基本要素を必ず備える必要があります。

### ① 多言語対応 (i18n)
- **デフォルト英語**: 翻訳ファイル `i18n.json` には英語 (`en`) と日本語 (`ja`) を必ず定義します。
- **自動判別**: 初回起動時は `navigator.language` に基づいて、日本語環境であれば `ja`、それ以外は `en` をデフォルトとして自動適用します。
- **動的ローダー**: Vue 3 の `onMounted` で `./i18n.json` を非同期フェッチして適用し、画面上はリアクティブ翻訳関数 `[[ t('key') ]]` で描画します。
- **言語切り替えUI**: 画面ヘッダーまたはコントロールパネルに言語トグラー（`EN / JA`）をプレミアムなデザインで設置します。

### ② テーマカラー切り替え (Theme Switcher)
- CSS変数（カスタムプロパティ）を用いて、ライトモード（`theme-light`）、ダークモード（`default`）、サイバーネオンテーマ（`theme-neon`）を切り替えられるようにします。
- ユーザーによるテーマ選択は、Vue状態からルート要素（`html` または `body`）の `class` に動的にバインドします。

### ③ 背景画像のパーソナライズ (Background Customizer)
- 設定モーダルに以下の背景画像調整機能を搭載します。
  - **背景画像 URL**: ユーザーが好みの画像のアドレスを入力可能。
  - **不透明度 (Opacity)**: スライダーで 0% 〜 80% まで透過度を調整。
  - **ぼかし (Blur)**: `backdrop-filter: blur(Npx)` を用いて背景画像のぼかし量を 0px 〜 24px までスライダーでシームレスに変更。
- 背景画像は専用のレイヤーに分離して背面に配置し、コンテンツはガラスモルフィズムカード（`backdrop-blur-md`）で美しく浮かび上がらせる設計とします。

### ④ 永続化保存 (LocalStorage persistence)
- 上記の設定（言語、テーマ、背景画像のURL、不透明度、ぼかし強度）は、すべて一つの JSON オブジェクトとして `localStorage` (キー: `tool-settings`) にリアルタイムに自動保存・復元されます。

### ⑤ 全画面表示 (Fullscreen API)
- 全画面表示の切り替え（Enter / Exit Fullscreen）ボタンを設置し、ブラウザの全画面APIをトグル呼び出しします。
- キーボードの `ESC` キーなどによるブラウザ標準の全画面解除イベントとも同期するよう監視を実装します。

---

## 2. 雛形コードの構成

共通雛形リポジトリは以下の構造になっています：

```
tool-template/
├── index.html       # プレミアムUI、Vue3ロジック、設定モーダル、i18n、CSS変数テーマ
├── i18n.json        # 翻訳辞書データ (ja / en)
└── .ai/
    └── tests/
        └── smoke_app.py  # 軽量ローカルサーバーを起動しPlaywrightで品質を自動監査するスクリプト
```

### 新規ツールの追加プロセス

1. **新規リポジトリの作成**:
   GitHub上に `monocy/tool-<new-id>` リポジトリを新規作成します。
2. **テンプレートのコピー**:
   [tool-template/](file:///E:/Tfiles/Tbox/Sites/free-web-tools/tool-template/) の全ファイルをコピーしてそのリポジトリにコミットします。
3. **ツールの固有実装**:
   `index.html` 内のメインワークスペース（`<!-- Placeholder Workspace Area -->`）部分に、電卓や時計などのツール固有のVue 3ロジックとHTMLを実装します。
   UI用の文言は随時 `i18n.json` に追加し、必ず `[[ t('key') ]]` で出力させます。
4. **検証とプッシュ**:
   `python .ai/tests/smoke_app.py` を実行して、エラーがないことを確認の上、GitHubへプッシュします。
5. **親へのサブモジュール追加**:
   親リポジトリ `free-web-tools` にて Git サブモジュールとして登録します。
   ```bash
   git submodule add https://github.com/monocy/tool-<new-id>.git assets/official/free_web_tools/tools/<new-id>
   ```

これにより、今後追加されるすべてのツールがプレミアムで洗練された一貫性のあるカスタマイズ体験を標準で備えることになります。
