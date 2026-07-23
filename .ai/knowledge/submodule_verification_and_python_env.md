# サブモジュールの検証とPython実行環境に関する知見

## 1. Python実行環境のパス
本プロジェクトのローカル環境における埋め込みPython（embed python）の実体は以下のパスに存在します。
- `E:\Tfiles\Tbox\Python\my_python\python311\python.exe`

ルールに記載されている `../../../python311/python` は環境によってズレが生じる可能性があるため、絶対パスまたは上記の実体を参照してください。

## 2. サブモジュールのテスト実行手順
各ツール（`clock`, `calculator`, `qr-code`, `stopwatch`, `timer`）の動作確認用 Playwright テスト（`.ai/tests/smoke_app.py`）を実行する際は、以下の点に注意してください。
- **実行ディレクトリ (cwd)**: テスト対象のツールディレクトリ（例: `assets/official/free_web_tools/tools/clock`）をカレントディレクトリとして実行する必要があります。親ディレクトリから直接スクリプトを呼び出すとパスの解決に失敗します。
- **コマンド例**:
  `cd assets/official/free_web_tools/tools/clock`
  `E:\Tfiles\Tbox\Python\my_python\python311\python.exe .ai/tests/smoke_app.py`
