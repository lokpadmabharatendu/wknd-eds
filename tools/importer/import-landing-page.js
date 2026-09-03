/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionFaqParser from './parsers/accordion-faq.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsImageGridParser from './parsers/cards-image-grid.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import heroMinimalLightWithimg1Parser from './parsers/hero-minimal-light-withimg-1.js';
import heroOverlayDarkParser from './parsers/hero-overlay-dark.js';
import tabsMinimalLightParser from './parsers/tabs-minimal-light.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'accordion-faq': accordionFaqParser,
  'cards-article': cardsArticleParser,
  'cards-image-grid': cardsImageGridParser,
  'columns-feature': columnsFeatureParser,
  'hero-minimal-light-withimg-1': heroMinimalLightWithimg1Parser,
  'hero-overlay-dark': heroOverlayDarkParser,
  'tabs-minimal-light': tabsMinimalLightParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Rich marketing landing layout: hero header followed by multiple full-width feature sections mixing centered intros, multi-column card grids, a tabbed content block, and an inverse overlay call-to-action',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
  ],
  blocks: [
    { name: 'section-hero', instances: ['#main-content > header.section.secondary-section'], section: 'secondary' },
    { name: 'hero-minimal-light-withimg-1', instances: ['#main-content > header.section.secondary-section > div.container'] },
    { name: 'columns-feature', instances: ['#main-content > section.section:nth-of-type(1) > div.container', '#trends > div.container'] },
    { name: 'section-image-grid', instances: ['#main-content > section.section.secondary-section:nth-of-type(2)'], section: 'secondary' },
    { name: 'cards-image-grid', instances: ['#main-content > section.section.secondary-section:nth-of-type(2) .grid-layout.grid-gap-sm'] },
    { name: 'tabs-minimal-light', instances: ['#main-content > section.section:nth-of-type(3) .tabs-wrapper'] },
    { name: 'section-articles', instances: ['#main-content > section.section.secondary-section:nth-of-type(4)'], section: 'secondary' },
    { name: 'cards-article', instances: ['#main-content > section.section.secondary-section:nth-of-type(4) .grid-layout.grid-gap-md'] },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(5) .faq-list', '.faq-list'] },
    { name: 'section-cta', instances: ['#main-content > section.section.inverse-section', '#main-content > section.section.accent-section'], section: 'inverse' },
    { name: 'hero-overlay-dark', instances: ['#main-content > section.section.inverse-section > div.container'] },
  ],
};

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find the top-level source section element that contains a given element.
 * Sections are the direct children of #main-content.
 */
function findOwningSection(el, mainContent) {
  let node = el;
  while (node && node.parentElement) {
    if (node.parentElement === mainContent) return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Returns block instances (parsers) and section-style markers separately, in DOM order.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const sectionMarkers = [];

  template.blocks.forEach((blockDef) => {
    const isSectionMarker = blockDef.name.startsWith('section-');
    let matched = null;
    // Try each selector until one matches (selectors cover variations across pages).
    for (const selector of blockDef.instances) {
      const el = document.querySelector(selector);
      if (el) { matched = el; break; }
    }
    if (!matched) {
      if (!isSectionMarker) console.warn(`Block "${blockDef.name}" not found via any selector`);
      return;
    }
    if (isSectionMarker) {
      sectionMarkers.push({ name: blockDef.name, element: matched, style: blockDef.section });
    } else {
      pageBlocks.push({ name: blockDef.name, element: matched });
    }
  });

  return { pageBlocks, sectionMarkers };
}

/**
 * Build a Section Metadata block table for a given style value.
 */
function createSectionMetadata(document, style) {
  const table = document.createElement('table');
  const headRow = document.createElement('tr');
  const headCell = document.createElement('th');
  headCell.textContent = 'Section Metadata';
  headRow.append(headCell);
  table.append(headRow);

  const row = document.createElement('tr');
  const keyCell = document.createElement('td');
  keyCell.textContent = 'Style';
  const valCell = document.createElement('td');
  valCell.textContent = style;
  row.append(keyCell, valCell);
  table.append(row);
  return table;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // Capture owning source sections and their styles BEFORE parsing detaches nodes.
    const mainContent = document.querySelector('#main-content') || main;
    const { pageBlocks, sectionMarkers } = findBlocksOnPage(document, PAGE_TEMPLATE);

    // Map each source section element -> style, from the section markers.
    const sectionStyle = new Map();
    sectionMarkers.forEach((m) => {
      const owning = m.element.parentElement === mainContent ? m.element : findOwningSection(m.element, mainContent);
      if (owning) sectionStyle.set(owning, m.style);
    });

    // Record, per block, its owning source section (for section break insertion later).
    pageBlocks.forEach((b) => { b.ownerSection = findOwningSection(b.element, mainContent); });

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Parse each block using registered parsers.
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced
      const parser = parsers[block.name];
      if (!parser) { console.warn(`No parser for block: ${block.name}`); return; }
      try {
        // Remember the placeholder so we can find the produced block afterwards.
        const marker = document.createComment(`block:${block.name}`);
        block.element.parentNode.insertBefore(marker, block.element);
        parser(block.element, { document, url, params });
        block.marker = marker;
      } catch (e) {
        console.error(`Failed to parse ${block.name}:`, e);
      }
    });

    // 3. afterTransform cleanup
    executeTransformers('afterTransform', main, payload);

    // 4. Insert section breaks (<hr>) and Section Metadata for styled sections.
    //    Walk parsed blocks in order. When a source section ends (next block belongs
    //    to a different section, or there is no next block), append the section's
    //    Section Metadata (if styled) and a horizontal rule AFTER that section's
    //    blocks — i.e. immediately before the next section's first block marker.
    const orderedBlocks = pageBlocks.filter((b) => b.marker && b.marker.parentNode);
    for (let i = 0; i < orderedBlocks.length; i += 1) {
      const cur = orderedBlocks[i];
      const next = orderedBlocks[i + 1];
      const curStyle = cur.ownerSection ? sectionStyle.get(cur.ownerSection) : undefined;
      const sectionEnds = !next || next.ownerSection !== cur.ownerSection;
      if (!sectionEnds) continue;
      // Anchor point: the next block's marker (end of DOM if this is the last block).
      const anchor = next ? next.marker : null;
      const insertBeforeNode = (node) => {
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(node, anchor);
        else main.appendChild(node);
      };
      if (curStyle) insertBeforeNode(createSectionMetadata(document, curStyle));
      if (next) insertBeforeNode(document.createElement('hr'));
    }

    // Clean up markers.
    pageBlocks.forEach((b) => { if (b.marker && b.marker.parentNode) b.marker.remove(); });

    // 5. WebImporter built-in rules.
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map homepage to /index).
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
