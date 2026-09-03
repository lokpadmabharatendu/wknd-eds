// Header / navigation block.
// Content-first: all labels, links, and images come from content/nav.plain.html.
// This module fetches that fragment, reads its DOM, and builds the header bar,
// the Trends megamenu, and the Support dropdown. It never hardcodes nav copy.

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Close all open panels (megamenu + dropdowns).
 * @param {Element} nav the nav element
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-item[aria-expanded="true"]').forEach((item) => {
    item.setAttribute('aria-expanded', 'false');
  });
  nav.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((t) => {
    t.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Build a single top-level nav item (plain link, dropdown, or megamenu)
 * from a source <li> in the nav content.
 * @param {Element} li source list item
 * @returns {Element} the decorated nav item
 */
function buildNavItem(li) {
  const item = document.createElement('li');
  item.className = 'nav-item';

  const directLink = li.querySelector(':scope > p > a, :scope > a');
  const directP = li.querySelector(':scope > p');
  const submenu = li.querySelector(':scope > ul');

  if (!submenu) {
    // Plain link (About, Blog).
    if (directLink) {
      const a = directLink.cloneNode(true);
      a.className = 'nav-link';
      item.append(a);
    }
    return item;
  }

  // Has a submenu → dropdown or megamenu.
  const label = (directP ? directP.textContent : '').trim();
  const trigger = document.createElement('button');
  trigger.className = 'nav-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  const caret = document.createElement('span');
  caret.className = 'nav-caret';
  caret.setAttribute('aria-hidden', 'true');
  trigger.append(labelSpan, caret);
  item.append(trigger);

  // Megamenu vs simple dropdown: megamenu columns have their own nested <ul>.
  const columns = [...submenu.children].filter((c) => c.tagName === 'LI' && c.querySelector(':scope > ul'));
  const isMegamenu = columns.length > 0;

  const panel = document.createElement('div');
  panel.className = isMegamenu ? 'nav-panel nav-megamenu' : 'nav-panel nav-dropdown';

  if (isMegamenu) {
    [...submenu.children].forEach((colLi) => {
      if (colLi.tagName !== 'LI') return;
      const colList = colLi.querySelector(':scope > ul');
      if (colList) {
        const col = document.createElement('div');
        col.className = 'nav-col';
        const heading = (colLi.querySelector(':scope > p') || {}).textContent;
        if (heading) {
          const h = document.createElement('h3');
          h.className = 'nav-col-heading';
          h.textContent = heading.trim();
          col.append(h);
        }
        colList.querySelectorAll(':scope > li > a').forEach((a) => {
          col.append(a.cloneNode(true));
        });
        panel.append(col);
      } else {
        // Promo card: the <li>'s link.
        const promoLink = colLi.querySelector('a');
        if (promoLink) {
          const card = promoLink.cloneNode(true);
          card.className = 'nav-promo';
          // Mark the promo title (first <strong>) as a heading for parity with the source.
          const promoTitle = card.querySelector('strong');
          if (promoTitle) promoTitle.classList.add('nav-promo-heading');
          panel.append(card);
        }
      }
    });
  } else {
    submenu.querySelectorAll(':scope > li > a').forEach((a) => {
      panel.append(a.cloneNode(true));
    });
  }

  item.append(panel);
  return item;
}

/**
 * Wire hover + click + keyboard behavior for trigger-based nav items.
 * @param {Element} nav the nav element
 */
function wireInteractions(nav) {
  nav.querySelectorAll('.nav-item').forEach((item) => {
    const trigger = item.querySelector(':scope > .nav-trigger');
    if (!trigger) return;

    const open = () => {
      if (isDesktop.matches) closeAllPanels(nav);
      trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => trigger.setAttribute('aria-expanded', 'false');
    const toggle = () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      closeAllPanels(nav);
      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    };

    // Desktop: hover opens/closes (matches source). Mobile: click toggles.
    item.addEventListener('mouseenter', () => { if (isDesktop.matches) open(); });
    item.addEventListener('mouseleave', () => { if (isDesktop.matches) close(); });
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (isDesktop.matches) {
        // On desktop, hover governs the panel; a click just ensures it is open.
        open();
      } else {
        toggle();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllPanels(nav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllPanels(nav);
  });
}

/**
 * Reset nav state when crossing the desktop/mobile breakpoint.
 * @param {Element} nav the nav element
 */
function handleViewportChange(nav) {
  closeAllPanels(nav);
  const hamburger = nav.querySelector('.nav-hamburger');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  nav.classList.remove('nav-open');
}

/**
 * Loads and decorates the header.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Content-first dual fetch (metadata-independent): /content first, then root.
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return;
  const html = await resp.text();

  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const sections = [...tmp.children].filter((c) => c.tagName === 'DIV');
  const [brandSection, navSection, ctaSection] = sections;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // Brand / logo.
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    const brandLink = brandSection.querySelector('a');
    if (brandLink) brand.append(brandLink.cloneNode(true));
  }

  // Primary nav items (semantic list).
  const sectionsWrap = document.createElement('ul');
  sectionsWrap.className = 'nav-sections';
  if (navSection) {
    navSection.querySelectorAll(':scope > ul > li').forEach((li) => {
      sectionsWrap.append(buildNavItem(li));
    });
  }

  // CTA.
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  if (ctaSection) {
    const ctaLink = ctaSection.querySelector('a');
    if (ctaLink) {
      const cta = ctaLink.cloneNode(true);
      cta.className = 'nav-cta';
      tools.append(cta);
    }
  }

  // Hamburger (mobile toggle) — built in JS per contract.
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  nav.append(brand, hamburger, sectionsWrap, tools);

  wireInteractions(nav);
  isDesktop.addEventListener('change', () => handleViewportChange(nav));

  block.textContent = '';
  block.append(nav);
}
