/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-minimal-light. Base: tabs.
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Block library (Tabs): 2-column table. First row = block name.
 * Each subsequent row = one tab: [tab label cell, tab content cell].
 *
 * Source DOM: element is `.tabs-wrapper` containing:
 *  - `.tabs-content` with `.tab-pane` panels (content), one per tab.
 *  - `.tab-menu` with `.tab-menu-link` buttons (labels), one per tab.
 * Labels and panels are paired by order.
 */
export default function parse(element, { document }) {
  // Content panels (in order)
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane, .tab-pane'));

  // Label buttons (in order) — carry the tab name/role
  const labels = Array.from(element.querySelectorAll('.tab-menu .tab-menu-link, .tab-menu-link'));

  const cells = [];

  panes.forEach((pane, i) => {
    const labelBtn = labels[i];

    // Label cell: prefer the text label from the menu button; fall back to a
    // generated label if the menu is absent.
    let labelCell = '';
    if (labelBtn) {
      // Use the button's text content as a clean label (exclude avatar image)
      const labelText = labelBtn.textContent.replace(/\s+/g, ' ').trim();
      labelCell = labelText || `Tab ${i + 1}`;
    } else {
      labelCell = `Tab ${i + 1}`;
    }

    // Content cell: the panel's inner content
    const contentCell = pane;

    cells.push([labelCell, contentCell]);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-minimal-light', cells });
  element.replaceWith(block);
}
