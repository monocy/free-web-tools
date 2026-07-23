# Agent Development & Jules Workflow Guide

このフォルダは、AIコーディングエージェントが本リポジトリで安全に自律開発とテストを繰り返すためのガイドラインを格納しています。
他のエージェント（Antigravity、Jules、その他）が開発に参加する際は、必ず本手順を読み、厳守してください。

---

## 1. 開発の基本フロー (goal.md 駆動開発)

本プロジェクトの開発は、すべて `goal.md` に定義された Next actions に従って**1スライス（1セッション1機能）**ずつ段階的に実行します。

### ① 目標（goal.md）の設定
- エージェントは開発を開始する前に、必ずリポジトリ直下の `goal.md` を確認または編集します。
- `Next actions` セクションの **1番目（先頭の1行）** に、今回実行させたい具体的な開発・テストタスクを書き込み、コミットしてプッシュします。

### ② Jules セッションのキック (Do)
- 親プロジェクト、または子リポジトリに対して Jules の Do セッションを起動します。
- CLI を使用した起動方法：
  ```powershell
  # 子サイトリポジトリに対してキックする場合
  jules remote new --repo monocy/tool-clock --session "do"
  ```
- 親サイトやポータルの自動処理スクリプト（Jules API経由）を用いて起動することも可能です。

### ③ PRレビューとマージ
- Jules がタスクを完了すると、GitHub 側に自動的にプルリクエスト（PR）が作成されます（`AUTO_CREATE_PR`）。
- エージェントは PR の diff をレビューし、問題なければ GitHub CLI などを用いてマージします：
  ```powershell
  gh pr merge <pr_number> --merge --delete-branch
  ```
- 競合が発生した場合や不要な古いPRは、速やかに `gh pr close` でクローズします。

### ④ セッションのクローズとアーカイブ (重要)
- PR の確認およびマージ・クローズ後は、**必ず Jules の完了済みセッションをアーカイブ（Ready for review の削除）**してください。
  ```powershell
  # ハブのスクリプトを使用
  python E:/Tfiles/Tbox/Sites/.ai/scripts/archive_jules_sessions.py --ready-for-review
  ```
- これにより、JulesのWeb UIやAPI上に完了済みの古いセッションが滞留するのを防ぎます。

### ⑤ 動作検証 (Smoke & Playwright Audit)
- 変更内容をローカルに反映させた後、必ず以下の検証スクリプトを実行し、テストが **`[PASS]`** することを確認します。
  - 煙幕テスト: `python .ai/tests/smoke_app.py`
  - Playwright監査: `python .ai/tests/playwright_audit.py` (存在する場合)

---

## 2. エージェント用運用ルール

- **&& の使用禁止**: Windows (PowerShell) 環境下での連続実行には `&&` を使用せず、必ず `;` で区切ってください。
- **python -c の使用禁止**: ワンライナーで python コードを走らせることは避け、必ず `.ai/scripts/` 内に一時スクリプトを作成して `python.exe` 経由で実行してください。
- **Python環境の指定**: 実行の際は、必ず Windows 側の正しい embedded python パスを明示して実行してください：
  `E:\Tfiles\Tbox\Python\my_python\python311\python.exe`
- **自律修正ループの適用**: テストでコンソールエラーやテンプレートの漏れ（`[[` や `}}` などのインジェクション変数漏れ）、undefinedなどの未定義テキスト漏洩が検出された場合、エージェントは自律的にファイルを修正し、PASSするまでテストを繰り返し再実行しなければなりません。
