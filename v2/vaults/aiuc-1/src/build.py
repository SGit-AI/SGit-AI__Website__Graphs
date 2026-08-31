"""Run the whole catalog chain, in order, and stop at the first failure.

@module discover -> capture -> parse pages -> parse changelog -> normalize ->
diff -> graph -> validate. Each stage is a module that can be run on its own;
this is the order they have to run in, and the one CI runs.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

STAGES = (
    ('discover_sources', 'discover the domains and controls the site publishes'),
    ('fetch_sources', 'capture every discovered page as a content-addressed snapshot'),
    ('parse_pages', 'read each control from its own page'),
    ('parse_changelog', 'read the official changelog repository and pages'),
    ('normalize_catalog', 'build one artefact per release'),
    ('diff_releases', 'turn release differences into change events'),
    ('build_docgraph', 'decompose every source document to the word, and prove it rebuilds'),
    ('build_meaning', 'connect the paragraphs and the words to external anchors'),
    ('build_graph', 'decompose the catalog into one graph'),
    ('validate', 'schema, traceability, semantic and inventory gates'),
)


def main(only=None):
    started = time.time()
    for name, description in STAGES:
        if only and name not in only:
            continue
        print('== %s — %s' % (name, description))
        module = __import__(name)
        if hasattr(module, 'main'):
            module.main()
        elif name == 'normalize_catalog':
            import releases
            for line in releases.build_all(module.build_control):
                print('   ' + line)
        elif name == 'parse_pages':
            result = module.parse()
            print('   %d controls, %d confirmed by their own page, %d findings' % (
                result['control_count'], result['confirmed_by_own_page'],
                len(result['findings'])))
        elif name == 'discover_sources':
            result = module.build()
            print('   %d domains, %d controls' % (result['domain_count'],
                                                  result['control_count']))
        else:
            module.build() if hasattr(module, 'build') else module.run()
    report = c.read_json('reports/validation-latest.json')
    print('== %s in %.1fs' % ('PASS' if report['passed'] else 'FAIL', time.time() - started))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:] or None))
