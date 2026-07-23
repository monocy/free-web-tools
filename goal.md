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

1. Integrate the dynamic tool catalog by reading from Google Drive data index (W:\マイドライブ\Webツール集_spark\Webツール一覧.gsheet or local fallbacks) to display the dynamic list of tools on the index page, ensuring users can click cards to navigate to each standalone tool. Validate this navigation and catalog rendering through Playwright quality audit.

## Acceptance criteria

- [x] Playwright quality audit PASS on all routes
- [x] Clock tool (tools/clock) is integrated and passes Playwright audit
- [ ] Dynamic tool catalog is read from Google Drive index and displayed with working navigation
- [ ] Implement dark-mode aesthetic layout with grid list
