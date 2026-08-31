# Source policy

## Which source wins

| Question | Source |
|---|---|
| What does the standard say now? | the website |
| What did it say before? | the official changelog repository |
| When was a release published? | the official changelog page's own statement |
| What changed in a release? | the official changelog page's change table, kept verbatim and separate from anything derived |

Where the website and the repository disagree, **neither wins**. Both readings are
preserved, the difference is classified, and a difference that changes meaning stops
the release being published as `validated`.

## What was retrieved, and how

- User agent: `sgit-ai-aiuc1-catalog/<version> (+https://graphs.sgit.ai; derived
  machine-readable catalog; contact via graphs.sgit.ai)`.
- Rate: at most one request per second per host.
- `robots.txt`: fetched before any page. At capture time `https://www.aiuc-1.com/robots.txt`
  answered HTTP 404, so there were no directives to honour; the manifest records that
  observation verbatim rather than the conclusion alone.
- No authentication, no private endpoints, no non-public APIs, no slug guessing. Every
  page fetched was linked from a page already fetched.
- The GitHub repository was read as a public git clone.

## What is retained

Gzipped copies of the exact response bodies, inside the vault, under
`evidence/snapshots/<day>/`. They exist so a reader can check a claim against the
bytes rather than trusting this build. A drift run keeps a new snapshot only where
the extracted model actually changed.

## The open question about redistribution

**Reuse rights for the full AIUC-1 control text have not been confirmed with AIUC.**
This catalog reproduces control wording so a reader can verify what was extracted.
Before publishing this content anywhere public, confirm with AIUC whether:

1. full control text may be republished, or only metadata, hashes and source links;
2. an official export or API exists or is planned, so that this could become a
   supported integration rather than a derived catalog;
3. the website's control URLs are intended to be stable permalinks;
4. sub-controls are normative requirements, examples, or implementation guidance —
   this catalog treats them as published requirements and says so, but the source
   does not state it;
5. what attribution, caching and redistribution terms apply.

Until those are answered, the honest position is the one `NOTICE.md` takes: this is
evidence with a chain of custody, not a mirror, and removal will be honoured on
request.
