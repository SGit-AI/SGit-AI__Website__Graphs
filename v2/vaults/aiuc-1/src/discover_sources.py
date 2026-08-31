"""Discover AIUC-1 domains and controls from the official site, before parsing.

@module Reads the public home page, recovers the published navigation model it
embeds, and writes evidence/discovery-manifest.json: every domain, every control,
every control URL, plus the reference pages (crosswalks, evidence categories,
changelog) worth capturing. Nothing here is hardcoded; a control that stops being
published stops being discovered.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import rsc
from fetch_sources import Fetcher

REFERENCE_KEYS = ('crosswalks', 'evidence')


def principles_from_html(html_text):
    """The site publishes its whole control model in the page payload. Read it.

    The value is taken literally out of the payload rather than by resolving the
    whole page: the page tree is a graph with cycles, and only the principles
    value is wanted.
    """
    flat = rsc.flatten(html_text)
    raw = rsc.literal(flat, 'principles')
    if not isinstance(raw, list) or not raw:
        raise ValueError('no principles model found in page payload; layout changed')
    tree = rsc.reresolve(rsc.prune(raw, {'principle'}))
    return rsc.undefined_to_none(tree)


def reference_pages(html_text):
    """Crosswalk and evidence-category pages linked from the home page."""
    found = {}
    for href in sorted(set(re.findall(r'href="(/[a-z0-9-]+/[a-z0-9-]+)"', html_text))):
        head = href.strip('/').split('/')[0]
        if head in REFERENCE_KEYS:
            found[href] = {'key': href.strip('/').replace('/', '__'), 'url': href, 'kind': head}
    for href in ('/changelog', '/crosswalks', '/evidence', '/scoping'):
        if 'href="%s"' % href in html_text:
            found[href] = {'key': href.strip('/'), 'url': href, 'kind': 'page'}
    return found


def release_pages(changelog_html):
    """Per-release changelog pages, discovered from the changelog page itself."""
    found = {}
    hrefs = set(re.findall(r'href="(/changelog/[^"]+)"', changelog_html))
    hrefs |= set(re.findall(r'"href":"(/changelog/[^"]+)"', rsc.flatten(changelog_html)))
    for href in sorted(hrefs):
        found[href] = {'key': href.strip('/').replace('/', '__'), 'url': href,
                       'kind': 'release_changelog'}
    return found


def build(day=None):
    day = day or c.now_iso()[:10]
    fetcher = Fetcher(day)
    home_ref = c.source_ref_id(day, 'page', 'home')
    observation, html_text = fetcher.fetch(c.SITE + '/', home_ref)

    principles = principles_from_html(html_text)
    domains = []
    for principle in principles:
        controls = []
        for control in principle.get('requirements') or []:
            controls.append({
                'id': control['id'],
                'title': control.get('name'),
                'slug': control.get('slug'),
                'url': control.get('url'),
            })
        domains.append({
            'id': principle['id'],
            'name': principle.get('name'),
            'slug': principle.get('slug'),
            'url': principle.get('url'),
            'description': principle.get('description'),
            'control_count': len(controls),
            'controls': controls,
        })

    manifest = {
        'discovery_version': '1.0.0',
        'discovered_at': c.now_iso(),
        'root_url': c.SITE + '/',
        'discovery_method': 'published navigation model embedded in the home page payload',
        'source_ref': home_ref,
        'domain_count': len(domains),
        'control_count': sum(d['control_count'] for d in domains),
        'domains': domains,
        'reference_pages': [],
    }

    pages = reference_pages(html_text)
    changelog_ref = c.source_ref_id(day, 'page', 'changelog')
    _, changelog_html = fetcher.fetch(c.CHANGELOG_URL, changelog_ref)
    pages.update(release_pages(changelog_html))
    manifest['reference_pages'] = [pages[k] for k in sorted(pages)]
    manifest['release_page_count'] = sum(
        1 for p in manifest['reference_pages'] if p['kind'] == 'release_changelog')
    c.write_json('evidence/discovery-manifest.json', manifest)
    c.write_json('build/home-principles.json', principles)
    fetcher.save_manifest()
    return manifest


if __name__ == '__main__':
    result = build(sys.argv[1] if len(sys.argv) > 1 else None)
    print('discovered %d domains, %d controls, %d reference pages' % (
        result['domain_count'], result['control_count'], len(result['reference_pages'])))
    for domain in result['domains']:
        print('  %s %-16s %2d controls  %s' % (
            domain['id'], domain['name'], domain['control_count'], domain['url']))
