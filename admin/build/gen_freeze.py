#!/usr/bin/env python3
"""Writes v1/MANIFEST.json: the SHA-256 of every file in the frozen first edition.

Run from anywhere: python3 admin/build/gen_freeze.py

The first edition froze at v0.3.26 and moved to v1/ at v0.4.0. From that point the tree is
evidence rather than working material, and validate.js gate 14 fails the build if any
recorded file changes.

RE-RUN THIS ONLY when the freeze is deliberately re-taken, which should be never. If the
gate fails, the answer is to restore the file, not to regenerate the manifest. That is the
whole point: a manifest anyone can regenerate to make a failure go away is not a gate.
"""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
V1 = ROOT / "v1"
FROZEN_AT = "v0.3.26"
MOVED_AT = "v0.4.0"


def main():
    files = {}
    for p in sorted(V1.rglob("*")):
        if not p.is_file() or p.name == "MANIFEST.json":
            continue
        rel = p.relative_to(ROOT).as_posix()
        files[rel] = hashlib.sha256(p.read_bytes()).hexdigest()
    commit = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT,
                            capture_output=True, text=True).stdout.strip()
    out = {
        "edition": "first",
        "title": "Meaning Through Connectivity",
        "frozen_at": FROZEN_AT,
        "moved_at": MOVED_AT,
        "commit": commit,
        "rule": ("This tree is frozen. Nothing in it changes again. The second edition takes "
                 "its own copies into v2/ and records their origin. validate.js fails the "
                 "build if any file below no longer matches its hash."),
        "count": len(files),
        "bytes": sum((ROOT / f).stat().st_size for f in files),
        "files": files,
    }
    (V1 / "MANIFEST.json").write_text(json.dumps(out, indent=1) + "\n")
    print(f'gen_freeze: {len(files)} files, {out["bytes"]:,} bytes frozen at {FROZEN_AT}')


if __name__ == "__main__":
    main()
