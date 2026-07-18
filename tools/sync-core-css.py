#!/usr/bin/env python3
"""
sync-core-css.py — inline the canonical core stylesheet into every skill page.

WHY THIS EXISTS
---------------
Inlining the core CSS into <head> is the single biggest first-paint win we have
(it took the prenatal page from LCP 7.0s -> 1.8s by removing a render-blocking
stylesheet). But this repo has no build step, so "inline it" would otherwise mean
hand-copying ~21KB into every page and letting the copies drift apart.

This script makes option A safe: `public/css/flow-b-v3.css` is the SINGLE SOURCE
OF TRUTH, and every page carries a generated copy of it inside

    <style data-inlined-from="/css/flow-b-v3.css"> ... </style>

Edit the .css file, run this script, commit. Never hand-edit the inlined block —
it will be overwritten on the next sync.

WHAT IT DOES PER PAGE
---------------------
1. If the page already has the inlined <style> block, its contents are replaced.
2. If the page instead loads the stylesheet render-blocking, e.g.
      <link rel="stylesheet" href="/css/flow-b-v3.css?v=v3-book2">
   that <link> is REPLACED by the inlined block (this is the actual speed fix).
3. Pages that reference neither are skipped and reported.

Per-page CSS lives in a SEPARATE, unmarked <style> block and is never touched.

USAGE
-----
    python tools/sync-core-css.py            # apply to all pages
    python tools/sync-core-css.py --check    # verify only; non-zero exit if stale
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CORE = ROOT / "public" / "css" / "flow-b-v3.css"
OPEN_TAG = '<style data-inlined-from="/css/flow-b-v3.css">'
CLOSE_TAG = "</style>"

# Pages that should carry the core stylesheet. Add new skill pages here.
PAGES = [
    "prenatal-massage-calgary",
    "lymphatic-drainage-massage-calgary",
    "deep-tissue-massage-calgary",
    "tmj-massage-calgary",
    "sports-massage-calgary",
]

# Matches a render-blocking <link> to the core stylesheet, with or without ?v=
LINK_RE = re.compile(
    r'[ \t]*<link[^>]*rel="stylesheet"[^>]*href="/css/flow-b-v3\.css(?:\?[^"]*)?"[^>]*>[ \t]*\n?'
)
BLOCK_RE = re.compile(
    re.escape(OPEN_TAG) + r".*?" + re.escape(CLOSE_TAG), re.S
)


def main() -> int:
    check_only = "--check" in sys.argv
    css = CORE.read_text(encoding="utf-8").strip("\n")
    block = f"{OPEN_TAG}\n{css}\n{CLOSE_TAG}"

    stale, changed, skipped = [], [], []

    for name in PAGES:
        page = ROOT / "public" / name / "index.html"
        if not page.exists():
            skipped.append(f"{name} (no index.html)")
            continue

        html = page.read_text(encoding="utf-8")

        if BLOCK_RE.search(html):
            new_html = BLOCK_RE.sub(lambda _: block, html, count=1)
            how = "updated inlined block"
        elif LINK_RE.search(html):
            # The speed fix: swap the render-blocking <link> for the inlined block.
            new_html = LINK_RE.sub(block + "\n", html, count=1)
            how = "REPLACED render-blocking <link> -> inlined"
        else:
            skipped.append(f"{name} (no inlined block and no core <link>)")
            continue

        if new_html == html:
            print(f"  ok        {name}")
            continue

        if check_only:
            stale.append(name)
            print(f"  STALE     {name}  ({how})")
        else:
            page.write_text(new_html, encoding="utf-8", newline="")
            changed.append(name)
            print(f"  synced    {name}  ({how})")

    for s in skipped:
        print(f"  skipped   {s}")

    if check_only and stale:
        print(f"\n{len(stale)} page(s) out of sync with {CORE.relative_to(ROOT)}."
              " Run: python tools/sync-core-css.py")
        return 1
    if not check_only:
        print(f"\n{len(changed)} page(s) updated from {CORE.relative_to(ROOT)} "
              f"({len(css):,} chars).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
