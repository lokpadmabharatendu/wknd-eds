/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-light-withimg-1. Base: hero.
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Block library (Hero): 1 column, 3 rows. Row 1 = block name.
 * Row 2 (single cell) = background image(s). Row 3 (single cell) = title,
 * subheading, and CTA(s).
 *
 * Source DOM: element is a `div.container`. It holds a text column
 * (h1, subheading `p`, `.button-group` of links) and an image column
 * (multiple `img.cover-image`).
 */
export default function parse(element, { document }) {
  // Images (background/visual row)
  const images = Array.from(element.querySelectorAll('img'))
    .filter((img) => !img.src.startsWith('data:')); // exclude inline icon SVGs

  // Text content
  const heading = element.querySelector('h1, h2, h3, [class*="heading"]');
  const subheading = element.querySelector('.subheading, p');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  const cells = [];

  // Row 2: background image(s) — only if present
  if (images.length) {
    cells.push([images]);
  }

  // Row 3: title + subheading + CTAs
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);

  // Empty-block guard
  if (!heading && !subheading && !images.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-light-withimg-1', cells });
  element.replaceWith(block);
}
