/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay-dark. Base: hero.
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Block library (Hero): 1 column, 3 rows. Row 1 = block name.
 * Row 2 (single cell) = background image. Row 3 (single cell) = title,
 * subheading, and CTA(s).
 *
 * Source DOM: element is a `div.container`. It has an overlay hero with a
 * background `img.cover-image` and a `.card-body` holding heading, subheading,
 * and a `.button-group` CTA.
 */
export default function parse(element, { document }) {
  // Background image (exclude inline data-uri icons)
  const bgImage = Array.from(element.querySelectorAll('img'))
    .find((img) => !img.src.startsWith('data:'));

  // Text content
  const heading = element.querySelector('h1, h2, h3, [class*="heading"]');
  const subheading = element.querySelector('.subheading, p');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  const cells = [];

  // Row 2: background image — only if present
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: title + subheading + CTAs
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);

  // Empty-block guard
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay-dark', cells });
  element.replaceWith(block);
}
