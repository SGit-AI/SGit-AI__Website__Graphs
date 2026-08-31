"""Compare what the website publishes with what the official repository records.

@module The website is the source for current wording; the repository is the
source for history. This module compares the two for the current release and
emits findings. A difference is never resolved by picking a side: it is recorded,
classified, and — where it changes meaning — marked blocking so the release
cannot be published as validated.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

MD_LINK = re.compile(r'\[([^\]]+)\]\([^)]*\)')


def formatting_key(text):
    """Text with markdown presentation removed, for telling layout from meaning."""
    value = MD_LINK.sub(r'\1', c.normalize_text(text) or '')
    value = value.replace('\\', '').replace('**', '').replace('*', '')
    return value.rstrip(' .').strip()


def _finding(kind, control_id, reason, blocking, **extra):
    finding = {'kind': kind, 'control_id': control_id, 'reason': reason, 'blocking': blocking}
    finding.update(extra)
    return finding


def compare_control(control_id, site_control, repo_record, refs):
    """One control, seen from the website and from the repository markdown."""
    findings = []
    if repo_record is None:
        return [_finding('control_absent_from_official_repository', control_id,
                         'the website publishes a control the official changelog repository '
                         'does not carry at the matched commit', True, source_refs=list(refs))]

    site_title = c.normalize_text(site_control['title'])
    repo_title = c.normalize_text(repo_record.get('title'))
    if site_title != repo_title:
        findings.append(_finding(
            'title_conflict', control_id,
            'the website title and the repository title differ', True,
            website_value=site_control['title'], repository_value=repo_record.get('title'),
            source_refs=list(refs)))

    site_summary = formatting_key(site_control['summary']['value'])
    repo_summary = formatting_key(repo_record.get('statement'))
    if site_summary != repo_summary:
        findings.append(_finding(
            'summary_conflict', control_id,
            'the website summary and the repository requirement statement differ', True,
            website_value=site_control['summary']['value'],
            repository_value=repo_record.get('statement'), source_refs=list(refs)))

    site_bullets = [b for req in site_control['requirements'] for b in req['source_bullets']]
    repo_bullets = ((repo_record.get('control_shoulds') or [])
                    + (repo_record.get('control_mays') or []))
    site_keys = sorted(formatting_key(b) for b in site_bullets)
    repo_keys = sorted(formatting_key(b) for b in repo_bullets)
    if site_keys != repo_keys:
        findings.append(_finding(
            'guidance_set_conflict', control_id,
            'the bullets published on the website and the bullets in the repository markdown '
            'are not the same set', True,
            only_on_website=sorted(set(site_keys) - set(repo_keys)),
            only_in_repository=sorted(set(repo_keys) - set(site_keys)),
            source_refs=list(refs)))
    elif [formatting_key(b) for b in site_bullets] != [formatting_key(b) for b in repo_bullets]:
        findings.append(_finding(
            'guidance_order_difference', control_id,
            'the same bullets are published in a different order on the website and in the '
            'repository markdown', False, source_refs=list(refs)))
    else:
        raw_site = [c.normalize_text(b) for b in site_bullets]
        raw_repo = [c.normalize_text(b) for b in repo_bullets]
        if raw_site != raw_repo:
            findings.append(_finding(
                'guidance_formatting_difference', control_id,
                'the bullets agree once markdown escaping and links are removed, so the '
                'difference is presentation and not meaning', False,
                source_refs=list(refs)))
    return findings


def compare_release(site_controls, repo_controls, refs):
    """Control inventory and per-control comparison for one release."""
    findings = []
    site_ids, repo_ids = set(site_controls), set(repo_controls)
    for control_id in sorted(repo_ids - site_ids):
        findings.append(_finding(
            'control_absent_from_website', control_id,
            'the official changelog repository carries a control the website does not '
            'publish at this release', True, source_refs=list(refs)))
    for control_id in sorted(site_ids & repo_ids):
        findings.extend(compare_control(control_id, site_controls[control_id],
                                        repo_controls[control_id], refs))
    for control_id in sorted(site_ids - repo_ids):
        findings.extend(compare_control(control_id, site_controls[control_id], None, refs))
    return findings


def report(findings, release_id, extra=None):
    counts = {}
    for finding in findings:
        counts[finding['kind']] = counts.get(finding['kind'], 0) + 1
    payload = {
        'report_version': '1.0.0',
        'generated_at': c.now_iso(),
        'generator_version': c.GENERATOR_VERSION,
        'release_id': release_id,
        'finding_count': len(findings),
        'blocking_count': sum(1 for f in findings if f.get('blocking')),
        'counts_by_kind': dict(sorted(counts.items())),
        'findings': findings,
    }
    payload.update(extra or {})
    return payload
