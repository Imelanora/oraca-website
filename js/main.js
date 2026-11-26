/* ORACA Digital Solutions – Script
   1. Binär-Regen (nur im Startbereich)
   2. Einblenden beim Scrollen
   3. Terminal-Zeile
   4. Leistungen-Diashow inkl. Kassen-Demo
   5. Ablauf
   6. Kopfzeile & mobiles Menü
   7. Preise-Reiter
   8. Kontaktformular
   9. WhatsApp-Button
*/

// >>> Hier Ihre E-Mail-Adresse eintragen, an die Anfragen gehen sollen:
const CONTACT_EMAIL = 'info@oracadigital.de';

// >>> Schlüssel von web3forms.com – damit wird das Kontaktformular direkt verschickt.
//     Solange das Feld leer ist, öffnet sich wie bisher das E-Mail-Programm.
const FORM_ACCESS_KEY = 'a805c4c8-55c0-4cca-9e8d-64985e935a0e';

// >>> Hier Ihre WhatsApp-Nummer eintragen (mit Ländervorwahl, ohne + und Leerzeichen, z. B. '4917612345678').
//     Solange das Feld leer ist, wird kein WhatsApp-Button angezeigt.
const WHATSAPP_NUMBER = '491738506232';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand01 = () => (Math.random() > 0.5 ? '1' : '0');

/* ---------------- 1. Binär-Regen ---------------- */
(function () {
  const canvas = document.getElementById('rain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;
  let w, h, fs, colW, columns = [], last = 0, visible = true;

  // Dichter an den Rändern, zur Mitte hin fast unsichtbar – der Text bleibt ruhig lesbar
  const falloff = (x) => {
    const d = Math.abs(x / w - 0.5) * 2; // 0 = Mitte, 1 = Rand
    return Math.max(0.06, Math.min(1, (d - 0.25) / 0.6));
  };

  function newColumn(i, initial) {
    const len = 6 + Math.floor(Math.random() * 16);
    const x = i * colW + colW / 2;
    return {
      x, len,
      chars: Array.from({ length: len }, rand01),
      speed: 40 + Math.random() * 70,
      y: initial ? Math.random() * (h + len * fs) - len * fs * 0.5 : -Math.random() * h * 0.4,
      alpha: 0.25 + Math.random() * 0.45,
      fall: falloff(x),
      rgb: Math.random() < 0.35 ? '201, 190, 255' : '127, 188, 255',
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = host.clientWidth; h = host.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fs = w < 600 ? 12 : 14;
    colW = Math.round(fs * 2.2);
    columns = Array.from({ length: Math.ceil(w / colW) }, (_, i) => newColumn(i, true));
  }

  function draw(dt) {
    ctx.clearRect(0, 0, w, h);
    ctx.font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    columns.forEach((col, i) => {
      col.y += col.speed * dt;
      if (col.y - col.len * fs > h) { columns[i] = newColumn(i, false); return; }
      if (Math.random() < 0.05) { const k = Math.floor(Math.random() * col.len); col.chars[k] = col.chars[k] === '1' ? '0' : '1'; }
      const base = col.alpha * col.fall;
      for (let k = 0; k < col.len; k++) {
        const cy = col.y - k * fs;
        if (cy < -fs || cy > h) continue;
        const a = base * (1 - k / col.len);
        if (a <= 0.02) continue;
        ctx.fillStyle = k === 0 ? `rgba(240, 242, 255, ${Math.min(1, a + 0.25)})` : `rgba(${col.rgb}, ${a * 0.55})`;
        ctx.fillText(col.chars[k], col.x, cy);
      }
    });
  }

  function loop(t) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) { last = t; return; }
    if (t - last < 40) return; // ~25 Bilder pro Sekunde
    const dt = Math.min((t - (last || t)) / 1000, 0.1);
    last = t;
    draw(reduceMotion ? 0 : dt);
  }

  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(host);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  const start = () => { resize(); if (reduceMotion) draw(0); else requestAnimationFrame(loop); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
})();

/* ---------------- 2. Einblenden ---------------- */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
})();

