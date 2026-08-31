"""Build one release artefact per published AIUC-1 release.

@module Turns the parsed website model and the parsed repository history into
catalog/releases/<release_id>.json, catalog/index.json and catalog/current.json.
Source wording is never overwritten: an enum lives beside the raw text it was
read from, and a value that cannot be mapped from an explicit source label is
null with a review finding attached.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import releases as rel

APPLICABILITY = {True: 'mandatory', False: 'optional'}
FREQUENCY = {'Every 12 months': 'every_12_months', 'Every 6 months': 'every_6_months',
             'Every 3 months': 'every_3_months'}
CONTROL_TYPE = {'Preventative': 'preventative', 'Detective': 'detective'}
APPLICATION = {'Core': 'core', 'Supplemental': 'supplemental'}
EVIDENCE_CATEGORY = {'Legal Policies': 'legal_policies',
                     'Technical Implementation': 'technical_implementation',
                     'Operational Practices': 'operational_practices',
                     'Third-party Evals': 'third_party_evals'}
SUB_ID = re.compile(r'^([A-Z]\d{3})\.(\d+)\b\s*(.*)$')


def bullets(description):
    """A sub-control description carries one or more source bullets."""
    parts = re.split(r'(?:^|\n)\s*-\s+', (description or '').replace('\\-', '-'))
    return [p.strip() for p in parts if p.strip()]


def enum(mapping, raw, control_id, field, findings):
    """Map an explicit source label, or keep null and record why."""
    if raw is None or raw == '':
        return {'value': None, 'raw_text': raw}
    if raw in mapping:
        return {'value': mapping[raw], 'raw_text': raw}
    findings.append({
        'kind': 'unmapped_source_label', 'control_id': control_id, 'field': field,
        'raw_text': raw,
        'reason': 'the published label is not in the mapping table; a mapping is a '
                  'decision and is not guessed'})
    return {'value': None, 'raw_text': raw}


def split_list(value):
    if not value:
        return []
    return [part.strip() for part in str(value).split(',') if part.strip()]


def build_requirements(record, control_id, refs, findings):
    """Sub-controls, in the site's published order, with their evidence expectation."""
    out = []
    for item in record.get('evidence') or []:
        control, evidence = item.get('control') or {}, item.get('evidence') or {}
        raw_id = control.get('id') or ''
        match = SUB_ID.match(raw_id)
        if not match:
            findings.append({'kind': 'unparsable_sub_control_id', 'control_id': control_id,
                             'raw_text': raw_id,
                             'reason': 'sub-control id does not follow <control>.<n>'})
            continue
        parent, number, label = match.group(1), match.group(2), match.group(3).strip()
        if parent != control_id:
            findings.append({'kind': 'sub_control_parent_mismatch', 'control_id': control_id,
                             'raw_text': raw_id,
                             'reason': 'sub-control id names a different parent control'})
        source_bullets = bullets(control.get('description'))
        out.append({
            'id': '%s.%s' % (parent, number),
            'number': int(number),
            'label': label or None,
            'raw_id': raw_id,
            'text': control.get('description'),
            'normalized_text': c.normalize_text(control.get('description')),
            'source_bullets': [c.normalize_text(b) for b in source_bullets],
            'application': enum(APPLICATION, control.get('application'),
                                control_id, 'requirement.application', findings),
            'evidence_expectation': {
                'label': evidence.get('label'),
                'category': enum(EVIDENCE_CATEGORY, evidence.get('category') or None,
                                 control_id, 'requirement.evidence.category', findings),
                'typical_locations': split_list(evidence.get('typicalLocation')),
                'typical_evidence': evidence.get('typicalEvidence'),
                'normalized_typical_evidence': c.normalize_text(evidence.get('typicalEvidence')),
                'capabilities': evidence.get('capabilities') or [],
            },
            'airtable_id': item.get('airtableId'),
            'source_refs': list(refs),
        })
    return out


