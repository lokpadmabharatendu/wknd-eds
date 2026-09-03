/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsFeatureParser from './parsers/columns-feature.js';
import heroMinimalLightWithimg1Parser from './parsers/hero-minimal-light-withimg-1.js';
import cardsArticleParser from './parsers/cards-article.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-minimal-light-withimg-1': heroMinimalLightWithimg1Parser,
  'columns-feature': columnsFeatureParser,
  'cards-article': cardsArticleParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'content-listing',
  description: 'Index/listing layout: hero header, intro block, card grid of entries, accent CTA',
  urls: [
    'https://wknd-trendsetters.site/blog',
    'https://wknd-trendsetters.site/case-studies',
    'https://wknd-trendsetters.site/fashion-insights',
  ],
  blocks: [
    { name: 'section-hero', instances: ['#main-content > header.section.secondary-section'], section: 'secondary' },
    { name: 'hero-minimal-light-withimg-1', instances: ['#main-content > header.section.secondary-section > div.container'] },
    { name: 'columns-feature', instances: ['#main-content > section.section:nth-of-type(1) > div.container'] },
    { name: 'section-articles', instances: ['#articles'], section: 'secondary' },
    { name: 'cards-article', instances: ['#articles .grid-layout.grid-gap-md'] },
    { name: 'section-cta', instances: ['#main-content > section.section.accent-section'], section: 'accent' },
  ],
};

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

function findOwningSection(el, mainContent) {
  let node = el;
  while (node && node.parentElement) {
    if (node.parentElement === mainContent) return node;
    node = node.parentElement;
  }
  return null;
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const sectionMarkers = [];
  template.blocks.forEach((blockDef) => {
    const isSectionMarker = blockDef.name.startsWith('section-');
    let matched = null;
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
 * Capture the ordered list of source top-level sections and the style each
 * should carry (from the template's section- markers). Runs before parsing so
 * section elements (incl. default-content-only ones) are still attached.
 */
function captureSourceSections(document, mainContent, sectionMarkers) {
  const styleByEl = new Map();
  sectionMarkers.forEach((m) => {
    const owning = m.element.parentElement === mainContent
      ? m.element : findOwningSection(m.element, mainContent);
    if (owning) styleByEl.set(owning, m.style);
  });
  return [...mainContent.children].map((el) => ({ el, style: styleByEl.get(el) }));
}

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
    const mainContent = document.querySelector('#main-content') || main;
    const { pageBlocks, sectionMarkers } = findBlocksOnPage(document, PAGE_TEMPLATE);

    // Capture source sections (order + style) BEFORE parsing detaches nodes.
    // Append an end-marker inside each source section so we can insert section
    // breaks / metadata at the right spot even for default-content-only sections.
    const sourceSections = captureSourceSections(document, mainContent, sectionMarkers);
    sourceSections.forEach((s) => {
      const marker = document.createComment('section-end');
      s.el.appendChild(marker);
      s.marker = marker;
    });

    executeTransformers('beforeTransform', main, payload);

    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) { console.warn(`No parser for block: ${block.name}`); return; }
      try {
        parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name}:`, e);
      }
    });

    executeTransformers('afterTransform', main, payload);

    // Insert a section break (<hr>) and Section Metadata (if styled) at the end
    // of each source section, driven by the source section order — this keeps
    // default-content-only sections (e.g. accent CTA bands) and their styles.
    const liveSections = sourceSections.filter((s) => s.marker && s.marker.parentNode);
    liveSections.forEach((s, i) => {
      const isLast = i === liveSections.length - 1;
      const anchor = s.marker;
      if (s.style) anchor.parentNode.insertBefore(createSectionMetadata(document, s.style), anchor);
      if (!isLast) anchor.parentNode.insertBefore(document.createElement('hr'), anchor);
    });

    sourceSections.forEach((s) => { if (s.marker && s.marker.parentNode) s.marker.remove(); });

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
