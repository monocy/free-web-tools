# Goal

## Status

`completed`

## Objective

Google Driveの「Webツール集_spark」のデータ（Webツール一覧.gsheet等）を正として、Vue 3 + Tailwind CSS を用いた便利ツール集（free-web-tools）を自律構築する。

## UI standards

- Tailwind / Vue 3 CDN、delimiters `[[` `]]`
- デフォルト dark モード
- スマホ対応レスポンシブナビ

## Next actions

1. Update the "big-text" tool (`assets/official/free_web_tools/tools/big-text`):
   - Modify the layout so clicking the big text area toggles an editing window/panel that slides up or appears at the bottom.
   - Implement "close-on-click-outside" behavior for this panel.
   - Ensure the editing panel is inline scrollable when content overflows.
   - Use a clear, native color picker for the text color settings (making it the primary color picker UI).
   - Ensure these changes pass local smoke and verification tests. (COMPLETED)

## Acceptance criteria

- [x] Playwright quality audit PASS on all routes
- [x] Clock tool (tools/clock) is integrated and passes Playwright audit
- [x] Dynamic tool catalog is read from Google Drive index and displayed with working navigation
- [x] Implement dark-mode aesthetic layout with grid list
- [x] "Big Text" tool (`big-text`) is created and registered in catalog.
- [x] "Big Text" editing panel opens when clicking the big text area, and closes when clicking outside the panel.
- [x] "Big Text" editing panel supports inline scrolling.
- [x] Text color setting in "Big Text" utilizes a color picker UI.
- [x] "Big Text" passes the local Playwright/smoke tests successfully.
