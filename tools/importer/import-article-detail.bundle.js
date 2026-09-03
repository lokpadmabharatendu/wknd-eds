/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-article-detail.js
  var import_article_detail_exports = {};
  __export(import_article_detail_exports, {
    default: () => import_article_detail_default
  });

  // tools/importer/parsers/columns-feature.js
  function parse(element, { document }) {
    const grid = element.querySelector(".grid-layout") || element;
    let columns = Array.from(grid.querySelectorAll(":scope > div"));
    if (!columns.length) {
      columns = Array.from(element.children).filter((c) => c.tagName === "DIV");
    }
    if (!columns.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push(columns);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trendsetters-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        ".navbar",
        "footer.footer"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".breadcrumbs"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name.startsWith("data-astro-cid")) el.removeAttribute(attr.name);
        });
      });
    }
  }

  // tools/importer/import-article-detail.js
  var parsers = {
    "columns-feature": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "article-detail",
    description: "Article detail layout: two-column hero/intro followed by a default-content body column",
    urls: [
      "https://wknd-trendsetters.site/blog/ace-pro-court-polo"
    ],
    blocks: [
      { name: "columns-feature", instances: ["#main-content > section.section:nth-of-type(1) > div.container"] }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
      const isSectionMarker = blockDef.name.startsWith("section-");
      let matched = null;
      for (const selector of blockDef.instances) {
        const el = document.querySelector(selector);
        if (el) {
          matched = el;
          break;
        }
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
  function captureSourceSections(document, mainContent, sectionMarkers) {
    const styleByEl = /* @__PURE__ */ new Map();
    sectionMarkers.forEach((m) => {
      const owning = m.element.parentElement === mainContent ? m.element : findOwningSection(m.element, mainContent);
      if (owning) styleByEl.set(owning, m.style);
    });
    return [...mainContent.children].map((el) => ({ el, style: styleByEl.get(el) }));
  }
  function createSectionMetadata(document, style) {
    const table = document.createElement("table");
    const headRow = document.createElement("tr");
    const headCell = document.createElement("th");
    headCell.textContent = "Section Metadata";
    headRow.append(headCell);
    table.append(headRow);
    const row = document.createElement("tr");
    const keyCell = document.createElement("td");
    keyCell.textContent = "Style";
    const valCell = document.createElement("td");
    valCell.textContent = style;
    row.append(keyCell, valCell);
    table.append(row);
    return table;
  }
  var import_article_detail_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const mainContent = document.querySelector("#main-content") || main;
      const { pageBlocks, sectionMarkers } = findBlocksOnPage(document, PAGE_TEMPLATE);
      const sourceSections = captureSourceSections(document, mainContent, sectionMarkers);
      sourceSections.forEach((s) => {
        const marker = document.createComment("section-end");
        s.el.appendChild(marker);
        s.marker = marker;
      });
      executeTransformers("beforeTransform", main, payload);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) {
          console.warn(`No parser for block: ${block.name}`);
          return;
        }
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name}:`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const liveSections = sourceSections.filter((s) => s.marker && s.marker.parentNode);
      liveSections.forEach((s, i) => {
        const isLast = i === liveSections.length - 1;
        const anchor = s.marker;
        if (s.style) anchor.parentNode.insertBefore(createSectionMetadata(document, s.style), anchor);
        if (!isLast) anchor.parentNode.insertBefore(document.createElement("hr"), anchor);
      });
      sourceSections.forEach((s) => {
        if (s.marker && s.marker.parentNode) s.marker.remove();
      });
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_article_detail_exports);
})();
