#!/usr/bin/env python3
"""
licence-audit.py — report / fix CC BY 4.0 coverage across a documentation corpus.

Decision recorded 21 Aug 2026: unless a document explicitly states otherwise,
every .md file is authored by Dinis Cruz and released under CC BY 4.0.
Irrevocability is the point: the licence is what guarantees the material stays
readable regardless of what happens to any company, platform or vault hosting it.

Usage
  python3 licence-audit.py                      # report on the whole tree
  python3 licence-audit.py --path team/ library/  # restrict scope
  python3 licence-audit.py --fix                # append the canonical line to unstamped .md
  python3 licence-audit.py --fix --json         # also stamp JSON data files
  python3 licence-audit.py --check team/ library/  # CI gate: exit 1 if any file is unstamped
  python3 licence-audit.py --csv report.csv     # write a per-file report

Released under CC BY 4.0.
"""
import argparse, json, os, re, sys, csv
from collections import Counter

MARKER   = "Creative Commons Attribution 4.0"
LINE     = "This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0)."
FOOTER   = "\n---\n\n" + LINE + "\n"
JSON_KEY = "license"
JSON_VAL = "CC BY 4.0"

# Paths never stamped and never counted as failures: vendored third-party docs,
# build output, and anything explicitly excluded from publication.
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", "dist", "build"}
SKIP_PREFIXES = (
    "library/dependencies/",   # vendored third-party documentation
    "library/alchemist/",      # commercial material, excluded from publication
)

def skipped(rel):
    return rel.startswith(SKIP_PREFIXES)

def walk(roots, exts):
    for root in roots:
        if os.path.isfile(root):
            if os.path.splitext(root)[1] in exts:
                yield root
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for fn in filenames:
                if os.path.splitext(fn)[1] in exts:
                    yield os.path.relpath(os.path.join(dirpath, fn))

def md_has_licence(path):
    try:
        return MARKER in open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        return None

def json_has_licence(path):
    try:
        data = json.load(open(path, encoding="utf-8", errors="ignore"))
    except Exception:
        txt = open(path, encoding="utf-8", errors="ignore").read()
        return JSON_VAL in txt
    return isinstance(data, dict) and JSON_KEY in data

def stamp_md(path):
    txt = open(path, encoding="utf-8").read()
    if MARKER in txt:
        return False
    if not txt.endswith("\n"):
        txt += "\n"
    open(path, "w", encoding="utf-8").write(txt + FOOTER)
    return True

def stamp_json(path):
    try:
        data = json.load(open(path, encoding="utf-8"))
    except Exception:
        return False
    if not isinstance(data, dict) or JSON_KEY in data:
        return False
    out = {JSON_KEY: JSON_VAL}
    out.update(data)
    open(path, "w", encoding="utf-8").write(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    return True

def bucket(rel):
    """Group a path for the summary table: two path segments deep."""
    parts = rel.split(os.sep)
    return os.sep.join(parts[:2]) if len(parts) > 1 else parts[0]

def main():
    ap = argparse.ArgumentParser(description="Audit CC BY 4.0 licence coverage.")
    ap.add_argument("--path", nargs="*", default=["."], help="roots to scan (default: .)")
    ap.add_argument("--fix", action="store_true", help="append the canonical line to unstamped .md files")
    ap.add_argument("--json", action="store_true", help="include .json data files")
    ap.add_argument("--check", nargs="*", metavar="ROOT",
                    help="CI mode: scan these roots, exit 1 if anything is unstamped")
    ap.add_argument("--csv", metavar="OUT", help="write a per-file report to CSV")
    ap.add_argument("--quiet", action="store_true", help="summary only")
    args = ap.parse_args()

    roots = args.check if args.check else args.path
    exts = {".md"} | ({".json"} if (args.json or args.check) else set())

    stamped, missing, skipped_files = [], [], []
    for rel in sorted(walk(roots, exts)):
        if skipped(rel.replace(os.sep, "/")):
            skipped_files.append(rel); continue
        ok = json_has_licence(rel) if rel.endswith(".json") else md_has_licence(rel)
        (stamped if ok else missing).append(rel)

    total = len(stamped) + len(missing)
    if total == 0:
        print("No matching files found."); return 0

    if args.fix and missing:
        fixed = 0
        for rel in missing:
            if rel.endswith(".json"):
                fixed += stamp_json(rel)
            else:
                fixed += stamp_md(rel)
        print(f"Stamped {fixed} file(s).")
        # recompute so the report below reflects the post-fix state
        still = [m for m in missing
                 if not (json_has_licence(m) if m.endswith('.json') else md_has_licence(m))]
        stamped += [m for m in missing if m not in still]
        missing = still

    pct = 100.0 * len(stamped) / total
    print(f"\nCC BY 4.0 coverage: {len(stamped)}/{total} ({pct:.1f}%)")
    if skipped_files:
        print(f"Skipped (vendored / excluded): {len(skipped_files)}")

    if missing and not args.quiet:
        print(f"\nUnstamped: {len(missing)}\n")
        counts = Counter(bucket(m) for m in missing)
        w = max(len(k) for k in counts) if counts else 10
        for area, n in counts.most_common():
            print(f"  {area.ljust(w)}  {n}")
        print("\n  (run with --fix to stamp them)")

    if args.csv:
        with open(args.csv, "w", newline="", encoding="utf-8") as fh:
            wr = csv.writer(fh)
            wr.writerow(["path", "licensed"])
            for p in stamped: wr.writerow([p, "yes"])
            for p in missing: wr.writerow([p, "no"])
        print(f"\nWrote {args.csv}")

    if args.check and missing:
        print(f"\nFAIL: {len(missing)} file(s) missing a licence line.", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
