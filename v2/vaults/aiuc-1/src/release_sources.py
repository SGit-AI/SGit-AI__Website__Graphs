"""Read the official changelog for which releases exist and which commit carries each.

@module The changelog page states which release is current and which is next, and
its standard-history table names the earlier ones. Those statements are read, not
inferred from the newest date lying around. A repository commit is then matched to
a release by an explicit, recorded rationale with a confidence, never by silent
nearest-neighbour: the repository was created after the first releases and
backfills them in order, so commit date is not the signal.
"""
import datetime as dt
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

MONTHS = {m: i for i, m in enumerate(
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
     'September', 'October', 'November', 'December'], 1)}
DATE_TEXT = re.compile(r'([A-Z][a-z]+) (\d{1,2}), (\d{4})')


def to_date(text):
    match = DATE_TEXT.match(text or '')
    if not match:
        return None
    return '%s-%02d-%02d' % (match.group(3), MONTHS[match.group(1)], int(match.group(2)))


def published_releases(pages):
    """Every release the official changelog states, plus the one it announces.

    The changelog page states which release is current and which is next, and its
    standard-history table names the earlier ones. Those statements are read,
    not inferred from the newest date lying around.
    """
    found, announced = {}, None
    for ref, page in pages.items():
        base = {'changelog_source_ref': ref, 'changelog_url': page['url'],
                'official_changes': page['official_changes']}
        for heading in page['release_headings']:
            release_id = to_date(heading)
            if release_id:
                found[release_id] = dict(base, release_id=release_id,
                                         published_label=heading, published_at=release_id,
                                         publication_state='published',
                                         stated_by='a release section on ' + page['url'])
        stated = page.get('most_recent_release')
        if stated:
            release_id = to_date(stated['date_text'])
            if release_id:
                entry = found.setdefault(release_id, dict(base, release_id=release_id,
                                                          published_label=stated['date_text'],
                                                          published_at=release_id,
                                                          official_changes=[]))
                entry['publication_state'] = 'published'
                entry['is_current'] = True
                entry['stated_by'] = '%r on %s' % (stated['sentence'], page['url'])
        for row in page.get('history_rows') or []:
            release_id = to_date(row.get('date_text'))
            if not release_id:
                continue
            entry = found.setdefault(release_id, {
                'release_id': release_id, 'published_label': row['date_text'],
                'published_at': release_id, 'official_changes': [],
                'changelog_source_ref': ref,
                'changelog_url': c.SITE + row['url'] if row.get('url') else page['url']})
            entry.setdefault('publication_state', 'published')
            entry.setdefault('stated_by', 'the standard-history table on ' + page['url'])
        upcoming = page.get('next_release')
        if upcoming:
            release_id = to_date(upcoming['date_text'])
            if release_id:
                announced = dict(base, release_id=release_id, official_changes=[],
                                 published_label=upcoming['date_text'],
                                 published_at=release_id, publication_state='announced',
                                 stated_by='%r on %s' % (upcoming['sentence'], page['url']))
    releases = [found[k] for k in sorted(found, reverse=True)]
    return releases, announced


def match_commit(release, commits, taken):
    """Pick the repository commit that carries a release, and say why.

    The repository was created after the first releases and backfills them in
    order, so commit date is not the signal: the commit subject naming the
    release month is, and a subject that names a different day rules it out.
    """
    published = dt.date.fromisoformat(release['release_id'])
    month_name = published.strftime('%B')
    for commit in commits:
        if 'controls' not in commit or commit['sha'] in taken:
            continue
        subject = commit['subject']
        if month_name not in subject:
            continue
        day_in_subject = re.search(r'%s (\d{1,2})\b' % month_name, subject)
        names_day = day_in_subject is not None
        if names_day and int(day_in_subject.group(1)) != published.day:
            continue
        return {
            'repository': c.REPO_SLUG,
            'sha': commit['sha'],
            'short_sha': commit['short_sha'],
            'committed_at': commit['committed_at'],
            'url': commit['url'],
            'subject': subject,
            'files': commit.get('standard', {}),
            'confidence': 0.95 if names_day else 0.85,
            'rationale': (
                'the commit subject %r names %s, %s; it is the earliest commit carrying the '
                'standard files that is not already matched to an earlier release'
                % (subject,
                   '%s %d' % (month_name, published.day) if names_day else month_name,
                   'the day the official changelog page publishes this release on'
                   if names_day else
                   'the month the official changelog page publishes this release in, but no '
                   'day, so the match is by month alone')),
        }
    return None
