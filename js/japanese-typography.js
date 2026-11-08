(() => {
  if (!Intl.Segmenter) return;
  const japanese = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
  const punctuation = /^[\s\p{Punctuation}]+$/u;
  const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
  let timer;
  const observer = new MutationObserver(schedule);
  const observe = () => observer.observe(document.body, { childList: true, characterData: true, subtree: true });

  function keepJapaneseEndingsTogether() {
    observer.disconnect();
    document.querySelectorAll('.jp-keep-tail').forEach(span => {
      const parent = span.parentNode;
      span.replaceWith(...span.childNodes);
      parent.normalize();
    });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, noscript, textarea, input, select, [contenteditable]')) return;
      const text = node.textContent;
      if (!japanese.test(text) || !parent.getClientRects().length) return;
      const parts = [...segmenter.segment(text.trimEnd())];
      if (parts.length < 4) return;
      const range = document.createRange();
      const tail = [];
      let lastTop;
      // Measure the actual final line rather than guessing from text length.
      for (let i = parts.length - 1; i >= Math.max(0, parts.length - 8); i--) {
        const part = parts[i];
        range.setStart(node, part.index);
        range.setEnd(node, part.index + part.segment.length);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        if (lastTop === undefined) lastTop = rect.top;
        if (Math.abs(rect.top - lastTop) > 3) break;
        tail.unshift(part);
      }
      const letters = tail.filter(part => !punctuation.test(part.segment));
      if (letters.length !== 1 || !japanese.test(letters[0].segment)) return;
      const start = parts[Math.max(0, parts.length - tail.length - 2)].index;
      const ending = node.splitText(start);
      const span = document.createElement('span');
      span.className = 'jp-keep-tail';
      ending.replaceWith(span);
      span.appendChild(ending);
    });
    observe();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(keepJapaneseEndingsTogether, 100);
  }
  if (document.fonts) document.fonts.ready.then(schedule);
  window.addEventListener('load', schedule);
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('toggle', schedule, true);
  observe();
})();
