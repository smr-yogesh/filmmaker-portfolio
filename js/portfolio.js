// Renders data/portfolio.json. Paths resolve relative to the page, so subpath hosting works.
const $ = (s) => document.querySelector(s);
const grid = $('#grid'), state = $('#state'), filtersEl = $('#filters'), dlg = $('#viewer');
let all = [], shown = [], current = 0, lastFocus = null;

const ratio = (p) => (p.width && p.height ? p.width / p.height : 16 / 9);
const title = (p) => p.title || (p.caption ? p.caption.split('\n')[0].slice(0, 60) : 'Untitled');
const meta = (p) => [p.category, p.year].filter(Boolean).join(', ');
const isVideo = (p) => p.media_type === 'VIDEO';

export async function initPortfolio({ dataUrl }) {
  try {
    const r = await fetch(dataUrl);
    if (!r.ok) throw new Error(r.status);
    all = ((await r.json()).projects || []).filter((p) => p && p.id && p.thumbnail);
  } catch (e) {
    state.textContent = 'The portfolio could not be loaded. Check that data/portfolio.json exists and is valid JSON.';
    return;
  }
  if (!all.length) { state.textContent = 'No projects yet.'; return; }
  const cats = [...new Set(all.map((p) => p.category).filter(Boolean))];
  if (cats.length > 1) ['All', ...cats].forEach((c, i) => {
    const b = document.createElement('button');
    b.textContent = c; b.setAttribute('aria-pressed', i === 0);
    b.onclick = () => { filtersEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(c); };
    filtersEl.append(b);
  });
  render('All');
}

function render(cat) {
  shown = cat === 'All' ? all : all.filter((p) => p.category === cat);
  grid.innerHTML = ''; state.textContent = shown.length ? '' : 'No projects in this category.';
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  let wides = 0;
  shown.forEach((p, i) => {
    const r = ratio(p), port = r < 1, wide = !port && (p.featured || r > 2);
    const li = document.createElement('li');
    li.className = 'card' + (port ? ' port' : '') + (wide ? ' wide' + (wides++ % 2 ? ' alt' : '') : '');
    const b = document.createElement('button'); b.type = 'button';
    b.setAttribute('aria-label', `${title(p)}${meta(p) ? ', ' + meta(p) : ''}. Open details`);
    const f = document.createElement('div'); f.className = 'frame'; f.style.aspectRatio = r;
    const img = new Image(); img.src = p.thumbnail; img.alt = ''; img.loading = i < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
    img.onerror = () => { img.remove(); f.classList.add('broken'); };
    f.append(img);
    if (isVideo(p)) { const pl = document.createElement('span'); pl.className = 'play'; pl.setAttribute('aria-hidden', 'true'); f.append(pl); }
    const cap = document.createElement('div'); cap.className = 'cap';
    cap.innerHTML = '<span class="t"></span><span class="m"></span>';
    cap.firstChild.textContent = title(p); cap.lastChild.textContent = meta(p);
    b.append(f, cap); li.append(b); grid.append(li);
    b.onclick = () => { lastFocus = b; current = i; fill(); if (!dlg.open) dlg.showModal(); };
    io.observe(li);
  });
}

function fill() {
  const p = shown[current], media = dlg.querySelector('.v-media'); media.innerHTML = '';
  if (isVideo(p) && p.media_url) {
    const v = document.createElement('video'); v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.poster = p.thumbnail; v.src = p.media_url; media.append(v);
  } else {
    const im = new Image(); im.src = p.thumbnail; im.alt = p.alt || title(p); media.append(im);
  }
  dlg.querySelector('#v-title').textContent = title(p);
  dlg.querySelector('.v-meta').textContent = [meta(p), p.credit].filter(Boolean).join(', ');
  const t = dlg.querySelector('.v-text'); t.textContent = p.description || p.caption || ''; t.hidden = !t.textContent;
  const a = dlg.querySelector('.v-link'); a.hidden = !p.permalink; if (p.permalink) a.href = p.permalink;
  dlg.querySelector('.v-prev').hidden = dlg.querySelector('.v-next').hidden = shown.length < 2;
}
const step = (d) => { dlg.querySelector('video')?.pause(); current = (current + d + shown.length) % shown.length; fill(); };
dlg.querySelector('.v-prev').onclick = () => step(-1);
dlg.querySelector('.v-next').onclick = () => step(1);
dlg.querySelector('.v-close').onclick = () => dlg.close();
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
dlg.addEventListener('close', () => { dlg.querySelector('video')?.pause(); lastFocus?.focus(); });
