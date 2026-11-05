/* FAN'HASINA — app.js
   Mpandeha ny pejy rehetra (Accueil, À propos, Mes poèmes, Galerie, Contact).
   Ny votoatiny rehetra dia avy ao amin'ny data.js. */
(function () {
  'use strict';

  const D = window.FANHASINA || {};
  const POEMS = Array.isArray(D.poemes) ? D.poemes : [];
  const GALLERY = Array.isArray(D.galerie) ? D.galerie : [];
  const ABOUT = Array.isArray(D.apropos) ? D.apropos : [];
  const FB = D.facebook || '#';
  const EMAIL = D.email || '';
  const CATS = ['Fiainana', 'Fitiavana', 'Fiaraha-monina', 'Fanantenana', 'Fisaintsainana'];
  const TAGLINE = D.tagline || "Teny avy am-po, hafatra ho an'ny fiainana.";
  const SITE = "Fan'Hasina";

  const $app = document.getElementById('app');
  const state = { cat: 'Rehetra', q: '' };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const lines = (t) => String(t).split('\n').map((l) => l.trim()).filter(Boolean);
  const poemUrl = (p) => location.href.split('#')[0] + '#/poeme/' + enc(p.id);

  const ORN = '<div class="orn" aria-hidden="true"><span></span><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2c2 4 6 6 10 10-4 4-8 6-10 10-2-4-6-6-10-10 4-4 8-6 10-10z" fill="currentColor"/></svg><span></span></div>';

  /* ---------- Outils ---------- */
  let toastTimer;
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      ta.remove();
    });
  }

  /* ---------- Cartes ---------- */
  const excerpt = (p) => {
    const l = lines(p.texte);
    return l.slice(0, 2).map(esc).join('<br>') + (l.length > 2 ? '…' : '');
  };
  const card = (p) => `
    <a class="card" href="#/poeme/${enc(p.id)}">
      <span class="chip">${esc(p.categorie)}</span>
      <h3>${esc(p.titre)}</h3>
      <p class="excerpt">${excerpt(p)}</p>
      <span class="read">Vakio <span aria-hidden="true">→</span></span>
    </a>`;

  /* ---------- Pejy ---------- */
  function home() {
    const latest = POEMS.slice(0, 3);
    const used = new Set(POEMS.map((p) => p.categorie)).size;
    return {
      title: SITE + ' — Poeta malagasy',
      html: `
      <section class="hero"><div class="wrap">
        <p class="eyebrow">Poeta malagasy</p>
        <h1 class="title">FAN'HASINA</h1>
        ${ORN}
        <p class="tagline">${esc(TAGLINE)}</p>
        <div class="actions">
          <a class="btn" href="#/poemes">Vakio ny tononkalo</a>
          <a class="btn ghost" href="#/apropos">Fantaro ny mpanoratra</a>
        </div>
      </div></section>
      <section class="wrap section">
        <div class="sec-head">
          <h2 class="h2">Tononkalo vao haingana</h2>
          <a class="more" href="#/poemes">Hitany rehetra →</a>
        </div>
        ${latest.length ? `<div class="grid">${latest.map(card).join('')}</div>` : '<p class="muted">Mbola tsy misy tononkalo.</p>'}
      </section>
      <section class="band"><div class="wrap stats">
        <div><b>${POEMS.length}</b><span>Tononkalo</span></div>
        <div><b>${used}</b><span>Sokajy</span></div>
        <div><b>MG</b><span>Madagasikara</span></div>
      </div></section>`
    };
  }

  function about() {
    return {
      title: 'À propos — ' + SITE,
      html: `
      <section class="wrap page">
        <p class="eyebrow center">À propos</p>
        <h1 class="h1">Mombamomba ny mpanoratra</h1>
        ${ORN}
        <div class="about">
          <div class="mono" aria-hidden="true">F</div>
          <div>
            <p class="who">RANDRIANJAKATIANA Rolland</p>
            <p class="alias">Anarana fampiasa amin'ny asa soratra: <strong>Fan'Hasina</strong></p>
            <div class="facts"><span>Poeta sy mpanoratra tononkalo</span><span>Madagasikara</span><span>Fiteny: Malagasy</span></div>
          </div>
        </div>
        <div class="prose">${ABOUT.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="actions"><a class="btn" href="#/poemes">Vakio ny tononkalo</a><a class="btn ghost" href="#/contact">Mifandraisa</a></div>
      </section>`
    };
  }

  function filtered() {
    const q = norm(state.q.trim());
    return POEMS.filter((p) =>
      (state.cat === 'Rehetra' || p.categorie === state.cat) &&
      (!q || norm(p.titre + ' ' + p.texte).includes(q)));
  }
  const gridHtml = () => {
    const f = filtered();
    return f.length ? f.map(card).join('') : '<p class="muted empty">Tsy misy tononkalo mifanaraka amin\'izay notadiavina.</p>';
  };

  function poems() {
    const chips = ['Rehetra'].concat(CATS).map((c) =>
      `<button type="button" class="fchip${state.cat === c ? ' on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    return {
      title: 'Mes poèmes — ' + SITE,
      html: `
      <section class="wrap page">
        <p class="eyebrow center">Mes poèmes</p>
        <h1 class="h1">Ireo tononkalo</h1>
        ${ORN}
        <div class="filters" role="group" aria-label="Sokajy">${chips}</div>
        <div class="searchrow"><input type="search" id="search" placeholder="Tadiavo ny tononkalo…" value="${esc(state.q)}" aria-label="Tadiavo"></div>
        <p class="count" id="count">${filtered().length} tononkalo</p>
        <div class="grid" id="grid">${gridHtml()}</div>
      </section>`
    };
  }

  function poem(id) {
    const i = POEMS.findIndex((p) => p.id === id);
    if (i < 0) return notFound();
    const p = POEMS[i];
    const url = poemUrl(p);
    const stanzas = String(p.texte).split(/\n\s*\n/).map((s) => `<p class="stanza">${esc(s)}</p>`).join('');
    const prev = POEMS[i - 1];
    const next = POEMS[i + 1];
    return {
      title: p.titre + ' — ' + SITE,
      html: `
      <section class="wrap page">
        <article class="poem">
          <a class="back" href="#/poemes">← Ny tononkalo rehetra</a>
          <div class="paper">
            <span class="chip">${esc(p.categorie)}</span>
            <h1>${esc(p.titre)}</h1>
            ${ORN}
            ${stanzas}
            <p class="sig">${esc(p.signature || SITE)}</p>
          </div>
          <div class="share">
            <a class="btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}">Zarao amin'ny Facebook</a>
            <button type="button" class="btn ghost" data-share="${esc(p.id)}">Zarao</button>
            <button type="button" class="btn ghost" data-copy="${esc(p.id)}">Dikao ny rohy</button>
          </div>
          <nav class="pager" aria-label="Tononkalo hafa">
            ${prev ? `<a href="#/poeme/${enc(prev.id)}">← ${esc(prev.titre)}</a>` : '<span></span>'}
            ${next ? `<a href="#/poeme/${enc(next.id)}">${esc(next.titre)} →</a>` : '<span></span>'}
          </nav>
        </article>
      </section>`
    };
  }

  function gallery() {
    const body = GALLERY.length
      ? GALLERY.map((g, i) => `
        <figure class="gal-item">
          <button type="button" data-lightbox="${i}" aria-label="Hanitatra ny sary"><img loading="lazy" src="${esc(g.src)}" alt="${esc(g.legende || '')}"></button>
          ${g.legende ? `<figcaption>${esc(g.legende)}</figcaption>` : ''}
        </figure>`).join('')
      : [1, 2, 3, 4, 5, 6].map(() => '<div class="ph" aria-hidden="true">Sary</div>').join('') ;
    return {
      title: 'Galerie — ' + SITE,
      html: `
      <section class="wrap page">
        <p class="eyebrow center">Galerie</p>
        <h1 class="h1">Sary</h1>
        ${ORN}
        <div class="gal-grid">${body}</div>
        ${GALLERY.length ? '' : '<p class="muted center" style="margin-top:1.5rem">Ho avy tsy ho ela ny sary momba ny mpanoratra sy ny asa soratra.</p>'}
      </section>`
    };
  }

  function contact() {
    return {
      title: 'Contact — ' + SITE,
      html: `
      <section class="wrap page">
        <p class="eyebrow center">Contact</p>
        <h1 class="h1">Mifandraisa amiko</h1>
        ${ORN}
        <p class="lead">Faly mandray ny hevitrao, ny hafatrao ary ny fanamarihanao momba ny tononkalo.</p>
        <div class="contact">
          <div class="panel-c">
            <h2>Facebook</h2>
            <p>Araho ny pejy ary mandefasa hafatra mivantana ao amin'ny Facebook.</p>
            <a class="btn" target="_blank" rel="noopener" href="${esc(FB)}">Hankany amin'ny Facebook</a>
            ${EMAIL ? `<p style="margin-top:1rem">Na mailaka: <a href="mailto:${esc(EMAIL)}">${esc(EMAIL)}</a></p>` : ''}
          </div>
          <div class="panel-c">
            <h2>Soraty ny hafatrao</h2>
            <div class="field"><label for="c-name">Anaranao</label><input type="text" id="c-name" autocomplete="name"></div>
            <div class="field"><label for="c-msg">Hafatra</label><textarea id="c-msg"></textarea></div>
            <button type="button" class="btn" data-send="fb">Alefaso amin'ny Facebook</button>
            ${EMAIL ? '<button type="button" class="btn ghost" data-send="mail" style="margin-top:.6rem">Alefaso amin\'ny mailaka</button>' : ''}
          </div>
        </div>
      </section>`
    };
  }

  function notFound() {
    return {
      title: 'Tsy hita — ' + SITE,
      html: '<section class="wrap page center"><h1 class="h1">Tsy hita ny pejy</h1><p class="lead">Mety efa nafafa na nafindra ity pejy ity.</p><div class="actions"><a class="btn" href="#/">Hiverina any am-piandohana</a></div></section>'
    };
  }

  /* ---------- Routeur ---------- */
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const name = parts[0] || '';
    const arg = parts[1] ? decodeURIComponent(parts[1]) : '';
    let page;
    switch (name) {
      case '': page = home(); break;
      case 'apropos': page = about(); break;
      case 'poemes': page = poems(); break;
      case 'poeme': page = poem(arg); break;
      case 'galerie': page = gallery(); break;
      case 'contact': page = contact(); break;
      default: page = notFound();
    }
    $app.innerHTML = page.html;
    document.title = page.title;
    const active = name === 'poeme' ? 'poemes' : name;
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === active));
    const nav = document.getElementById('nav');
    nav.classList.remove('open');
    document.getElementById('burger').setAttribute('aria-expanded', 'false');
    window.scrollTo(0, 0);
  }

  /* ---------- Fitaovana ---------- */
  function openLightbox(i) {
    const g = GALLERY[i];
    if (!g) return;
    const o = document.createElement('div');
    o.className = 'lb';
    o.innerHTML = `<button type="button" class="lb-x" aria-label="Akatony">×</button><figure><img src="${esc(g.src)}" alt="${esc(g.legende || '')}">${g.legende ? `<figcaption>${esc(g.legende)}</figcaption>` : ''}</figure>`;
    o.addEventListener('click', () => o.remove());
    document.body.appendChild(o);
  }

  function refreshList() {
    document.querySelectorAll('[data-cat]').forEach((b) => b.classList.toggle('on', b.dataset.cat === state.cat));
    const grid = document.getElementById('grid');
    if (grid) grid.innerHTML = gridHtml();
    const c = document.getElementById('count');
    if (c) c.textContent = filtered().length + ' tononkalo';
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-cat],[data-share],[data-copy],[data-lightbox],[data-send],#burger');
    if (!el) return;

    if (el.id === 'burger') {
      const open = document.getElementById('nav').classList.toggle('open');
      el.setAttribute('aria-expanded', String(open));
    } else if (el.dataset.cat !== undefined) {
      state.cat = el.dataset.cat;
      refreshList();
    } else if (el.dataset.copy !== undefined) {
      const p = POEMS.find((x) => x.id === el.dataset.copy);
      if (p) copy(poemUrl(p)).then(() => toast('Voadika ny rohy.')).catch(() => toast('Tsy voadika ny rohy.'));
    } else if (el.dataset.share !== undefined) {
      const p = POEMS.find((x) => x.id === el.dataset.share);
      if (!p) return;
      if (navigator.share) {
        navigator.share({ title: p.titre + ' — ' + SITE, text: lines(p.texte).slice(0, 2).join('\n') + '…', url: poemUrl(p) }).catch(() => {});
      } else {
        copy(poemUrl(p)).then(() => toast('Voadika ny rohy.')).catch(() => {});
      }
    } else if (el.dataset.lightbox !== undefined) {
      openLightbox(Number(el.dataset.lightbox));
    } else if (el.dataset.send !== undefined) {
      const name = (document.getElementById('c-name') || {}).value || '';
      const msg = ((document.getElementById('c-msg') || {}).value || '').trim();
      if (!msg) { toast('Soraty aloha ny hafatra.'); return; }
      const full = (name ? 'Avy amin\'i ' + name + ':\n\n' : '') + msg;
      if (el.dataset.send === 'mail') {
        location.href = 'mailto:' + EMAIL + '?subject=' + enc("Hafatra ho an'i " + SITE) + '&body=' + enc(full);
      } else {
        window.open(FB, '_blank', 'noopener');
        copy(full).then(() => toast("Voadika ny hafatra. Apetaho ao amin'ny Messenger.")).catch(() => toast('Soraty ao amin\'ny Facebook ny hafatrao.'));
      }
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'search') {
      state.q = e.target.value;
      refreshList();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { const o = document.querySelector('.lb'); if (o) o.remove(); }
  });

  window.addEventListener('hashchange', route);
  document.getElementById('year').textContent = new Date().getFullYear();
  route();
})();
