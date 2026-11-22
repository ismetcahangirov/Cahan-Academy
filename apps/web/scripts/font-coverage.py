"""Prove that every self-hosted brand font covers Azerbaijani and Cyrillic.

Usage (from apps/web):
  python scripts/font-coverage.py                  # the files lib/fonts.ts ships (assets/fonts/*.woff2)
  python scripts/font-coverage.py path/to/a.woff2  # any font file(s)

Each shipped face is ONE subset file (no unicode-range split), so a character is covered when the
font's cmap has a glyph for it. Also checks the uppercase forms used by the small-caps styles
(.sc is text-transform: uppercase; with <html lang="az"> "i" -> "İ"). Exit code 1 when anything is missing.
Adapted from the dashboard's client/scripts/font-coverage.py (which reads @fontsource CSS).
Requires: pip install fonttools brotli
"""
import glob
import os
import sys

from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "..", "assets", "fonts")

AZ = "əƏğĞıİşŞçÇöÖüÜ"
AZ_UPPER = "ƏĞIİŞÇÖÜ"
RU = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя"
EXTRA = "№«»—–…“”‘’"
# ₼ (manat) is reported, not required: Cormorant SC does not draw it (EB Garamond and Great Vibes do),
# so never put ₼ in small-caps text; prices in serif may use it.
OPTIONAL = "₼"
TEST = AZ + AZ_UPPER + RU + EXTRA


def main(paths):
    sys.stdout.reconfigure(encoding="utf-8")
    files = paths or sorted(glob.glob(os.path.join(FONT_DIR, "*.woff2")))
    if not files:
        print("no font files found")
        return 1
    failed = 0
    for path in files:
        font = TTFont(path)
        cmap = font.getBestCmap() or {}
        missing = [c for c in TEST if ord(c) not in cmap]
        name = os.path.basename(path)
        family = font["name"].getDebugName(1) or "?"
        opt = [c for c in OPTIONAL if ord(c) not in cmap]
        if missing:
            failed += 1
            print(f"FAIL {name} ({family}): missing {' '.join(missing)}")
        else:
            print(f"PASS {name} ({family}): {len(TEST)} test characters, {len(cmap)} glyphs mapped" + (f"; optional missing: {' '.join(opt)}" if opt else ""))
    print()
    print("ALL PASS" if not failed else f"{failed} file(s) FAILED")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
