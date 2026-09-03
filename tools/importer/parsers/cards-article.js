/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Block library (Cards): 2-column table. First row = block name.
 * Each subsequent row = one card: [image cell, text-content cell].
 * Text cell may contain title (heading), description, and CTA.
 *
 * Source DOM: element is a `.grid-layout` containing `<a class="article-card card-link">`.
 * Each card has `.article-card-image > img` and `.article-card-body`
 * (with `.article-card-meta` spans and an `h3` heading).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each card is a card-link anchor. Handle both the blog article-card and the
  // category trend-card conventions (and any generic *-card anchor).
  let cards = element.querySelectorAll(':scope > a.card-link, :scope > a[class*="-card"]');
  if (cards.length === 0) {
    cards = element.querySelectorAll('a.card-link, a.article-card, a.trend-card, .article-card, .trend-card');
  }

  cards.forEach((card) => {
    // First cell: the card image
    const img = card.querySelector('[class*="-card-image"] img, img');
    const imageCell = img || '';

    // Second cell: text content (meta/tag, heading, optional description).
    const textContent = [];

    // Meta line: article cards use .article-card-meta; trend cards use .tag.
    const meta = card.querySelector('.article-card-meta, .tag');
    if (meta) textContent.push(meta);

    // Preserve the card's destination by wrapping the heading text in a link
    // (the whole card is an anchor in the source). Avoids duplicating heading text.
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="heading"]');
    const href = card.getAttribute('href');
    if (heading) {
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        while (heading.firstChild) link.appendChild(heading.firstChild);
        heading.appendChild(link);
      }
      textContent.push(heading);
    }

    // Optional description paragraph (trend cards have one; article cards don't).
    const desc = card.querySelector('p');
    if (desc) textContent.push(desc);

    // Only add a row if there's meaningful content
    if (imageCell || textContent.length) {
      cells.push([imageCell, textContent.length ? textContent : '']);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
