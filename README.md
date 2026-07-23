# Free Web Tools (free-web-tools)

多数の便利ツールを配信する、Gen3 アセットフレームワーク準拠のポータルサイトです。

---

## 1. サイトの設計思想（1ツール1リポジトリ構造）

本プロジェクトは、大量のツールを単一リポジトリ（モノレポ）で管理する肥大化を避けるため、**「親サイトが配信制御を行い、各ツール本体は独立したGitHubリポジトリ（Git Submodule）として管理する」** 疎結合なアーキテクチャを採用しています。

### ローカル配置ルール
- **ツールの個別フォルダ（例: `Sites/tool-clock`）はローカル直下には配置しません。**
- すべてのツールのローカル実体は、`free-web-tools` リポジトリ内のサブモジュールパス（`assets/official/free_web_tools/tools/<tool_id>`）に展開されたものを使用します。
- これにより、無駄なローカルフォルダの重複を排除し、作業スペースのクリーン化とパスの統一を実現しています。

### ディレクトリ構造
```
free-web-tools/
│
├── assets/
│   └── official/
│       └── free_web_tools/
│           ├── flask_routes.py  # 動的ツールスキャン・配信ルーティング
│           └── tools/           # ★各ツール（Git Submodule）の配置先
│               └── clock/       # デジタル時計ツール (本体: monocy/tool-clock)
│                   └── index.html
│
├── templates/
│   ├── base.html
│   └── index.html
├── main.py                      # Gen3 カーネルブートストラップ
└── goal.md                      # Julesタスク状態管理
```

### 動的配信の仕組み
* **自動スキャン**: `flask_routes.py` が `tools/` 配下のサブディレクトリを自動スキャンし、`index.html` が存在するものを自動検知してポータルのトップページ（`/`）にカードリンクを表示します。
* **ルーティング**: `/tools/<tool_id>` にアクセスされた際、該当するサブモジュールフォルダの `index.html` を `send_file` にて動的に配信します。

---

## 2. 開発ワークフロー

### ① 新しいツールの追加手順
1. 新たなツールリポジトリをGitHub上に作成します（例: `monocy/tool-calculator`）。
2. 親リポジトリ（`free-web-tools`）の `tools` ディレクトリ配下にサブモジュールとして追加します：
   ```bash
   git submodule add https://github.com/monocy/tool-calculator.git assets/official/free_web_tools/tools/calculator
   ```
3. 親リポジトリ側でサブモジュールの追加をコミット・プッシュします：
   ```bash
   git add .
   git commit -m "feat: add calculator tool submodule"
   git push origin main
   ```

### ② 既存ツールの修正・開発手順
各ツールのローカル開発フォルダ（例: `Sites/tool-clock`）を個別に置く必要はありません。親リポジトリ内のサブモジュールディレクトリで直接開発を行います。

1. 対象ツールのサブモジュールディレクトリに移動します：
   ```bash
   cd assets/official/free_web_tools/tools/clock
   ```
2. このフォルダ自体が独立したGitリポジトリ（`tool-clock`）になっているため、通常通りGit操作が可能です：
   ```bash
   # mainブランチをチェックアウトしてコードを修正
   git checkout main
   # (ファイルを編集...)
   
   # ツールリポジトリに変更をコミット・プッシュ
   git add .
   git commit -m "style: optimize neon glow shadow"
   git push origin main
   ```
3. 親リポジトリのディレクトリに戻り、親リポジトリ側でもサブモジュールの更新（参照コミットIDの変更）をプッシュします：
   ```bash
   cd ../../../../..
   git add assets/official/free_web_tools/tools/clock
   git commit -m "chore: bump clock submodule to latest commit"
   git push origin main
   ```

---

## 3. 次回開発への引き継ぎ事項 (Next Session Handover)

### 現在の状況
- **多言語対応 (i18n) の自動実装フェーズ**:
  - 全5ツール（`clock`, `calculator`, `qr-code`, `stopwatch`, `timer`）の個別リポジトリに対し、Jules による一括多言語対応セッションを起動済みです。
  - 各サブモジュール内に `i18n.json` が作成され、Vue3から動的に読み込まれ、UI切替ボタンが実装される予定です。
- **共通開発テンプレートの配備**:
  - 新規ツールを同一の UX（多言語、テーマ切替、背景画像調整、設定保存、全画面対応）で量産できるよう、[tool-template/](file:///E:/Tfiles/Tbox/Sites/free-web-tools/tool-template/) フォルダと [TEMPLATE_GUIDE.md](file:///E:/Tfiles/Tbox/Sites/free-web-tools/TEMPLATE_GUIDE.md) を整備・プッシュ完了しています。

### 次回セッションでのアクション
1. **各ツールの Jules PR レビューとマージ**:
   - `clock`, `calculator`, `qr-code`, `stopwatch`, `timer` の各リポジトリに提案された Jules の PR を順次確認し、マージします。
2. **サブモジュールの参照コミットID更新**:
   - 親リポジトリのサブモジュールを最新コミットに追従（`git submodule update --remote` 等）し、親プロジェクトをコミットしてプッシュします。
3. **テスト検証**:
   - 各ツールディレクトリ内で単体 Playwright 監査（`python .ai/tests/smoke_app.py`）を実行し、コンソールエラーや言語切り替えが正常に動作するか確認します。