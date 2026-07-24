# Agent Development & Jules Workflow Guide

このフォルダは、AIコーディングエージェントが本リポジトリで安全に自律開発とテストを繰り返すためのガイドラインを格納しています。

---

## 1. 開発の基本フロー (Jules 委任型開発)

本リポジトリでは、**エージェント自身が直接ソースコードファイルを編集することは厳密に禁止されています。**
コードの修正や機能の追加は、必ず Jules セッションを通じて実行させてください。

### ① 目標（goal.md）の設定
- エージェントは開発を開始する前に、必ず `goal.md` を編集します。
- `Next actions` セクションの **1番目（先頭の1行）** に、今回 Jules に実行させたい具体的な開発・テストタスクを書き込み、コミットしてプッシュします。

### ② Jules セッションのキック (Do コマンドの直接実行)
- エージェントは必ず以下のコマンドをターミナルで実行して、Jules のセッションを開始しなければなりません：
  ```powershell
  jules remote new --repo monocy/free-web-tools --session "do"
  ```
  ※ コマンドを実行せずに「Julesを待ちます」と報告することはルール違反です。

### ③ PRレビューとマージ
- Jules がタスクを完了すると、GitHub 側に自動的にプルリクエスト（PR）が作成されます。
- エージェントは PR の diff をレビューし、問題なければ GitHub CLI を用いてマージします：
  ```powershell
  gh pr merge <pr_number> --merge --delete-branch
  ```

### ④ セッションのクローズとアーカイブ
- PR マージ後は、必ず Jules の完了済みセッションをアーカイブしてクローズしてください：
  ```powershell
  python E:/Tfiles/Tbox/Sites/.ai/scripts/archive_jules_sessions.py --ready-for-review
  ```

### ⑤ 動作検証
- 変更内容をローカルに反映させた後、必ず以下の検証スクリプトを実行し、テストが `[PASS]` することを確認します：
  - 煙幕テスト: `E:\Tfiles\Tbox\Python\my_python\python311\python.exe .ai/tests/smoke_app.py`
