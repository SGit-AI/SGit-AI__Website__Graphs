/* @module home
   The published entry point for the front door's live demo. The implementation is in
   assets/home/ (core/portgraph: what the graph can say; graph: the element that draws
   it and lets you drag it). This file exists so the page URL for the script never
   changes, and so index.html loads exactly one module. */
import './home/graph.js';