/* ---------------- 3. Terminal-Zeile ---------------- */
(function () {
  const el = document.getElementById('typer-text');
  if (!el) return;
  const lines = ['webseite.erstellen()', 'kasse.preis_ändern("Cappuccino", 3.50)', 'design.logo_entwerfen()', 'kunde.zufrieden = true'];
  if (reduceMotion) { el.textContent = lines[0]; return; }
  let li = 0, ci = 0, deleting = false;
  function tick() {
    const line = lines[li];
    if (!deleting) {
      el.textContent = line.slice(0, ++ci);
      if (ci === line.length) { deleting = true; return setTimeout(tick, 1900); }
      return setTimeout(tick, 55 + Math.random() * 40);
    }
    el.textContent = line.slice(0, --ci);
    if (ci === 0) { deleting = false; li = (li + 1) % lines.length; return setTimeout(tick, 400); }
    setTimeout(tick, 22);
  }
  setTimeout(tick, 1200);
})();

/* ---------------- 4. Leistungen-Diashow ---------------- */
(function () {
  const tabs = [...document.querySelectorAll('.service-tab')];
  if (!tabs.length) return;
  const demos = [...document.querySelectorAll('.stage .demo')];
  const INTERVAL = 7000;
  let current = 0, autoplay = !reduceMotion, timer = null;

  // Kassen-Demo: Preise werden nacheinander geändert
  const posRows = [...document.querySelectorAll('.pos-list li')];
  const posMsg = document.querySelector('.pos-msg');
  let posTimer = null, posIndex = 0;
  function posStep() {
    const row = posRows[posIndex % posRows.length];
    posIndex++;
    const priceEl = row.querySelector('b');
    const list = row.dataset.prices.split('|');
    const now = priceEl.textContent.replace(' €', '');
    const next = list[(list.indexOf(now) + 1) % list.length];
    posRows.forEach((r) => r.classList.remove('edit', 'done'));
    row.classList.add('edit');
    posMsg.classList.remove('ok');
    posMsg.textContent = `PLU ${String(posIndex).padStart(3, '0')} · Preis wird geändert …`;
    setTimeout(() => {
      priceEl.textContent = next + ' €';
      row.classList.add('done');
      posMsg.classList.add('ok');
      posMsg.textContent = `✓ ${row.querySelector('span').textContent}: ${now} € → ${next} €`;
    }, 800);
  }
  const posStart = () => { if (!posTimer) { posStep(); posTimer = setInterval(posStep, 2400); } };
  const posStop = () => { clearInterval(posTimer); posTimer = null; };

  function runBar() {
    tabs.forEach((t) => { const s = t.querySelector('.tab-bar span'); s.style.transition = 'none'; s.style.width = '0'; });
    const bar = tabs[current].querySelector('.tab-bar span');
    void bar.offsetWidth;
    if (autoplay) { bar.style.transition = `width ${INTERVAL}ms linear`; bar.style.width = '100%'; }
    else bar.style.width = '100%';
  }

  function activate(i, fromUser) {
    current = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    const key = tabs[i].dataset.demo;
    demos.forEach((d) => d.classList.toggle('active', d.dataset.demo === key));
    if (key === 'pos') posStart(); else posStop();
    if (fromUser) { autoplay = false; clearInterval(timer); }
    runBar();
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(i, true));
    t.addEventListener('keydown', (e) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activate(n, true); tabs[n].focus();
    });
  });

  new IntersectionObserver((entries) => {
    clearInterval(timer);
    if (entries[0].isIntersecting && autoplay) {
      runBar();
      timer = setInterval(() => activate((current + 1) % tabs.length, false), INTERVAL);
    }
  }, { threshold: 0.35 }).observe(document.querySelector('.showcase'));

  activate(0, false);
})();

/* ---------------- 5. Ablauf ---------------- */
(function () {
  const tl = document.querySelector('.timeline');
  if (!tl) return;
  const fill = tl.querySelector('.timeline-line span');
  const steps = [...tl.querySelectorAll('.steps li')];
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    if (innerWidth <= 760) fill.style.height = '100%'; else fill.style.width = '100%';
    steps.forEach((s, i) => setTimeout(() => s.classList.add('on'), reduceMotion ? 0 : 200 + i * 550));
  }, { threshold: 0.3 }).observe(tl);
})();

