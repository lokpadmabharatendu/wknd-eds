/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-image-grid. Base: cards.
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Block library (Cards): 2-column table. First row = block name.
 * Each subsequent row = one card: [image cell, text-content cell].
 *
 * Source DOM: element is a `.grid-layout.grid-gap-sm` containing image-only
 * cards `<div class="utility-aspect-1x1"><img class="cover-image"></div>`.
 * These cards have no text, so the text cell is padded empty to keep rows even.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each card is a direct child wrapper containing an image (fallback: any img wrapper)
  let items = element.querySelectorAll(':scope > div');
  if (!items.length) {
    items = element.querySelectorAll('.utility-aspect-1x1');
  }

  items.forEach((item) => {
    const img = item.querySelector('img') || (item.tagName === 'IMG' ? item : null);
    if (!img) return;

    // Optional text content within the card (heading/description/CTA)
    const textContent = [];
    const heading = item.querySelector('h1, h2, h3, h4, h5, h6, [class*="heading"]');
    if (heading) textContent.push(heading);
    const paras = item.querySelectorAll('p');
    paras.forEach((p) => textContent.push(p));

    // 2-column Cards: image cell + text cell (padded empty when no text)
    cells.push([img, textContent.length ? textContent : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-image-grid', cells });
  element.replaceWith(block);
}
