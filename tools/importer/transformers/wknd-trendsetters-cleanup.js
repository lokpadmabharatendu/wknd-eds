/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters.site site-wide cleanup.
 *
 * All selectors verified against migration-work/cleaned.html for the
 * landing-page template. Removes non-authorable site chrome (skip link,
 * navbar/mega-menu, footer) and in-content navigation (breadcrumbs), then
 * strips Astro framework attributes.
 *
 * NOTE: The authorable hero is `<header class="section secondary-section">`
 * *inside* #main-content (the section-hero block). We must NOT remove `header`
 * broadly — only the specific `.navbar` chrome and `footer.footer`.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable global chrome. Found in cleaned.html:
    //   <a href="#main-content" class="skip-link">Skip to main content</a>
    //   <div class="navbar"> ... mega-menu / nav ... </div>
    //   <footer class="footer inverse-footer"> ... </footer>
    // Removed before block parsing so their inner links/imgs never get
    // extracted into blocks.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      '.navbar',
      'footer.footer',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // In-content non-authorable navigation. Found in cleaned.html inside the
    // article-intro section:
    //   <div class="breadcrumbs"> <a>Home</a> ... <a>Case studies</a> </div>
    WebImporter.DOMUtils.remove(element, [
      '.breadcrumbs',
    ]);

    // Strip Astro framework attributes (e.g. data-astro-cid-37fxchfa,
    // data-astro-cid-rbygaycu) present throughout cleaned.html.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-astro-cid')) el.removeAttribute(attr.name);
      });
    });
  }
}
