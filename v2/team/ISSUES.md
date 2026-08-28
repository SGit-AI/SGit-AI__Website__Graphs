# The issue folders — how an agent keeps its own work plan

Every role folder carries `issues/`, and inside it three folders:

```
v2/team/<role>/issues/
  open/      what this role intends to do
  blocked/   started or accepted, waiting on something named
  done/      finished, kept as the record
```

**The status is the folder.** There is no status field to forget to update, and no
second place where the truth might live. Moving an issue is `git mv`, and there are
exactly four operations:

| Operation | What it is |
|---|---|
| **OPEN** | write a new file into `open/` |
| **BLOCK** | `git mv open/NNN-*.md blocked/` and add `blocked_on:` |
| **UNBLOCK** | `git mv blocked/NNN-*.md open/` and remove `blocked_on:` |
| **CLOSE** | `git mv open/NNN-*.md done/` and add `closed:` |

Nothing else moves an issue. No tool is required and none exists: this is the
**Issues-FS-lite** pattern, specified at
[issues-fs.sgit.ai/lite/](https://issues-fs.sgit.ai/lite/index.html), which is the
project the three February 2026 documents in this estate's corpus were written for.
The specification is complete and needs no implementation, which is why there is none
here either.

## The file

`NNN-kebab-slug.md`, numbered **per role** from `001`. Two roles both having a `003`
is normal and means nothing; the identity is the path.

```markdown
---
created: 2026-08-28T18:42:53Z
priority: high
source: v0.6.11 — the workflow document's QA opinion
estimated_effort: a day
blocked_on: the founder            # only in blocked/
closed: 2026-08-28T18:42:53Z       # only in done/
---

# The title, one line

The body is **your own action plan**, in your own words. If you do not yet know how
to approach it, the specification's instruction is to write that down rather than
leave the body empty.
```

`created` and `priority` are required and the build refuses a file without them.
`source`, `estimated_effort`, `blocked_on` and `parent` are recommended.

## The writer rule

**You may read another role's `issues/` folder. You must not write into it.**

Tasks arrive by request, not by being filed on someone else's behalf. Each role owns
its own work plan, and an agent that edits another's has taken a decision that was
not its to take. This cannot be enforced by a build; it is enforced by the diff being
readable, which is the same way the branch discipline is enforced.

## The free status view

```bash
find v2/team -path '*/issues/open/*.md'      # everything open, whoever owns it
find v2/team -path '*/issues/blocked/*.md'   # everything waiting, and on what
```

That is a whole-team status view with no tool, and it falls out of the layout. The
rendered version is [the issue explorer](issues.html), and the counts feed the
making-of book's [project board](../books/making-a-book/board.html).

## Committing

Commit an issue change **in the same commit as the work that caused it**. An issue
closed in its own commit has lost the link to the thing that closed it, and that link
is most of what the folder is for.
