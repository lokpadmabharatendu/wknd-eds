/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Block library (Accordion): 2-column table. First row = block name.
 * Each subsequent row = one accordion item: [title cell, content cell].
 *
 * Source DOM: element is `.faq-list` containing `<details class="faq-item">`.
 * Each item has `<summary class="faq-question"><span>Title</span><img></summary>`
 * and `<div class="faq-answer">...</div>`.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each accordion item is a <details class="faq-item"> (fallback: any details / .faq-item)
  const items = element.querySelectorAll(':scope > details.faq-item, :scope > details, details.faq-item');

  items.forEach((item) => {
    // Title comes from the summary's text (span), excluding the toggle icon image.
    const summary = item.querySelector('summary.faq-question, summary');
    let titleCell = '';
    if (summary) {
      const titleSpan = summary.querySelector('span');
      if (titleSpan) {
        titleCell = titleSpan;
      } else {
        // Fallback: use summary text without images
        titleCell = summary.textContent.trim();
      }
    }

    // Content is the answer container (fallback: everything after the summary).
    const answer = item.querySelector('.faq-answer, .faq-content');
    let contentCell = '';
    if (answer) {
      contentCell = answer;
    } else if (summary) {
      // Fallback: collect sibling nodes after the summary
      const rest = Array.from(item.children).filter((c) => c !== summary);
      contentCell = rest.length ? rest : '';
    }

    // Only add a row if there is a title or content
    if (titleCell || contentCell) {
      cells.push([titleCell, contentCell]);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