/* ---------------- 6. Kopfzeile & mobiles Menü ---------------- */
(function () {
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 30);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();

/* ---------------- 7. Preise-Reiter ---------------- */
(function () {
  const tabs = [...document.querySelectorAll('.price-tab')];
  if (!tabs.length) return;
  const select = (i) => tabs.forEach((t, k) => {
    const on = k === i;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(n); tabs[n].focus();
    });
  });
  const map = { webseiten: 0, kasse: 1, design: 2 };
  const h = location.hash.slice(1);
  if (h in map) select(map[h]);
})();

/* ---------------- 8. Kontaktformular ---------------- */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const sel = form.querySelector('select[name="interesse"]');
  const thema = new URLSearchParams(location.search).get('thema');
  if (thema && [...sel.options].some((o) => o.text === thema)) sel.value = thema;
  const anfrage = new URLSearchParams(location.search).get('anfrage');
  const msg = form.querySelector('textarea[name="nachricht"]');
  if (anfrage && msg && !msg.value) msg.value = anfrage.slice(0, 2000);

  const status = form.querySelector('.form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.classList.remove('error');
    if (!form.checkValidity()) {
      status.classList.add('error');
      status.textContent = 'Bitte Name, E-Mail und Nachricht ausfüllen und den Datenschutz bestätigen.';
      const first = form.querySelector(':invalid');
      if (first) first.focus();
      return;
    }
    const d = new FormData(form);
    const subject = `Anfrage: ${d.get('interesse')} – ${d.get('name')}`;
    const body = `Name: ${d.get('name')}\nE-Mail: ${d.get('email')}\nThema: ${d.get('interesse')}\n\n${d.get('nachricht')}`;

    // Solange noch kein Formular-Schlüssel eingetragen ist: wie bisher über das E-Mail-Programm
    if (!FORM_ACCESS_KEY) {
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Ihr E-Mail-Programm öffnet sich – bitte dort absenden. Danke!';
      return;
    }

    // Direkt versenden – ohne E-Mail-Programm
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = 'Wird gesendet …';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: FORM_ACCESS_KEY,
        subject,
        from_name: 'ORACA Webseite',
        name: d.get('name'),
        email: d.get('email'),
        replyto: d.get('email'),
        thema: d.get('interesse'),
        nachricht: d.get('nachricht'),
        botcheck: d.get('botcheck') || '',
      }),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok && j.success })))
      .then(({ ok }) => {
        if (!ok) throw new Error('send failed');
        form.reset();
        status.textContent = '✓ Vielen Dank! Ihre Anfrage ist angekommen – ich melde mich schnellstmöglich bei Ihnen.';
      })
      .catch(() => {
        status.classList.add('error');
        status.textContent = `Das hat leider nicht geklappt. Bitte schreiben Sie mir direkt an ${CONTACT_EMAIL} oder per WhatsApp.`;
      })
      .finally(() => { btn.disabled = false; });
  });
})();

/* ---------------- 9. WhatsApp-Button ---------------- */
(function () {
  const nr = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (!nr) return;
  const a = document.createElement('a');
  a.className = 'wa-btn';
  a.href = `https://wa.me/${nr}?text=${encodeURIComponent('Hallo Melanie, ich interessiere mich für ')}`;
  a.target = '_blank'; a.rel = 'noopener';
  a.setAttribute('aria-label', 'Per WhatsApp schreiben');
  a.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 6.9L3.6 29l6.5-1.7c1.9 1 4 1.6 6 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.5c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.8 1 1-3.7-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.8C5.4 10 10.2 5.3 16 5.3S26.6 10 26.6 15.9 21.8 26.5 16 26.5zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.3 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg><span>WhatsApp</span>';
  document.body.appendChild(a);
})();

