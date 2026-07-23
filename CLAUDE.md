# Base
You are a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.

## SYSTEM INFORMATION
- Operating System: Windows
- Default Shell: powershell (also accept cmd)

# General

## Tasks & Workflow
1. Read `goal.md` and `tasks.md` first to understand the current task and Objective.
2. Execute only the first Next action in `goal.md` (one slice at a time).
3. Do NOT edit the main.py kernel or system/common flask frameworks. Focus changes in `assets/official/free_web_tools/` (flask_routes.py, templates, content) or static files.
4. Record your run under `.ai/tasks/{{yyyy_mm_dd_hh_mm_ss}}_{{task_name}}.md`
   - Line 1 MUST be: `# [x] {task_name}` (completed) or `# [] {task_name}` (in_progress).
5. Append daily lines to `tasks_summary.md`.
6. Write findings to `.ai/knowledge/*.md` and index them in `.ai/knowledge/index.md`.

## Execution Rules
- PowerShell: use `;` not `&&`.
- Change only files inside this repository. Do not edit unrelated trees.
- No `python -c` — always write a `.py` file to run.
- CRUD, HTTP requests, and shell commands MUST run via python scripts under `.ai/scripts/`.
- Never `taskkill /F /IM python.exe`.
- Never delete protected files: `AGENTS.md`, `goal.md`, `tasks.md`, `README.md`, `start.bat`, `.ai/`.

## JavaScript (Frontend)
- No `alert` / `confirm` — use DOM notifications.
- No npm — use CDN references only.

## Python Environment (Windows)
Always prefer using the correct embedded python executable:
```powershell
E:\Tfiles\Tbox\Python\my_python\python311\python.exe {script_path}
```
Or use the local virtual environment:
```powershell
.venv\Scripts\python.exe {script_path}
```

## Jules Self-Correction Loop (CRITICAL)
Every time you make any route, logic, or markup changes:
1. You MUST run the local verification tests:
   ```powershell
   E:\Tfiles\Tbox\Python\my_python\python311\python.exe .ai/tests/smoke_app.py
   ```
   And run Playwright audit checks if available:
   ```powershell
   E:\Tfiles\Tbox\Python\my_python\python311\python.exe .ai/tests/playwright_audit.py
   ```
2. If any test fails (due to template leakage like `[[` or `}}`, JS runtime exception, undefined/NaN leak, or HTTP 404/500 errors), you MUST automatically inspect the failed files, apply code fixes (e.g. wrap scripts in IIFE, add optional chaining, configure Vue v-cloak), and re-run the tests.
3. Repeat this check-and-fix loop until all tests PASS successfully before proposing the plan completion or PR.
