"""Turn the difference between two catalog releases into first-class change events.

@module History is not overwritten: a change between releases becomes an event
with a before and an after, each naming the content hash and the sources it came
from. Events derived from the diff are classified only where the difference says
what kind it is; anything else stays `unclassified_change`. The official change
rows published on the changelog pages are carried alongside, matched to controls
by the control IDs they name, and never merged into the derived events.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

CONTROL_ID = re.compile(r'\b([A-Z]\d{3})(?:\.(\d+))?\b')


def _text_of(control):
    official = control.get('official_changelog_text') or {}
    return {
        'title': c.normalize_text(control.get('title')),
        'statement': c.normalize_text(official.get('statement')
                                      or (control.get('summary') or {}).get('value')),
        'guidance': [c.normalize_text(x) for x in (official.get('control_shoulds') or [])
                     + (official.get('control_mays') or [])],
        'requirement_ids': [r['id'] for r in control.get('requirements') or []],
        'hash': (control.get('integrity') or {}).get('normalized_content_hash'),
    }


def _event(release_id, control_id, event_type, summary, before, after, refs, method, confidence):
    return {
        'id': 'chg_%s_%s_%s' % (release_id.replace('-', '_'), control_id, event_type),
        'release_id': release_id,
        'control_id': control_id,
        'event_type': event_type,
        'summary': summary,
        'before': before,
        'after': after,
        'source_refs': list(refs),
        'classification': {'method': method, 'confidence': confidence,
                           'review_status': 'approved' if confidence >= 0.9 else 'needs_review'},
    }


def events_between(previous, current):
    """Derived events for one release, comparing it with the release before it."""
    release_id = current['release']['release_id']
    refs = current['provenance']['source_refs']
    old = {x['id']: x for x in previous['controls']} if previous else {}
    new = {x['id']: x for x in current['controls']}
    events = []

    for control_id in sorted(set(new) - set(old)):
        events.append(_event(
            release_id, control_id, 'control_added',
            'control %s (%s) is present in this release and not in %s' % (
                control_id, new[control_id]['title'],
                previous['release']['release_id'] if previous else 'any earlier release'),
            None, {'content_hash': _text_of(new[control_id])['hash'], 'source_refs': list(refs)},
            refs, 'release_set_difference', 0.95))

    for control_id in sorted(set(old) - set(new)):
        events.append(_event(
            release_id, control_id, 'control_retired',
            'control %s (%s) was present in %s and is not present in this release' % (
                control_id, old[control_id]['title'], previous['release']['release_id']),
            {'content_hash': _text_of(old[control_id])['hash'], 'source_refs': list(refs)},
            None, refs, 'release_set_difference', 0.95))

    for control_id in sorted(set(old) & set(new)):
        before, after = _text_of(old[control_id]), _text_of(new[control_id])
        if before == after:
            continue
        kinds = []
        if before['title'] != after['title']:
            kinds.append(('title_updated', 'the published title changed from %r to %r' % (
                before['title'], after['title'])))
        if before['statement'] != after['statement']:
            kinds.append(('requirement_updated',
                          'the normative statement changed'))
        if before['guidance'] != after['guidance']:
            added = [g for g in after['guidance'] if g not in before['guidance']]
            removed = [g for g in before['guidance'] if g not in after['guidance']]
            kinds.append(('guidance_updated',
                          'the control guidance changed: %d bullet(s) added, %d removed'
                          % (len(added), len(removed))))
        if not kinds:
            kinds.append(('unclassified_change',
                          'the normalised content hash changed and the difference could not '
                          'be classified from the sources'))
        for event_type, summary in kinds:
            events.append(_event(
                release_id, control_id, event_type, summary,
                {'content_hash': before['hash'], 'source_refs': list(refs)},
                {'content_hash': after['hash'], 'source_refs': list(refs)},
                refs, 'release_content_diff', 0.9 if event_type != 'unclassified_change' else 0.5))
    return events


def official_records(release, page_changes):
    """The change rows the official changelog publishes, matched to control ids."""
    records = []
    for row in page_changes:
        subject = row.get('subject') or ''
        ids = sorted({m.group(1) for m in CONTROL_ID.finditer(subject)})
        records.append({
            'id': 'off_%s_%03d' % (release['release_id'].replace('-', '_'), row['row']),
            'release_id': release['release_id'],
            'control_ids': ids,
            'subject': subject,
            'category': row.get('category'),
            'notes': row.get('notes'),
            'release_label': row.get('release_label'),
            'source_refs': [release['changelog_source_ref']],
            'classification': {'method': 'official_changelog_parse', 'confidence': 1.0,
                               'review_status': 'approved',
                               'note': 'published by AIUC on its own changelog page and '
                                       'reproduced here without interpretation'},
        })
    return records


def build():
    index = c.read_json('catalog/index.json')
    pages = c.read_json('build/changelog-pages.json')['pages']
    built = [e for e in sorted(index['releases'], key=lambda x: x['release_id'])
             if e['status'] != 'unbuilt']
    page_by_release = {}
    for page in pages.values():
        for row in page['official_changes']:
            page_by_release.setdefault(page['url'], []).append(row)

    summary, previous = [], None
    for entry in built:
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        derived = events_between(previous, document)
        release_meta = {'release_id': entry['release_id'],
                        'changelog_source_ref': None}
        official_rows, source_ref = [], None
        for ref, page in pages.items():
            if page['url'].endswith(entry['release_id']) or (
                    page['url'].rstrip('/').endswith('changelog')
                    and entry['release_id'] == index['current_release']):
                official_rows, source_ref = page['official_changes'], ref
        release_meta['changelog_source_ref'] = source_ref
        official = official_records(release_meta, official_rows) if source_ref else []
        payload = {
            'release_id': entry['release_id'],
            'generated_at': c.now_iso(),
            'generator_version': c.GENERATOR_VERSION,
            'previous_release_id': previous['release']['release_id'] if previous else None,
            'derived_event_count': len(derived),
            'official_record_count': len(official),
            'derived_events': derived,
            'official_change_records': official,
        }
        c.write_json('changes/%s.json' % entry['release_id'], payload)
        document['change_events'] = derived
        c.write_json('catalog/releases/%s.json' % entry['release_id'], document)
        if entry['release_id'] == index['current_release']:
            c.write_json('catalog/current.json', document)
        summary.append('%s  %3d derived events  %3d official rows' % (
            entry['release_id'], len(derived), len(official)))
        previous = document
    return summary


if __name__ == '__main__':
    for line in build():
        print(line)
