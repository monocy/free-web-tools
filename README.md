# Free Web Tools (free-web-tools)

多数の便利ツールを配信する、Gen3 アセットフレームワーク準拠のポータルサイトです。

---

## 1. サイトの設計思想（1ツール1リポジトリ構造）

本プロジェクトは、大量のツールを単一リポジトリ（モノレポ）で管理する肥大化を避けるため、**「親サイトが配信制御を行い、各ツール本体は独立したGitHubリポジトリ（Git Submodule）として管理する」** 疎結合なアーキテクチャを採用しています。

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