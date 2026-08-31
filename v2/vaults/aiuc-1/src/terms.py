"""Pure vocabulary maths: tokens, stems, rarity, and what two texts share.

@module No files, no network, no graph. Given texts it yields the terms in them,
folds a term to a stem so `agents` and `agent` are one term, scores a term by how
rare it is across a corpus, and reports what two texts share AND what each holds
alone. The last half matters as much as the first: a bridge that only lists
matches hides the gap, and a gap is the honest half of a mapping.

The estate's own stemmer is vocabulary-relative to a single document. A bridge
spans two corpora, so the stem space has to span them too; this one is
deliberately dumb, deterministic, and stated rather than clever.
"""
import math
import re

WORD = re.compile(r"[A-Za-z][A-Za-z0-9_]*(?:['’-][A-Za-z0-9_]+)*")

# Function words and the vocabulary every control-standard sentence uses. A term on
# this list carries no signal about WHICH clause a text is about, so it is not evidence
# of anything. Curated, not exhaustive, and listed rather than inferred.
STOP = set("""a an the this that these those it its is are was were be been being am and
or but nor so yet for of in on at by to from with without within into onto over under
between through during before after above below up down out off again further then once
here there when where why how all any both each few more most other some such no not only
own same than too very can will just should now shall may must if as we you they he she i
their our your his her them us who whom which what while about against because until upon
per via across among throughout whether either neither also however therefore thus hence
including include includes included e.g i.e etc ie eg
ai system systems use used using ensure ensuring provide providing implement implementing
process processes control controls requirement requirements organisation organization
organizations must should may shall example examples""".split())

MIN_LENGTH = 3


def terms_of(text):
    """The distinct stems in a text, lowercased, function words dropped."""
    out = {}
    for match in WORD.finditer(text or ''):
        word = match.group(0).lower()
        if len(word) < MIN_LENGTH or word in STOP:
            continue
        stem = stem_of(word)
        if stem in STOP or len(stem) < MIN_LENGTH:
            continue
        out.setdefault(stem, set()).add(word)
    return {k: sorted(v) for k, v in out.items()}


def stem_of(word):
    """A deterministic, deliberately shallow stem. Stated, not clever."""
    for suffix, keep in (('ies', 'y'), ('ing', ''), ('ers', 'er'), ('ed', ''),
                         ('es', ''), ('s', '')):
        if word.endswith(suffix) and len(word) - len(suffix) >= 4:
            base = word[:len(word) - len(suffix)] + keep
            if suffix in ('ing', 'ed') and base and base[-1] == base[-2:-1] and len(base) > 3:
                base = base[:-1]          # logging -> log, not logg
            return base
    return word


class Corpus:
    """A body of texts, so a term can be scored by how few of them use it."""

    def __init__(self, texts):
        self.size = max(1, len(texts))
        self.document_frequency = {}
        for text in texts:
            for stem in terms_of(text):
                self.document_frequency[stem] = self.document_frequency.get(stem, 0) + 1

    def rarity(self, stem):
        """Inverse document frequency, normalised to 0..1. A term in every text
        scores 0; a term in one text scores near 1."""
        seen = self.document_frequency.get(stem, 0)
        if seen <= 0:
            return 1.0
        return round(math.log(self.size / seen) / math.log(self.size), 4) if self.size > 1 else 1.0

    def distinctive(self, stem, floor=0.35):
        return self.rarity(stem) >= floor


def compare(left_text, right_text, corpus, floor=0.35):
    """What two texts share and what each holds alone, with the rarity of each term.

    @returns a dict with `shared`, `only_left`, `only_right` and a `score`. The score
    is the summed rarity of the shared distinctive terms over the summed rarity of
    every distinctive term on the right, so it answers 'how much of the clause's
    distinctive vocabulary does this text reach?' rather than 'do they look alike'.
    """
    left, right = terms_of(left_text), terms_of(right_text)
    shared_stems = sorted(set(left) & set(right))
    shared = [{'stem': s, 'rarity': corpus.rarity(s),
               'as_written': sorted(set(left[s]) | set(right[s]))}
              for s in shared_stems if corpus.distinctive(s, floor)]
    only_right = [{'stem': s, 'rarity': corpus.rarity(s), 'as_written': right[s]}
                  for s in sorted(set(right) - set(left)) if corpus.distinctive(s, floor)]
    only_left = [{'stem': s, 'rarity': corpus.rarity(s), 'as_written': left[s]}
                 for s in sorted(set(left) - set(right)) if corpus.distinctive(s, floor)]
    reachable = sum(t['rarity'] for t in shared)
    total_right = reachable + sum(t['rarity'] for t in only_right)
    return {
        'shared': sorted(shared, key=lambda t: -t['rarity']),
        'only_left': sorted(only_left, key=lambda t: -t['rarity'])[:12],
        'only_right': sorted(only_right, key=lambda t: -t['rarity'])[:12],
        'shared_count': len(shared),
        'score': round(reachable / total_right, 4) if total_right else 0.0,
        'weight': round(reachable, 4),
    }
