#!/usr/bin/env python3
"""Captures the figures the review packs embed, from the site's own live pages.

Run from anywhere, with a local server on :8899 serving the repo root:
    python3 -m http.server 8899 &
    python3 admin/build/gen_pack_figures.py

NOT run on every build: it needs a browser and takes about a minute. A pack whose figure is
missing says so in the caption rather than shipping a blank box, so a build without this step
is degraded and honest rather than broken.

The figures are screenshots of the real pages, not redrawn for print. That is deliberate:
a figure in a pack should be the thing the reviewer would see if they opened the site, so
that a disagreement about the figure is a disagreement about the site.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "v2/packs/figures"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
BASE = "http://127.0.0.1:8899"

# name, url, window size, crop box (left, top, right, bottom) or None
FIGURES = [
    ("concepts.png", "/v1/altitudes/concepts.html", (1500, 1500), None),
    ("docs-all.png", "/v1/docs/index.html#all", (1500, 2600), (30, 1700, 1470, 2560)),
    ("decisions.png", "/decisions/index.html#all", (1500, 1500), (980, 560, 1470, 1300)),
]


def main():
    if not Path(CHROME).exists():
        print(f"gen_pack_figures: no browser at {CHROME}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    done = 0
    for name, url, size, crop in FIGURES:
        tmp = OUT / f".{name}"
        r = subprocess.run([
            CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
            "--virtual-time-budget=16000", f"--window-size={size[0]},{size[1]}",
            f"--screenshot={tmp}", BASE + url], capture_output=True)
        if not tmp.exists():
            print(f"  ! {name}: no capture ({r.returncode})", file=sys.stderr)
            continue
        if crop:
            try:
                from PIL import Image
                Image.open(tmp).crop(crop).save(OUT / name)
                tmp.unlink()
            except ImportError:
                tmp.rename(OUT / name)
        else:
            tmp.rename(OUT / name)
        print(f"  · {name}  {(OUT / name).stat().st_size:,}b")
        done += 1
    print(f"gen_pack_figures: {done} of {len(FIGURES)} captured")
    return 0


if __name__ == "__main__":
    sys.exit(main())
