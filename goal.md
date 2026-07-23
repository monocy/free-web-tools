# Goal

## Status

`in_progress`

## Objective

Google Driveの「Webツール集_spark」のデータ（Webツール一覧.gsheet等）を正として、Vue 3 + Tailwind CSS を用いた便利ツール集（free-web-tools）を自律構築する。

## UI standards

- Tailwind / Vue 3 CDN、delimiters `[[` `]]`
- デフォルト dark モード
- スマホ対応レスポンシブナビ

## Next actions

1. Run Playwright quality audit (python .ai/tests/playwright_audit.py) to ensure the baseline template functions without console errors or mustache leaks.
2. Read Drive data index of Webツール集_spark (W:\マイドライブ\Webツール集_spark\Webツール一覧.gsheet) and implement a dynamic list of tools on the index page.
3. Scaffold initial sub-tools structure as configured in the drive list.

## Acceptance criteria

- [ ] Playwright quality audit PASS on all routes
- [ ] Read tools catalog list from Drive index and display on portal
- [ ] Implement dark-mode aesthetic layout with grid list
