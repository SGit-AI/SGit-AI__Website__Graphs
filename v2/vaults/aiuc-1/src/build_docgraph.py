"""Decompose every source markdown document to the word, and prove it rebuilds.

@module The catalog says what the standard says; this says how the standard is
WRITTEN. Each source document — the two official markdown files at the release
commit, and this vault's own prose — is decomposed to document, section, block,
sentence and word, with a formatting graph beside the semantic one, an identity
ledger, and a token analysis. The decomposition is the estate's own
`admin/build/gen_coregraph.build()`, imported rather than copied, so all seven of
its gates run here unchanged — including the one that matters: the markdown
rebuilds from the formatting graph BYTE-IDENTICAL to the source. A paragraph that
cannot be put back exactly is not a paragraph you can hang meaning on.
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import parse_changelog

ESTATE = Path(c.ROOT).parents[2] / 'admin' / 'build'

# slug -> (uid prefix, where the markdown comes from). The prefixes are short because
# a uid is meant to be quotable, and distinct because two ledgers must never collide.
OFFICIAL = {
    'aiuc1-controls': ('ac', 'standard/controls.md'),
    'aiuc1-requirements': ('ar', 'standard/requirements.md'),
}
OWN = {
    'aiuc1-readme': ('rd', 'README.md'),
    'aiuc1-notice': ('nt', 'NOTICE.md'),
    'aiuc1-methodology': ('mt', 'docs/methodology.md'),
    'aiuc1-source-policy': ('sp', 'docs/source-policy.md'),
    'aiuc1-review-workflow': ('rw', 'docs/review-workflow.md'),
    'aiuc1-limitations': ('lm', 'docs/limitations.md'),
    'aiuc1-meaning': ('mn', 'docs/meaning.md'),
}


def coregraph():
    """The estate's decomposer. Imported, never copied: it already serves the pilot
    document and every chapter of a book, and this is its third caller."""
    if not (ESTATE / 'gen_coregraph.py').exists():
        raise SystemExit(
            'build_docgraph needs the estate generator at %s. The vault carries the '
            'decomposition it produced, not the decomposer.' % (ESTATE / 'gen_coregraph.py'))
    sys.path.insert(0, str(ESTATE))
    import gen_coregraph
    return gen_coregraph


def stage_official():
    """Copy the official markdown at the matched release commit into sources/, with
    the blob provenance beside it, so the vault holds the bytes it decomposed."""
    index = c.read_json('catalog/index.json')
    current = c.read_json('catalog/releases/%s.json' % index['current_release'])
    commit = current['release']['source_commit']
    repo = parse_changelog.ensure_clone()
    staged = {}
    for slug, (_, path) in OFFICIAL.items():
        body = parse_changelog.git(repo, 'show', '%s:%s' % (commit['sha'], path))
        target = c.path('sources/' + path)
        c.ensure_dir(os.path.dirname(target))
        with open(target, 'w', encoding='utf-8', newline='') as handle:
            handle.write(body)
        recorded = (commit.get('files') or {}).get(path, {})
        actual = c.sha256_bytes(body)
        if recorded.get('raw_sha256') and recorded['raw_sha256'] != actual:
            raise SystemExit('%s: the staged bytes do not hash to what the release '
                             'records (%s vs %s)' % (path, actual, recorded['raw_sha256']))
        staged[slug] = {
            'slug': slug,
            'path': 'sources/' + path,
            'repository_path': path,
            'origin': 'official_github_repository',
            'repository': c.REPO_SLUG,
            'commit_sha': commit['sha'],
            'commit_url': commit['url'],
            'blob_sha': recorded.get('blob_sha'),
            'raw_url': recorded.get('raw_url'),
            'raw_sha256': actual,
            'bytes': len(body.encode('utf-8')),
            'release_id': index['current_release'],
        }
    return staged


def build():
    gen = coregraph()
    staged = stage_official()
    out_root = c.path('graph/docs')
    c.ensure_dir(out_root)

    documents, seen_prefix = [], {}
    todo = [(slug, prefix, staged[slug]['path'], staged[slug]) for slug, (prefix, _) in
            OFFICIAL.items()]
    todo += [(slug, prefix, path, {'slug': slug, 'path': path, 'origin': 'this_vault'})
             for slug, (prefix, path) in OWN.items()]

    for slug, prefix, rel_path, provenance in todo:
        if prefix in seen_prefix:
            raise SystemExit('uid prefix %r is taken by %s' % (prefix, seen_prefix[prefix]))
        seen_prefix[prefix] = slug
        src = Path(c.path(rel_path))
        if not src.exists():
            raise SystemExit('build_docgraph: no source at %s' % rel_path)
        out = Path(out_root) / slug
        ledger = out / 'ids.json'
        summary = gen.build(slug, src, out, ledger, prefix, quiet=True)
        record = dict(provenance)
        record.update({
            'title': summary.get('title'),
            'sections': summary.get('sections'),
            'blocks': summary.get('blocks'),
            'sentences': summary.get('sentences'),
            'words': summary.get('words'),
            'forms': summary.get('forms'),
            'spans': summary.get('spans'),
            'uid_prefix': prefix,
            'graph_path': 'graph/docs/%s' % slug,
            'source_sha256': c.sha256_bytes(src.read_bytes()),
            'rebuilds_byte_identical': True,
        })
        documents.append(record)

    payload = {
        'docgraph_version': '1.0.0',
        'generated_at': c.now_iso(),
        'generator_version': c.GENERATOR_VERSION,
        'decomposer': 'admin/build/gen_coregraph.py from the graphs.sgit.ai estate, '
                      'imported and not copied; its seven gates run here unchanged',
        'ladder': ['document', 'section', 'block', 'sentence', 'word'],
        'gate': 'every document below rebuilt from its formatting graph byte-identical '
                'to its source, or this file would not exist',
        'document_count': len(documents),
        'totals': {k: sum(d.get(k) or 0 for d in documents)
                   for k in ('sections', 'blocks', 'sentences', 'words', 'forms', 'spans')},
        'documents': sorted(documents, key=lambda d: d['slug']),
    }
    c.write_json('graph/docs/index.json', payload)
    return payload


if __name__ == '__main__':
    result = build()
    print('%d documents decomposed to the word, all rebuilding byte-identical' %
          result['document_count'])
    for d in result['documents']:
        print('  %-22s %-34s %3d sections %4d blocks %5d words' % (
            d['slug'], d['path'], d['sections'] or 0, d['blocks'] or 0, d['words'] or 0))
    print('  totals: %s' % result['totals'])
