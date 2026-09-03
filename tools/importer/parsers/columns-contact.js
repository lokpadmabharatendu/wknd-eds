/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact. Base: columns.
 * Source: https://wknd-trendsetters.site/faq (faq-page template)
 * Generated: 2026-09-03
 *
 * Block library (Columns): first row = block name; subsequent row(s) have one
 * cell per column. Column count is derived from the natural grouping of content.
 *
 * Source DOM: element is a `div.container` wrapping a `.grid-layout` whose direct
 * children are the columns. This is a text-only two-column contact layout:
 *   - Left column: an <h2> heading ("Let's connect") + intro <p>.
 *   - Right column: a `.contact-items` list of stacked detail items, each an
 *     <h3> label plus a link (email/phone) or paragraph (address).
 * No image column (unlike columns-feature) — model as one row, two text cells.
 */
export default function parse(element, { document }) {
  // The grid holds the columns as its direct children.
  const grid = element.querySelector('.grid-layout') || element;
  let columns = Array.from(grid.querySelectorAll(':scope > div'));

  // Fallback: if no direct div children, treat the container's children as columns.
  if (!columns.length) {
    columns = Array.from(element.children).filter((c) => c.tagName === 'DIV');
  }

  // Empty-block guard: nothing to render, unwrap the element's contents.
  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row: one cell per column (preserves headings, links, and
  // paragraphs as semantic HTML within each cell).
  cells.push(columns);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
