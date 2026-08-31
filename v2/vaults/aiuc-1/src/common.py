"""Shared plumbing for the AIUC-1 derived catalog: paths, hashing, JSON I/O.

@module Deterministic helpers every stage of the catalog build shares. No
network, no parsing, no HTML: paths relative to the project root, SHA-256 in the
one format the schemas accept, whitespace normalisation, and byte-stable JSON
writing so a rebuild from the same snapshots produces the same bytes.
"""
import hashlib
import json
import os
import re
import unicodedata
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GENERATOR_VERSION = '0.1.0'
PARSER_VERSION = '0.1.0'
CATALOG_SCHEMA_VERSION = '1.0.0'

SITE = 'https://www.aiuc-1.com'
CHANGELOG_URL = SITE + '/changelog'
REPO_SLUG = 'aiunderwriting/AIUC-1-Changelog'
REPO_URL = 'https://github.com/aiunderwriting/AIUC-1-Changelog'

USER_AGENT = ('sgit-ai-aiuc1-catalog/%s (+https://graphs.sgit.ai; derived '
              'machine-readable catalog; contact via graphs.sgit.ai)' % GENERATOR_VERSION)

DISCLAIMER = ('Unofficial, derivative machine-readable representation of AIUC-1, '
              'built by the sgit.ai graph estate. Not approved, certified or endorsed '
              'by AIUC. Verify every requirement against the official AIUC-1 sources.')


def path(*parts):
    return os.path.join(ROOT, *parts)


def ensure_dir(p):
    os.makedirs(p, exist_ok=True)
    return p


def sha256_bytes(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def sha256_json(obj):
    return sha256_bytes(json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False))


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def normalize_text(value):
    """Whitespace-normalised copy of source wording. Never replaces the original."""
    if value is None:
        return None
    text = unicodedata.normalize('NFC', value)
    text = text.replace(' ', ' ')
    return re.sub(r'\s+', ' ', text).strip()


def write_json(rel_path, obj):
    full = path(rel_path) if not os.path.isabs(rel_path) else rel_path
    ensure_dir(os.path.dirname(full))
    with open(full, 'w', encoding='utf-8') as handle:
        json.dump(obj, handle, indent=1, ensure_ascii=False, sort_keys=False)
        handle.write('\n')
    return full


def read_json(rel_path, default=None):
    full = path(rel_path) if not os.path.isabs(rel_path) else rel_path
    if not os.path.exists(full):
        return default
    with open(full, encoding='utf-8') as handle:
        return json.load(handle)


def slugify(value):
    value = unicodedata.normalize('NFKD', value or '').encode('ascii', 'ignore').decode()
    value = re.sub(r'[^a-zA-Z0-9]+', '-', value).strip('-').lower()
    return value


def source_ref_id(*parts):
    return 'src_' + '_'.join(slugify(str(p)).replace('-', '_') for p in parts if p is not None)