def build_crosswalks(record, refs):
    seen, out = set(), []
    for item in record.get('crosswalks') or []:
        if not isinstance(item, dict):
            continue
        key = (item.get('type'), item.get('name'))
        if key in seen:
            continue
        seen.add(key)
        out.append({
            'framework': item.get('type'),
            'framework_slug': c.slugify(item.get('type')),
            'reference': item.get('name'),
            'text': item.get('content'),
            'normalized_text': c.normalize_text(item.get('content')),
            'gap': item.get('gap'),
            'gap_analysis': item.get('gapAnalysis'),
            'airtable_id': item.get('airtableId'),
            'relationship': 'published_crosswalk',
            'source_refs': list(refs),
        })
    return sorted(out, key=lambda x: (x['framework'] or '', x['reference'] or ''))


def build_control(control_id, entry, domain, repo_record, refs, release_id, first_seen, findings):
    record = entry['record']
    page_refs = list(dict.fromkeys(list(entry['source_refs']) + list(refs)))
    requirements = build_requirements(record, control_id, page_refs, findings)
    merged_note = None
    for req in requirements:
        for bullet in req['source_bullets']:
            if 'merged into' in bullet.lower():
                merged_note = bullet
    superseded_by = re.findall(r'merged into ([A-Z]\d{3})', merged_note or '')
    return {
        'id': control_id,
        'domain': {'id': domain['id'], 'name': domain['name'],
                   'source_url': domain['official_url']},
        'title': record.get('name'),
        'slug': record.get('slug'),
        'official_url': c.SITE + record['url'] if record.get('url') else None,
        'canonical_status': 'merged' if superseded_by else 'active',
        'source_terminology': {'called_on_site': 'requirement',
                               'sub_items_called_on_site': 'control'},
        'applicability': enum(APPLICABILITY, record.get('isMandatory'), control_id,
                              'applicability', findings) if record.get('isMandatory') is not None
                         else {'value': None, 'raw_text': None},
        'frequency': enum(FREQUENCY, record.get('frequency'), control_id, 'frequency', findings),
        'control_type': enum(CONTROL_TYPE, record.get('type'), control_id, 'control_type', findings),
        'capabilities': record.get('capabilities') or [],
        'summary': {'value': record.get('summary'),
                    'normalized_value': c.normalize_text(record.get('summary')),
                    'source_refs': page_refs},
        'requirements': requirements,
        'implementation_guidance': [],
        'keywords': record.get('keywords') or [],
        'crosswalks': build_crosswalks(record, page_refs),
        'official_changelog_text': {
            'statement': (repo_record or {}).get('statement'),
            'control_shoulds': (repo_record or {}).get('control_shoulds') or [],
            'control_mays': (repo_record or {}).get('control_mays') or [],
            'source_refs': list(refs),
        } if repo_record else None,
        'relationships': {
            'parent_control_id': None,
            'related_control_ids': [],
            'supersedes': [],
            'superseded_by': superseded_by,
            'note': merged_note,
        },
        'lifecycle': {
            'first_observed_release': first_seen.get(control_id),
            'last_confirmed_release': release_id,
            'deprecated_in_release': None,
            'retired_in_release': None,
        },
        'provenance': {
            'source_refs': page_refs,
            'extraction': {
                'method': 'structural_read_of_published_control_model',
                'parser_version': c.PARSER_VERSION,
                'extracted_at': c.now_iso(),
                'confirmed_by_own_page': entry['confirmed_by_own_page'],
                'review_status': 'approved' if entry['confirmed_by_own_page'] else 'needs_review',
            },
        },
        'integrity': {
            'normalized_content_hash': c.sha256_json([
                control_id, c.normalize_text(record.get('name')),
                c.normalize_text(record.get('summary')),
                [r['normalized_text'] for r in requirements]]),
        },
    }


if __name__ == '__main__':
    summary = rel.build_all(build_control)
    for line in summary:
        print(line)
