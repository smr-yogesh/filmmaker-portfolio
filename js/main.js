import { initPortfolio } from './portfolio.js';
const $ = (s) => document.querySelector(s);

async function init() {
  let site = {};
  try { const r = await fetch('data/site.json'); if (r.ok) site = await r.json(); } catch (e) { console.warn('site.json missing', e); }
  document.querySelectorAll('[data-site]').forEach((el) => { const v = site[el.dataset.site]; if (v) el.textContent = v; });
  if (site.name) document.title = `${site.name} – ${site.role || 'Film director and cinematographer'}`;
  const mail = $('#mail');
  if (site.email) { mail.textContent = site.email; mail.href = 'mailto:' + site.email; } else mail.remove();
  [['Instagram', site.instagram], ['Vimeo', site.vimeo]].forEach(([label, url]) => {
    if (!url) return;
    const li = document.createElement('li'), a = document.createElement('a');
    a.href = url; a.textContent = label; a.rel = 'noopener'; li.append(a); $('#links').append(li);
  });
  if (site.location) { const li = document.createElement('li'); li.textContent = site.location; $('#links').append(li); }
  $('#year').textContent = new Date().getFullYear();
  initPortfolio({ dataUrl: 'data/portfolio.json' });
}
init();
