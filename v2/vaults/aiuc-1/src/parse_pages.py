"""Deterministic extraction from the captured AIUC-1 pages.

@module Reads the snapshots the fetcher saved and produces one parsed record per
control, from the control's OWN page, plus the domain record from the domain
page. Every field keeps the source wording it was read from. Where a control's
page disagrees with the home-page index, both observations are preserved and the
control is marked needs_review rather than reconciled by guesswork.
"""
import gzip
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import rsc

CONFIRMED_FIELDS = ('name', 'summary', 'slug', 'url', 'isMandatory', 'frequency', 'type')


def read_snapshot(rel_path):
    with gzip.open(c.path(rel_path), 'rt', encoding='utf-8') as handle:
        return handle.read()


def principles_of(html_text):
    flat = rsc.flatten(html_text)
    raw = rsc.literal(flat, 'principles')
    return rsc.undefined_to_none(rsc.reresolve(rsc.prune(raw, {'principle'})))


def index_controls(principles):
    """control id -> (domain record without controls, control record)."""
    out = {}
    for principle in principles:
        domain = {k: v for k, v in principle.items() if k != 'requirements'}
        for control in principle.get('requirements') or []:
            out[control['id']] = (domain, control)
    return out


def parse(day=None):
    day = day or c.now_iso()[:10]
    discovery = c.read_json('evidence/discovery-manifest.json')
    manifest = c.read_json('evidence/source-manifest.json')
    observations = {o['id']: o for o in manifest['observations']}

    home_ref = discovery['source_ref']
    home_index = index_controls(principles_of(read_snapshot(
        observations[home_ref]['content']['raw_snapshot_path'])))

    domains, controls, findings = {}, {}, []

    for domain in discovery['domains']:
        domain_ref = c.source_ref_id(day, 'domain', domain['id'])
        record = {
            'id': domain['id'],
            'name': domain['name'],
            'slug': domain['slug'],
            'url': domain['url'],
            'official_url': c.SITE + domain['url'],
            'description': domain['description'],
            'source_refs': [home_ref],
        }
        if domain_ref in observations:
            page = principles_of(read_snapshot(
                observations[domain_ref]['content']['raw_snapshot_path']))
            on_page = [p for p in page if p['id'] == domain['id']]
            if on_page:
                record['source_refs'].append(domain_ref)
                if c.normalize_text(on_page[0].get('name')) != c.normalize_text(domain['name']):
                    findings.append({
                        'kind': 'domain_name_mismatch', 'domain_id': domain['id'],
                        'index_value': domain['name'], 'page_value': on_page[0].get('name'),
                        'source_refs': [home_ref, domain_ref]})
            else:
                findings.append({
                    'kind': 'domain_absent_from_own_page', 'domain_id': domain['id'],
                    'source_refs': [domain_ref]})
        domains[domain['id']] = record

    for domain in discovery['domains']:
        for stub in domain['controls']:
            control_id = stub['id']
            control_ref = c.source_ref_id(day, 'control', control_id)
            _, indexed = home_index[control_id]
            page_record, page_refs = None, [home_ref]
            if control_ref in observations:
                page = principles_of(read_snapshot(
                    observations[control_ref]['content']['raw_snapshot_path']))
                found = index_controls(page).get(control_id)
                if found:
                    page_record = found[1]
                    page_refs.append(control_ref)
                    for field in CONFIRMED_FIELDS:
                        left, right = indexed.get(field), page_record.get(field)
                        if isinstance(left, str) or isinstance(right, str):
                            left, right = c.normalize_text(left), c.normalize_text(right)
                        if left != right:
                            findings.append({
                                'kind': 'control_field_mismatch', 'control_id': control_id,
                                'field': field, 'index_value': indexed.get(field),
                                'page_value': page_record.get(field),
                                'source_refs': [home_ref, control_ref]})
                else:
                    findings.append({
                        'kind': 'control_absent_from_own_page', 'control_id': control_id,
                        'url': stub['url'], 'source_refs': [control_ref]})
            controls[control_id] = {
                'domain_id': domain['id'],
                'record': page_record or indexed,
                'confirmed_by_own_page': page_record is not None,
                'source_refs': page_refs,
            }

    parsed = {
        'parser_version': c.PARSER_VERSION,
        'parsed_at': c.now_iso(),
        'snapshot_day': day,
        'method': 'structural read of the published control model in each page payload',
        'domain_count': len(domains),
        'control_count': len(controls),
        'confirmed_by_own_page': sum(1 for v in controls.values() if v['confirmed_by_own_page']),
        'findings': findings,
        'domains': domains,
        'controls': controls,
    }
    c.write_json('build/parsed-pages.json', parsed)
    return parsed


if __name__ == '__main__':
    result = parse(sys.argv[1] if len(sys.argv) > 1 else None)
    print('parsed %d domains, %d controls (%d confirmed by their own page), %d findings' % (
        result['domain_count'], result['control_count'],
        result['confirmed_by_own_page'], len(result['findings'])))
    for finding in result['findings'][:10]:
        print('  !', finding['kind'], finding.get('control_id') or finding.get('domain_id'),
              finding.get('field', ''))