document.querySelectorAll('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------------- 10. Preisrechner Webseiten ---------------- */
(function () {
  const form = document.getElementById('calc');
  if (!form) return;
  const out = document.getElementById('calc-total');
  const barOut = document.getElementById('calc-bar-total');
  const list = document.getElementById('calc-list');
  const monthly = document.getElementById('calc-monthly');
  const send = document.getElementById('calc-send');
  const fmt = (n) => n.toLocaleString('de-DE');
  let shown = +out.textContent.replace(/\D/g, '') || 0, raf;

  function animate(to) {
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now(), dur = reduceMotion ? 1 : 550;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      shown = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      out.textContent = fmt(shown);
      if (p < 1) raf = requestAnimationFrame(step); else out.textContent = fmt(to);
    })(t0);
    barOut.textContent = fmt(to);
    const token = (animate.n = (animate.n || 0) + 1);
    // Sicherheitsnetz: Endwert immer setzen, auch wenn der Browser Animationen pausiert
    setTimeout(() => { if (token === animate.n) { cancelAnimationFrame(raf); shown = to; out.textContent = fmt(to); } }, dur + 120);
  }

  function update() {
    const size = form.querySelector('input[name="umfang"]:checked');
    const items = [{ label: size.dataset.label, price: +size.dataset.price, base: true }];
    let total = +size.dataset.price;
    form.querySelectorAll('input[name="extra"]').forEach((c) => {
      const incl = c.dataset.incl === size.value;
      const opt = c.closest('.opt');
      opt.classList.toggle('incl', incl);
      c.disabled = incl;
      const priceEl = opt.querySelector('.opt-price');
      priceEl.textContent = incl ? 'inklusive' : priceEl.dataset.txt;
      if (incl) { items.push({ label: c.dataset.label, price: 0 }); return; }
      if (c.checked) { total += +c.dataset.price; items.push({ label: c.dataset.label, price: +c.dataset.price, prefix: c.dataset.prefix || '' }); }
    });
    const care = form.querySelector('input[name="pflege"]:checked').value === 'abo';

    list.replaceChildren(...items.map((it) => {
      const li = document.createElement('li');
      const a = document.createElement('span'); a.textContent = it.label;
      const b = document.createElement('b'); b.textContent = it.base ? `${fmt(it.price)} €` : (it.price ? `+ ${it.prefix ? it.prefix + ' ' : ''}${fmt(it.price)} €` : 'inkl.');
      li.append(a, b);
      return li;
    }));
    monthly.hidden = !care;
    animate(total);

    const lines = items.map((it) => `– ${it.label}`).join('\n') + (care ? '\n– Pflege-Abo (25 € / Monat, mind. 6 Monate)' : '\n– Spätere Änderungen nach Absprache');
    const text = `Hallo Melanie,\n\nich interessiere mich für eine Webseite. Meine Auswahl aus dem Preisrechner:\n${lines}\n\nGeschätzter Preis: ca. ${fmt(total)} €\n\n`;
    send.href = `kontakt.html?thema=Webseite&anfrage=${encodeURIComponent(text)}`;
  }
  // Speisekarte: entweder vorhandene übernehmen oder neu gestalten
  form.addEventListener('change', (e) => {
    const g = e.target.dataset && e.target.dataset.group;
    if (g && e.target.checked) form.querySelectorAll(`input[data-group="${g}"]`).forEach((o) => { if (o !== e.target) o.checked = false; });
    update();
  });
  update();

  // Mobil: kleine Leiste mit dem aktuellen Preis, solange die Auswahl sichtbar ist
  const bar = document.querySelector('.calc-bar');
  const summary = document.querySelector('.summary');
  if (bar && 'IntersectionObserver' in window) {
    let inForm = false, sumVisible = false;
    const sync = () => bar.classList.toggle('show', inForm && !sumVisible);
    new IntersectionObserver((e) => { inForm = e[0].isIntersecting; sync(); }).observe(form);
    new IntersectionObserver((e) => { sumVisible = e[0].isIntersecting; sync(); }).observe(summary);
  }
})();

/* ---------------- 11. Logo: Bit springt beim Klicken ---------------- */
(function () {
  document.querySelectorAll('.brand').forEach((b) => {
    b.addEventListener('animationend', () => b.classList.remove('jump'));
    b.addEventListener('click', (e) => {
      if (reduceMotion || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      b.classList.remove('jump');
      void b.offsetWidth; // Animation neu starten
      b.classList.add('jump');
      setTimeout(() => { location.href = b.href; }, 480);
    });
  });
})();
