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

1. Create and integrate a new tool "big-text" (大きなテキスト表示ツール):
   - Scaffold a new GitHub repository `monocy/tool-bigtext` by copying the `tool-template` directory.
   - Implement the "big-text" tool in `js/workspace.js` and `index.html` allowing settings for text size, color, font-family, text effects (shadow, glow), animations (e.g., bounce, fade, zoom, scroll), and orientation (vertical / horizontal).
   - Implement localized strings in `i18n.json` for both Japanese (`ja`) and English (`en`).
   - Add this tool to `assets/official/free_web_tools/tools/big-text` as a git submodule pointing to the new repository `https://github.com/monocy/tool-bigtext.git`.
   - Update `assets/official/free_web_tools/Webツール一覧.json` to register the new tool.
   - Verify the tool runs correctly and passes local smoke/Playwright tests.

## Acceptance criteria

- [x] Playwright quality audit PASS on all routes
- [x] Clock tool (tools/clock) is integrated and passes Playwright audit
- [ ] Dynamic tool catalog is read from Google Drive index and displayed with working navigation
- [ ] Implement dark-mode aesthetic layout with grid list
- [ ] "Big Text" tool (`big-text`) is created as a submodule and registered in catalog.
- [ ] "Big Text" tool supports size, color, font-family, effects, animations, and vertical/horizontal text flow.
- [ ] "Big Text" passes the local Playwright tests successfully.
