/* @module universe/core/views
   Single responsibility: the pre-defined graph views, as pure preference
   bundles. Each is a common way of looking at a document's universe, applied
   with one click instead of six toggles; the antidote to the every-graph-
   becomes-a-dot-blob problem as the edge count grows. Pure data. */

/** The preset views, in display order. Every pref a preset does not name is
    left exactly as the reader had it. */
export const PRESET_VIEWS = [
  { key: 'overview', label: 'overview',
    prefs: { glay: 'cose', gdoc: true, gtree: false, gpeaks: false, gderived: false,
      gexp: false, gpaths: false, gboxed: false } },
  { key: 'reading-map', label: 'reading map',
    prefs: { glay: 'tree', gdoc: true, gtree: true, gpeaks: false, gderived: false,
      gexp: false, gpaths: false, gboxed: true } },
  { key: 'pyramids', label: 'pyramids',
    prefs: { glay: 'tree', gdoc: true, gtree: false, gpeaks: true, gderived: false,
      gexp: false, gpaths: false, gboxed: true } },
  { key: 'concept-web', label: 'concept web',
    prefs: { glay: 'cose', gdoc: true, gtree: false, gpeaks: false, gderived: true,
      gexp: false, gpaths: false, gboxed: true } },
  { key: 'around-selection', label: 'around selection',
    prefs: { glay: 'cose', gdoc: true, gtree: false, gpeaks: true, gderived: true,
      gexp: true, gdeg: 2, gpaths: true, gboxed: false } },
];
