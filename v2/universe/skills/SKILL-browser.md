# universe-reader — SKILL-browser

How to drive a universe document page from the browser console, Playwright, or any agent
running JavaScript on the page. The UI is one consumer of this API; you are an equal one.

## Getting the tool

```js
// After the page loads (the tool announces itself):
window.addEventListener('tool:ready', (e) => console.log('ready:', e.detail.instanceId));

// Or just grab it — it is published once the reader has booted:
const tool = window.__tool;                       // the one tool on the page
tool.meta.health();                               // { status: 'ready', methods: [...] }
```

## Reading the universe

```js
await tool.get_doc();                             // what document this is
await tool.get_nodes({ family: 'claim' });        // the 27 claims with support states
await tool.get_node({ id: 'meaning-through-connectivity' });
const a = await tool.get_anchor({ id: 'fractal-principle' });
await tool.get_source_text({ start: a.chars[0] - 500, end: a.chars[1] + 500 });
```

## Driving the reader

```js
await tool.select_node({ id: 'fractal-principle' });   // row + source bytes + graph ring
await tool.explore_selection({ on: true, degrees: 2 }); // keep only its 2-hop neighbourhood
await tool.set_layout({ layout: 'tree' });             // lay that neighbourhood out as a tree
await tool.set_view_preset({ view: 'pyramids' });      // or one of the reader's preset views
await tool.fit_graph();
await tool.explore_selection({ on: false });
await tool.clear_selection();
```

## Playwright

```js
await page.goto('https://graphs.sgit.ai/v2/universe/thinking-in-graphs.html');
await page.waitForFunction(() => window.__tool?.meta.health().status === 'ready');
const claims = await page.evaluate(() => window.__tool.get_nodes({ family: 'claim' }));
await page.evaluate(() => window.__tool.select_node({ id: 'node' }));
```

## The audit trail

```js
tool.meta.getLog();      // last 500 invocations: params, result, duration, errors
```

## For an LLM consumer

`tool.get_tool_schemas({ levels: ['read', 'view'] })` returns OpenAI function-calling schemas.
Execute a tool call by name: `await tool[call.function.name](JSON.parse(call.function.arguments))`.
The `author` level is off by default and proposes rather than writes: its drafts come back from
`get_drafts()` as JSON for a human to carry into the repository.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
