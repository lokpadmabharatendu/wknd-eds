/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Block library (Columns): first row = block name; subsequent row(s) have one
 * cell per column. Column count is derived from the natural grouping of content.
 *
 * Source DOM: element is a `div.container` wrapping a `.grid-layout` whose direct
 * children are the columns (here: an image column and a text column with
 * breadcrumbs, heading, and byline).
 */
export default function parse(element, { document }) {
  // The grid holds the columns as its direct children.
  const grid = element.querySelector('.grid-layout') || element;
  let columns = Array.from(grid.querySelectorAll(':scope > div'));

  // Fallback: if no direct div children, treat the container's children as columns.
  if (!columns.length) {
    columns = Array.from(element.children).filter((c) => c.tagName === 'DIV');
  }

  // Empty-block guard
  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row: one cell per column.
  cells.push(columns);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
