# -*- coding: utf-8 -*-
"""
Playwright-based Quality Audit Script for Portfolio Sites
Detects exposed template variables ([[ ... ]], {{ ... }}), JS runtime errors,
undefined/null text leakages, and broken links.
"""
from __future__ import annotations

import sys
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

# 検出用正規表現
EXPOSED_VAR_PATTERN = re.compile(r"(\[\[\s*.*?\s*\]\]|\{\{\s*.*?\s*\}\})")
UNDEFINED_LEAK_PATTERN = re.compile(r"\b(undefined|NaN|\[object Object\])\b")

SITE_MAPS = {
    "genshin-100x": ["http://127.0.0.1:5035/", "http://127.0.0.1:5035/characters"],
    "splatoon-raiders-100x": ["http://127.0.0.1:5036/"],
    "splatoon-100x": ["http://127.0.0.1:5039/"],
    "memory-market": ["http://127.0.0.1:5037/"],
    "storage-market": ["http://127.0.0.1:5038/"],
    "pc-product-db": ["http://127.0.0.1:5041/"],
    "free-web-tools": [
        "http://127.0.0.1:5042/",
        "http://127.0.0.1:5042/tools/clock",
        "http://127.0.0.1:5042/tools/calculator",
        "http://127.0.0.1:5042/tools/calculator/dev.html",
        "http://127.0.0.1:5042/tools/qr-code",
        "http://127.0.0.1:5042/tools/stopwatch",
        "http://127.0.0.1:5042/tools/timer"
    ],
}

def audit_url(page, url):
    console_errors = []
    page_errors = []
    
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: page_errors.append(str(exc)))

    response = page.goto(url, wait_until="networkidle", timeout=15000)
    status = response.status if response else 0

    if status >= 400:
        return {
            "url": url,
            "passed": False,
            "status": status,
            "issues": [f"HTTP {status} Error"]
        }

    body_text = page.inner_text("body")
    issues = []

    # 1. テンプレート変数露出チェック
    var_matches = list(set(EXPOSED_VAR_PATTERN.findall(body_text)))
    if var_matches:
        issues.append(f"Exposed Template Variables: {', '.join(var_matches[:5])}")

    # 2. undefined / NaN / [object Object] 露出チェック
    undef_matches = list(set(UNDEFINED_LEAK_PATTERN.findall(body_text)))
    if undef_matches:
        issues.append(f"Undefined/NaN/Literal Leak: {', '.join(undef_matches[:5])}")

    # 3. JSエラーチェック
    if console_errors:
        issues.append(f"Console Errors ({len(console_errors)}): {console_errors[0]}")
    if page_errors:
        issues.append(f"Page Exceptions ({len(page_errors)}): {page_errors[0]}")

    # Capture screenshots
    if status == 200:
        # Wait for page layout/Vue hydration to settle
        page.wait_for_timeout(1500)
        
        # 1. Existing PNG thumbnail logic
        tool_match = re.search(r"/tools/([^/]+)", url)
        if tool_match:
            tool_id = tool_match.group(1)
            thumb_dir = Path(__file__).resolve().parents[2] / "static" / "thumbnails"
            thumb_dir.mkdir(parents=True, exist_ok=True)
            screenshot_path = thumb_dir / f"{tool_id}.png"
            page.screenshot(path=str(screenshot_path))
            print(f"[Screenshot saved: {screenshot_path.name}]", end=" ")

        # 2. JPG screenshots for audit verification
        jpg_filename = None
        if url.endswith("/") or url.endswith(":5042"):
            jpg_filename = "portal_index.jpg"
        elif "/tools/" in url:
            if "dev.html" in url:
                jpg_filename = "dev_standalone_result.jpg"
            elif tool_match:
                jpg_filename = f"{tool_match.group(1)}.jpg"
        
        if jpg_filename:
            screenshots_dir = Path(__file__).resolve().parents[2] / "screenshots"
            screenshots_dir.mkdir(parents=True, exist_ok=True)
            jpg_path = screenshots_dir / jpg_filename
            page.screenshot(path=str(jpg_path), type="jpeg", quality=85)
            print(f"[Audit JPG saved: {jpg_filename}]", end=" ")

    return {
        "url": url,
        "passed": len(issues) == 0,
        "status": status,
        "issues": issues
    }

def run_audit(target_urls):
    report = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        for url in target_urls:
            print(f"Auditing: {url} ...", end=" ")
            res = audit_url(page, url)
            if res["passed"]:
                print("[PASS]")
            else:
                print(f"[FAIL] -> {res['issues']}")
            report.append(res)

        browser.close()

    return report

if __name__ == "__main__":
    urls = sys.argv[1:]
    if not urls:
        urls = [url for urls_list in SITE_MAPS.values() for url in urls_list]
    
    results = run_audit(urls)
    has_failure = any(not r["passed"] for r in results)
    sys.exit(1 if has_failure else 0)
