"""Prove that every self-hosted brand font covers Azerbaijani and Cyrillic.

Usage (from apps/web):
  python scripts/font-coverage.py                  # the files lib/fonts.ts ships (assets/fonts/*.woff2)
  python scripts/font-coverage.py path/to/a.woff2  # any font file(s)

Faces are grouped by family: `x-latin.woff2` + `x-cyrillic.woff2` form one face (unicode-range split in
lib/fonts.ts; the latin subset must hold every Azerbaijani letter, the cyrillic subset every Russian one),
a file without a suffix must hold everything. A weight suffix (`-300`, `-light`, `-regular`, `-bold`…) is
dropped from the family name, so e.g. `cahan-display-regular.woff2` reports as `cahan-display`. Also checks the uppercase forms used by the small-caps styles
(.sc is text-transform: uppercase; with <html lang="az"> "i" -> "İ"). Exit code 1 when anything is missing.
Adapted from the dashboard's client/scripts/font-coverage.py (which reads @fontsource CSS).
Requires: pip install fonttools brotli
"""
import glob
import os
import re
import sys
from collections import defaultdict

from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "..", "assets", "fonts")

AZ = "əƏğĞıİşŞçÇöÖüÜ" + "ƏĞIİŞÇÖÜ"
RU = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя"
EXTRA = "№«»—–…“”‘’"
# ₼ (manat) is reported, not required: Cormorant SC does not draw it (EB Garamond and Cahan Display do),
# so never put ₼ in small-caps text; prices in serif may use it.
OPTIONAL = "₼"
# families that must also hold characters beyond the common set (our own face promises № and ₼ in every weight)
FAMILY_EXTRA = {"cahan-display": "₼"}

WEIGHT_SUFFIX = re.compile(r"-(\d{3}|thin|extralight|light|regular|medium|semibold|bold|extrabold|black)$")

# which characters each subset kind must contain
REQUIRED = {"latin": AZ + EXTRA, "cyrillic": RU, "full": AZ + RU + EXTRA}


def kind_of(name):
    stem = os.path.splitext(name)[0]
    for k in ("latin", "cyrillic"):
        if stem.endswith("-" + k):
            return stem[: -len(k) - 1], k
    return WEIGHT_SUFFIX.sub("", stem), "full"


def main(paths):
    sys.stdout.reconfigure(encoding="utf-8")
    files = paths or sorted(glob.glob(os.path.join(FONT_DIR, "*.woff2")))
    if not files:
        print("no font files found")
        return 1
    families = defaultdict(dict)
    failed = 0
    for path in files:
        family, kind = kind_of(os.path.basename(path))
        font = TTFont(path)
        cmap = set((font.getBestCmap() or {}).keys())
        name = os.path.basename(path)
        families[family][name] = cmap
        need = REQUIRED[kind] + (FAMILY_EXTRA.get(family, "") if kind != "cyrillic" else "")
        missing = [c for c in need if ord(c) not in cmap]
        opt = [c for c in OPTIONAL if ord(c) not in cmap and kind != "cyrillic"]
        label = font["name"].getDebugName(1) or "?"
        if missing:
            failed += 1
            print(f"FAIL {name} ({label}, {kind}): missing {' '.join(missing)}")
        else:
            note = f"; optional missing: {' '.join(opt)}" if opt else ""
            print(f"PASS {name} ({label}, {kind}): {len(need)} required characters, {len(cmap)} glyphs{note}")
    print()
    for family, files_ in sorted(families.items()):
        union = set().union(*files_.values())
        missing = [c for c in AZ + RU + EXTRA + FAMILY_EXTRA.get(family, "") if ord(c) not in union]
        if missing:
            failed += 1
            print(f"FAIL family {family}: missing {' '.join(missing)}")
        else:
            print(f"PASS family {family} ({' + '.join(sorted(files_))}): Azerbaijani + Cyrillic + punctuation")
    print()
    print("ALL PASS" if not failed else f"{failed} check(s) FAILED")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
