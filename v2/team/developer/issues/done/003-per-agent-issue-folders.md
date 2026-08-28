---
created: 2026-08-28T18:42:53Z
priority: medium
source: MAB-08 on the project board; the founder's ask after reading issues-fs.sgit.ai
closed: 2026-08-28T18:42:53Z
---

# Per-agent issue folders, on the Issues-FS-lite pattern

The board showed the workstreams. What did not exist was the day-to-day list each
role owns, which is the half the founder asked for: *"the management of the tasks
around the creation of the book, namely around the coordination and sync of the
multiple agents and the reviews."*

**Done.** Three folders per role, status is the folder, four `git mv` operations, the
writer rule written down, and the free `find` status view. The specification is
Issues-FS-lite's and needed no implementation, which is the point of choosing it.

The board's issues board is now **derived from these files** rather than authored in
the generator, so there is one source of truth and the folder is it.
