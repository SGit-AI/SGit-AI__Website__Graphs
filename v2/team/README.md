# The team

Seven roles, one folder each. Brief 40 specifies the shape exactly: *"a folder that
provides a whole bunch of definitions per role, so every role has a folder. Every role has
a role.md, has actions, has briefs, has debriefs, and basically has this work
environment."*

## Why this exists

Not for throughput. For **judgement**. The founder's reason, in the memo:

> It was very powerful when you have agents advocating for certain things, who have
> specific centres of gravity.

A single generalist agent asked "should we rename this book?" produces one answer shaped by
whatever it happened to read last. Seven roles with declared centres of gravity produce
seven answers that disagree in useful ways, and a decision made against disagreement is
worth more than a decision made against silence. Isolation is the second reason, and it is
practical: a role spun up on its own carries only its own context.

## The shape of a role folder

```
v2/team/<role>/
  role.md        Identity, Foundation, Primary Responsibilities, Core Workflows
  actions/       one file per thing the role can be asked to do, each naming
                 its inputs, its output and its done test
  briefs/        what the role was asked      — vX.Y.Z__<slug>.md
  debriefs/      what it did and what it learnt — vX.Y.Z__<slug>.md
```

`briefs/` and `debriefs/` start empty. They are the work environment, and they fill up as
the role is actually used; an empty debriefs folder is an honest statement that the role
has not run yet. **Outputs are stamped with the site version at the time of writing**, so a
debrief can be placed against the release history without opening it.

### The role definition itself

`role.md` carries four sections, and the first two are where the work is:

- **Identity** — a table with the role's **Core Mission**, its **Central Claim** (the thing
  it can be held to), and its **Not Responsible For** (the boundary that stops it drifting
  into another role's territory).
- **Foundation** — the principles it works under, each with the reason it exists here.
  Most of these were learnt by getting something wrong.
- **Primary Responsibilities** — what it owns, concretely, naming real paths.
- **Core Workflows** — numbered steps for the things it does repeatedly.

## Where this shape came from

The founder pointed at an existing team in the memo: *"We already have good definitions and
good examples from other projects, especially the Send project."* That is
[`the-cyber-boardroom/SGraph-AI__App__Send`](https://github.com/the-cyber-boardroom/SGraph-AI__App__Send),
whose `team/` folder carries seventeen roles under the same discipline.

**Inherited from it**, because it is proven and reinventing it would be worse: the Identity
table with Core Mission, Central Claim and Not Responsible For; the principles table; the
numbered Core Workflows; and version-stamped outputs.

**Not inherited**, because this estate is a different job: its role list (seventeen roles
including AppSec, DevOps, GRC and a DPO, which a three-book publishing estate does not
need), its Issues FS, and its Wardley tier folders (`town-planner/`, `villager/`) which
split roles by evolution stage. Brief 40 names two audiences in those terms but does not
ask for the roles to be split that way, so they are not.

**Kept from brief 40 over Send's convention**: the file is `role.md`, lowercase, because
the memo says so directly — *"every role has a role.md"*. Send uses `ROLE.md`.

## The roles

| Role | Central claim, in short | Owns |
|---|---|---|
| [librarian](librarian/role.md) | Nothing is lost and everything is findable | the indexes, the registers, the naming |
| [researcher](researcher/role.md) | No claim without an anchor | the questions, the evidence, the corpus |
| [writer](writer/role.md) | The reader who stops early still gets a whole book | the chapter markdown |
| [editor](editor/role.md) | The book's voice, and what it refuses to claim | structure, voice, the caveats |
| [developer](developer/role.md) | The scaffolding is more important than the code | generators, gates, the client modules |
| [qa](qa/role.md) | A gate anyone can silence is not a gate | the suites, the gates, the drift checks |
| [publisher](publisher/role.md) | A version is a promise to a reader | releases, versions, Leanpub, the covers |

## Two rules that apply to every role

**Every role here is customised to this estate.** Brief 40 is explicit: *"It's not just a
writer. It's a writer for this type of book … It's not just a developer — it's a developer
focusing on the JavaScript stack that we have, the CI pipeline that we have."* A role
definition that would read the same in any repository has failed.

**The team arrived late, and the books must say so.** From the memo: *"It's important to
say that they don't start here. In fact, look at the situation. I'm only introducing these
now, not in the beginning."* One person and one agent wrote three books before this folder
existed. The team is what the work grew into, not what it started as, and any chapter that
presents it as a starting condition is wrong.
