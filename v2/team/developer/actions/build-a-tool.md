# Action: build a tool

**Precondition, from brief 40:** *"I don't create tools because I want to create tools. I
create tools because there's inefficiency, and I want to improve my efficiency."*

State the inefficiency first, in one sentence, with the cost it imposes. If that sentence
cannot be written, the action stops here.

**Method**
1. Pure core first, in a `core/` module with no DOM access, with its tests.
2. Then the component that owns its element; then the shell that wires it.
3. `@module` header stating one responsibility.
4. Under the size guideline, or the deviation stated in the header.
5. Both gates green before the push.

**Done test** the inefficiency is measurably gone, and the tool has reached the state
where nobody wants to change it. Until then it is not finished, it is in use.
