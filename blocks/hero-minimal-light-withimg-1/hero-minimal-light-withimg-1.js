export default function decorate(block) {
  const rows = [...block.children];

  // Two-column hero: images row + text row (authored order: images first, text second).
  const imageRow = rows[0];
  const textRow = rows[1];

  if (imageRow) imageRow.classList.add('hero-images');
  if (textRow) {
    textRow.classList.add('hero-content');

    // Style the CTA links as brand buttons and group them side by side.
    const buttonParagraphs = [...textRow.querySelectorAll(':scope > div > p')]
      .filter((p) => p.querySelector(':scope > a') && p.textContent.trim() === p.querySelector('a').textContent.trim());

    if (buttonParagraphs.length) {
      const group = document.createElement('div');
      group.className = 'button-group';
      buttonParagraphs.forEach((p, i) => {
        const a = p.querySelector('a');
        a.classList.add('button', i === 0 ? 'primary' : 'secondary');
        group.append(a);
        p.remove();
      });
      textRow.querySelector(':scope > div').append(group);
    }
  }

  // No-image fallback (defensive: authors may omit the image cell).
  if (!block.querySelector('picture')) {
    block.classList.add('no-image');
  }
}
