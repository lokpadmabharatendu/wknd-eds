// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * tabs-minimal-light
 * Tabbed testimonial switcher. Each authored row has:
 *   cell 1: plain-text label ("Name Role")
 *   cell 2: content -> image, <strong>name</strong>, role, quote
 * We rebuild each row into a tabpanel (image column + body column) and
 * build a rich tab button (avatar + name + role) shown in a menu BELOW
 * the panels, matching the source design.
 */
export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-minimal-light-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Testimonials');

  const rows = [...block.children];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const contentCell = cells[1] || cells[0];
    const id = toClassName(labelCell.textContent);

    // Pull the pieces out of the content cell.
    const pics = contentCell.querySelectorAll('picture, img');
    const imageEl = pics.length ? (pics[0].closest('picture') || pics[0]) : null;
    const nameEl = contentCell.querySelector('strong');
    const paras = [...contentCell.querySelectorAll('p')];
    // role = first <p> that is plain text (no picture, no strong)
    const roleEl = paras.find((p) => !p.querySelector('picture, img, strong')
      && p.textContent.trim() && p.textContent.trim() !== (nameEl && nameEl.textContent.trim()));
    // quote = last plain-text <p> (longest)
    const textParas = paras.filter((p) => !p.querySelector('picture, img'));
    const quoteEl = textParas.length ? textParas[textParas.length - 1] : null;

    const name = nameEl ? nameEl.textContent.trim() : '';
    const role = roleEl ? roleEl.textContent.trim() : '';

    // Build tabpanel: image column + body column.
    const panel = row;
    panel.className = 'tabs-minimal-light-pane';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('aria-hidden', !!i);
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.setAttribute('role', 'tabpanel');
    panel.innerHTML = '';

    const imageCol = document.createElement('div');
    imageCol.className = 'tabs-minimal-light-pane-image';
    if (imageEl) imageCol.append(imageEl);

    const body = document.createElement('div');
    body.className = 'tabs-minimal-light-pane-body';
    const bodyName = document.createElement('p');
    bodyName.className = 'tabs-minimal-light-pane-name';
    bodyName.textContent = name;
    const bodyRole = document.createElement('p');
    bodyRole.className = 'tabs-minimal-light-pane-role';
    bodyRole.textContent = role;
    body.append(bodyName, bodyRole);
    if (quoteEl) {
      quoteEl.classList.add('tabs-minimal-light-pane-quote');
      body.append(quoteEl);
    }

    panel.append(imageCol, body);

    // Build the rich tab button (avatar + name + role).
    const button = document.createElement('button');
    button.className = 'tabs-minimal-light-tab';
    button.id = `tab-${id}`;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    if (imageEl) {
      const avatar = document.createElement('span');
      avatar.className = 'tabs-minimal-light-avatar';
      const avImg = imageEl.querySelector ? imageEl.querySelector('img') : imageEl;
      if (avImg) {
        const clone = avImg.cloneNode(true);
        clone.removeAttribute('width');
        clone.removeAttribute('height');
        avatar.append(clone);
      }
      button.append(avatar);
    }
    const info = document.createElement('span');
    info.className = 'tabs-minimal-light-tab-info';
    const infoName = document.createElement('span');
    infoName.className = 'tabs-minimal-light-tab-name';
    infoName.textContent = name;
    const infoRole = document.createElement('span');
    infoRole.className = 'tabs-minimal-light-tab-role';
    infoRole.textContent = role;
    info.append(infoName, infoRole);
    button.append(info);

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((p) => p.setAttribute('aria-hidden', true));
      tablist.querySelectorAll('button').forEach((btn) => btn.setAttribute('aria-selected', false));
      panel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    tablist.append(button);
  });

  block.append(tablist);
}
