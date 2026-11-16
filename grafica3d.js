/* Suono «click» a ogni clic su qualcosa di cliccabile (Fabrizio 16/11/2026).
   Nessun file audio: il suono è generato dal browser. Per spegnerlo su un dispositivo: localStorage 'mq-suono' = '0'. */
(function () {
  var ctx = null;
  var COSA = 'button,a[href],label,select,summary,[role=button],input[type=checkbox],input[type=radio],input[type=submit],.tendina-btn,.opz,[data-sez],[data-imp]';
  function click() {
    try { if (localStorage.getItem('mq-suono') === '0') return; } catch (e) {}
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      // colpo secco: un soffio brevissimo di rumore + una nota che cade
      var n = ctx.createBufferSource(), buf = ctx.createBuffer(1, 600, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      n.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800;
      var gn = ctx.createGain(); gn.gain.value = 0.22;
      n.connect(f); f.connect(gn); gn.connect(ctx.destination); n.start(t);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(420, t + 0.045);
      g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.08);
    } catch (e) {}
  }
  document.addEventListener('pointerdown', function (e) {
    var el = e.target && e.target.closest ? e.target.closest(COSA) : null;
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    click();
  }, true);
  // Invio o Spazio su un bottone: stesso suono
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches('button,a[href],[role=button]')) click();
  }, true);
})();

/* ISCRIZIONE IN MOVIMENTO (Fabrizio 16/11/2026 sera): sfondo con piastrelle che galleggiano, schede che si inclinano verso il cursore,
   ingresso a cascata dei riquadri. Si accende solo nelle pagine d'iscrizione e di accesso (body.g3-onb). */
(function () {
  var piano = !window.matchMedia || !matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ONB = '.onb-split,.passo .piani,.onb-box,body>main.box';
  var chiave = '';
  var TILT = '.g3-t';
  // RIQUADRI CHE SI MUOVONO IN TUTTE LE PAGINE (Fabrizio 16/11/2026 sera: «i riquadri devono muoversi così in tutte le pagine del sito»):
  // app (riquadri, passi della mail, piani, profili) e sito di presentazione (carte, piani, righe). Le schede piccole si inclinano di più, i riquadri grandi appena.
  var RIQUADRI = '.box,.ml-step,.piano,.profili label:not([aria-disabled="true"]),.onb-box .box,.carta,.riga:not(.presto),.demo';
  var FUORI = '.tel,#carico,#tour,.finestra,[role=dialog]';
  (function () {
    var st = document.createElement('style');
    st.textContent =
      '.g3-t{position:relative;transition:transform .32s cubic-bezier(.2,.8,.2,1),box-shadow .32s,border-color .32s!important}' +
      '@media (hover:hover){.g3-t:hover{transform:perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(var(--g3-su,-8px));' +
      'box-shadow:0 28px 48px rgba(0,0,0,.6),0 0 36px rgba(255,214,10,.16);border-color:rgba(255,214,10,.55)}}' +
      '.g3-luce{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;z-index:2;' +
      'background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.30),rgba(255,214,10,.12) 30%,transparent 62%)}' +
      '@media (hover:hover){.g3-t:hover>.g3-luce{opacity:1}}' +
      '@media (prefers-reduced-motion:reduce){.g3-t:hover{transform:none!important}}';
    (document.head || document.documentElement).appendChild(st);
  })();
  function marcaRiquadri() {
    document.querySelectorAll(RIQUADRI).forEach(function (el) {
      if (el.closest(FUORI)) return;
      if (!el.classList.contains('g3-t')) {
        el.classList.add('g3-t');
        var w = el.offsetWidth || 0;
        el.style.setProperty('--g3-su', w > 700 ? '-4px' : w > 420 ? '-7px' : '-12px');
      }
      if (!el.querySelector(':scope>.g3-luce')) { var l = document.createElement('span'); l.className = 'g3-luce'; l.setAttribute('aria-hidden', 'true'); el.appendChild(l); }
    });
  }
  function segna() {
    marcaRiquadri();
    var on = !!document.querySelector(ONB);
    document.body.classList.toggle('g3-onb', on);
    if (piano) sfondo(); // sfondo con le piastrelle in TUTTE le pagine (Fabrizio 16/11/2026 sera)
    if (!on) { chiave = ''; return; }
    // l'ingresso a cascata si vede UNA volta per pagina: se la pagina si ridisegna (stesso titolo) i riquadri compaiono subito
    var h = document.querySelector('.onb-split h2,#onb h2,body>main.box form:not([hidden]) h1'), k = h ? h.textContent : '';
    if (k !== chiave) { chiave = k; document.body.classList.remove('g3-quieto'); clearTimeout(segna.q); segna.q = setTimeout(function () { document.body.classList.add('g3-quieto'); }, 1900); }
    // ordine di entrata a cascata
    ['.profili label', '.piano', '.onb-form .row,.onb-form .leggi-cond,.onb-form .avanti', '.onb-box>*', '.brandpanel>*', 'body>main.box form:not([hidden])>*'].forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el, i) { el.style.setProperty('--g3-i', Math.min(i, 12)); });
    });
    if (piano) sfondo();
  }
  var mo = new MutationObserver(function () { clearTimeout(segna.t); segna.t = setTimeout(segna, 30); });
  function parti() { segna(); mo.observe(document.body, { childList: true, subtree: true }); }

  // inclinazione verso il cursore
  document.addEventListener('mousemove', function (e) {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    var el = e.target.closest && e.target.closest(TILT); if (!el) return;
    var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    var forza = r.width > 700 ? 2.5 : r.width > 420 ? 5 : el.classList.contains('piano') ? 9 : 12;
    el.style.setProperty('--ry', ((x - 0.5) * forza).toFixed(2) + 'deg');
    el.style.setProperty('--rx', ((0.5 - y) * forza).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  }, { passive: true });
  document.addEventListener('pointerout', function (e) {
    var el = e.target.closest && e.target.closest(TILT); if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
    el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
  }, true);

  // sfondo: piastrelle quadrate in filo giallo che salgono piano, ruotando in 3D
  var cv, cx, P = [], vivo = false;
  function sfondo() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.id = 'g3-sfondo'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;z-index:' + (document.body.classList.contains('g3-onb') ? 0 : -1) + ';pointer-events:none;opacity:' + (document.body.classList.contains('g3-onb') ? 1 : .6);
    document.body.insertBefore(cv, document.body.firstChild); cx = cv.getContext('2d');
    function misura() { var d = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; cx.setTransform(d, 0, 0, d, 0, 0); }
    misura(); addEventListener('resize', misura);
    var n = innerWidth < 700 ? 10 : 22;
    for (var i = 0; i < n; i++) P.push(nuova(true));
    vivo = true; requestAnimationFrame(passo);
  }
  /* sagome solo a contorno, come le piastrelle (Fabrizio 16/11/2026 sera: «anche qualche profilo di rubinetto o mobile da bagno») */
  function arco(cx, cy, r, da, a2, n) { var o = []; for (var i = 0; i <= n; i++) { var q = da + (a2 - da) * i / n; o.push([cx + r * Math.cos(q), cy + r * Math.sin(q)]); } return o; }
  var FORME = {
    // rubinetto a collo di cigno: base, corpo, becco curvo, leva
    rub: [
      [[-0.55, 1], [0.15, 1], [0.15, 0.9], [-0.55, 0.9]],
      [[-0.38, 0.9], [-0.38, -0.2]].concat(arco(0.25, -0.2, 0.63, Math.PI, 2 * Math.PI, 18)).concat([[0.88, 0.12], [0.62, 0.12]]).concat(arco(0.25, -0.2, 0.37, 0, -Math.PI, 14)).concat([[-0.12, 0.9]]),
      [[-0.25, -0.62], [-0.72, -0.86], [-0.78, -0.76], [-0.3, -0.52]]
    ],
    // mobile da bagno con lavabo, rubinetto, due ante e piedini
    mob: [
      [[-1, -0.38], [1, -0.38], [1, -0.22], [-1, -0.22]],
      arco(0, -0.8, 0.42, 0, Math.PI, 16),
      [[0.6, -0.38], [0.6, -0.95], [0.32, -0.95], [0.32, -0.88]],
      [[-0.9, -0.22], [0.9, -0.22], [0.9, 0.72], [-0.9, 0.72]],
      [[0, -0.22], [0, 0.72]], [[-0.12, 0.12], [-0.12, 0.34]], [[0.12, 0.12], [0.12, 0.34]],
      [[-0.78, 0.72], [-0.78, 0.86]], [[0.78, 0.72], [0.78, 0.86]]
    ],
    // lavabo da appoggio con colonna
    lav: [
      arco(0, -0.3, 0.8, 0, Math.PI, 20).concat([[-0.8, -0.3], [0.8, -0.3]]),
      [[-0.18, 0.5], [-0.24, 1], [0.24, 1], [0.18, 0.5]],
      [[0.45, -0.3], [0.45, -0.62], [0.2, -0.62]]
    ]
  };
  function nuova(ovunque) {
    var r = Math.random(), tipo = r < 0.68 ? 'q' : r < 0.8 ? 'rub' : r < 0.92 ? 'mob' : 'lav', q = tipo === 'q';
    return { tipo: tipo, x: Math.random() * innerWidth, y: ovunque ? Math.random() * innerHeight : innerHeight + 80, z: 0.35 + Math.random() * 0.9,
      s: q ? 18 + Math.random() * 46 : 34 + Math.random() * 40,
      a: q ? Math.random() * 6.28 : (Math.random() - .5) * 0.5, b: Math.random() * 6.28,
      va: q ? (Math.random() - .5) * 0.012 : (Math.random() - .5) * 0.002, vb: (Math.random() - .5) * (q ? 0.016 : 0.01), v: 0.15 + Math.random() * 0.35 };
  }
  var t0 = 0;
  function passo(t) {
    if (!vivo) return; requestAnimationFrame(passo);
    if (document.hidden) return;
    if (t - t0 < 30) return; t0 = t;
    cx.clearRect(0, 0, innerWidth, innerHeight);
    P.forEach(function (p, k) {
      p.y -= p.v * p.z * 1.6; p.a += p.va; p.b += p.vb;
      if (p.y < -80) P[k] = p = nuova(false);
      var s = p.s * p.z, ca = Math.cos(p.a), sa = Math.sin(p.a), q = !p.tipo || p.tipo === 'q';
      // le piastrelle girano su due assi; rubinetti e mobili oscillano appena (si riconoscono sempre)
      var cb = q ? Math.cos(p.b) : 0.82 + 0.18 * Math.cos(p.b);
      var linee = q ? [[[-1, -1], [1, -1], [1, 1], [-1, 1]]] : FORME[p.tipo];
      cx.strokeStyle = 'rgba(255,214,10,' + (0.07 + 0.16 * p.z + (q ? 0 : 0.04)).toFixed(3) + ')'; cx.lineWidth = 1.2 * p.z; cx.lineJoin = 'round';
      linee.forEach(function (L, j) {
        cx.beginPath();
        L.forEach(function (pt, i) { var x = pt[0] * s * cb, y = pt[1] * s; if (q) { x = pt[0] * s; y = pt[1] * s * cb; }
          var X = p.x + x * ca - y * sa, Y = p.y + x * sa + y * ca; i ? cx.lineTo(X, Y) : cx.moveTo(X, Y); });
        var chiusa = q || (p.tipo === 'rub' && j !== 1) || (p.tipo === 'mob' && (j === 0 || j === 1 || j === 3)) || (p.tipo === 'lav' && j < 2);
        if (chiusa) cx.closePath();
        cx.stroke();
        if (q) { cx.fillStyle = 'rgba(255,214,10,' + (0.012 + 0.025 * p.z).toFixed(3) + ')'; cx.fill(); }
      });
    });
  }
  // RIFLESSO SUI BOTTONI (Fabrizio 16/11/2026 sera: «aumenta l'effetto riflesso sul puntatore quando scorri tra i bottoni»).
  // Un velo di luce che segue il puntatore sopra il bottone su cui passi: non tocca lo stile dei bottoni, vale per app e sito.
  var BOTT = 'button:not([disabled]),.btn,.b3,.tile,.zona,.linkbtn,.profili label:not([aria-disabled="true"]),.ml-consenso,.ck-st';
  var luce = null, sotto = null;
  function veloLuce() {
    if (luce) return luce;
    luce = document.createElement('div'); luce.id = 'g3-riflesso'; luce.setAttribute('aria-hidden', 'true');
    luce.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:9999;opacity:0;transition:opacity .18s;' +
      'mix-blend-mode:screen;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35),inset 0 0 22px rgba(255,214,10,.25)';
    document.body.appendChild(luce); return luce;
  }
  document.addEventListener('mousemove', function (e) {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    var b = e.target.closest && e.target.closest(BOTT);
    if (b && (b.closest('#tour') || b.offsetWidth < 14)) b = null;
    var L = veloLuce();
    if (!b) { if (sotto) { L.style.opacity = '0'; sotto = null; } return; }
    var r = b.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, raggio = Math.max(70, Math.min(r.width, 260) * 0.9);
    L.style.left = r.left + 'px'; L.style.top = r.top + 'px'; L.style.width = r.width + 'px'; L.style.height = r.height + 'px';
    L.style.borderRadius = getComputedStyle(b).borderRadius;
    L.style.background = 'radial-gradient(' + raggio + 'px circle at ' + x + 'px ' + y + 'px,rgba(255,255,255,.62),rgba(255,236,150,.28) 28%,rgba(255,214,10,.08) 55%,transparent 75%)';
    L.style.opacity = '1'; sotto = b;
  }, { passive: true });
  addEventListener('scroll', function () { if (luce && sotto) { luce.style.opacity = '0'; sotto = null; } }, { passive: true });
  document.addEventListener('mousedown', function () { if (luce) luce.style.opacity = '0'; }, true);

  // RIQUADRI DI SPIEGAZIONE come la Mail automatica (Fabrizio 16/11/2026 sera): ogni capoverso su una riga con la sua iconcina,
  // le cose importanti su sfondo verde. Vale per tutti i «come fare», l'aiuto di Chiedi e le finestre Info (.guida).
  var ICONE = [
    [/^\s*(scrivi|chiedi|cerca|domand)/i, '💬'],
    [/attenzion|importante|non (si|vengono|puoi|stima)|servono|obbligator/i, '⚠️'],
    [/cifrat|privat|password|riservat/i, '🔐'], [/mail|casella/i, '✉️'], [/fattur|statistic|provvigion/i, '📊'],
    [/palett|imball|scatol|pallet/i, '📦'], [/listin/i, '📄'], [/condizion|sconto|surcharge|aument/i, '🏷️'],
    [/client/i, '👤'], [/fornitor|aziend/i, '🏭'], [/telefon|voce|mobile|iphone|android/i, '📱'],
    [/carica|trascin|file|excel|pdf/i, '📥'], [/prezz|netto|€|margine|costo/i, '💶'], 
    [/agenda|calendar|giorn|settiman/i, '📅'], [/salva|annulla|togli|cancella/i, '↩️'], [/ciao/i, '👋']
  ];
  var IMPORTANTE = /attenzion|importante|\bnon\b|solo (in lettura|il titolare|tu)|servono|obbligator|sempre|cifrat|privat/i;
  function guide() {
    document.querySelectorAll('.guida:not([data-g3])').forEach(function (g) {
      g.setAttribute('data-g3', '1');
      var righe = [];
      Array.prototype.forEach.call(g.children.length ? g.children : [g], function (p) {
        if (p.tagName !== 'P' && g.children.length) { righe.push({ html: p.outerHTML, grezzo: true }); return; }
        p.innerHTML.split(/<br\s*\/?>/i).forEach(function (pezzo) {
          var h = pezzo.replace(/^\s*(•|·|-|!)\s*/, '').trim(); if (!h) return;
          righe.push({ html: h });
        });
      });
      if (!righe.length) return;
      g.innerHTML = '<div class="g3-gt">💡 Come fare</div>' + righe.map(function (r) {
        if (r.grezzo) return r.html;
        var testo = r.html.replace(/<[^>]+>/g, ''), ic = '▸', tb = r.html.match(/^\s*<b>([^<]+)<\/b>/i), titolo = tb ? tb[1] : testo.slice(0, 40);
        // l'icona la decide il titolo in grassetto (o l'inizio della riga); se non basta, tutta la riga
        [titolo, testo].some(function (s) { for (var i = 0; i < ICONE.length; i++) if (ICONE[i][0].test(s)) { ic = ICONE[i][1]; return true; } return false; });
        return '<div class="g3-gr' + (IMPORTANTE.test(testo) ? ' imp' : '') + '"><span class="g3-gi">' + ic + '</span><span class="g3-gx">' + r.html + '</span></div>';
      }).join('');
      g.classList.add('g3-guida');
    });
  }
  // PROVA PUBBLICA (Fabrizio 16/11/2026: «accesso solo con codice invito, altrimenti impedisci registrazione e richiesta supporto»):
  // fuori dalla rete di casa i tasti che scrivono a supporto@ («Chiedi l'accesso», «Richiedi supporto», preventivi) portano
  // all'accesso con il codice di invito; nessuna richiesta di supporto parte.
  var PUBBLICO = !/^(100\.|127\.|192\.168\.|localhost$)/.test(location.hostname);
  function soloInvito() {
    if (!PUBBLICO) return;
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      if (a.dataset.g3inv) return; a.dataset.g3inv = '1';
      var dentroApp = /\/app/.test(location.pathname);
      if (dentroApp) { a.style.display = 'none'; return; }
      a.href = '/accedi.html#invito';
      if (/chiedi l.accesso|preventivo|scrivi|supporto/i.test(a.textContent)) a.textContent = a.textContent.replace(/chiedi l.accesso/i, 'Entra con il codice').replace(/chiedi un preventivo/i, 'Entra con il codice');
    });
    var su = document.getElementById('supporto'); if (su && /\/app/.test(location.pathname)) su.style.display = 'none';
  }
  var _segna = segna;
  segna = function () { try { guide(); soloInvito(); } catch (e) {} _segna(); };

  // si parte alla fine, quando tutte le variabili qui sopra sono pronte
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', parti); else parti();
})();

/* INTERRUTTORE 💻 PC / 📱 MOBILE SU OGNI PAGINA (Fabrizio 16/11/2026 sera: «voglio girarci come adesso, switchare pc/mobile a ogni pagina»).
   Sul computer: in basso a sinistra due tasti. «Mobile» apre la pagina in cui sei dentro un telefono a misura di iPhone (390 px):
   ci navighi normalmente (sito, accesso, iscrizione, app). «PC» chiude il telefono e ti porta, in grande, alla pagina dove eri arrivato.
   La scelta resta anche ricaricando. Dentro il telefono l'app parte nella sua versione mobile (window.name = 'mq-tel'). */
(function () {
  if (window !== window.top) return;                                   // dentro il telefono: niente interruttore
  if (window.matchMedia && matchMedia('(hover: none)').matches) return; // su un telefono vero non serve
  var tel = null, sw = null;
  function salva(v) { try { localStorage.setItem('mq-vista', v); } catch (e) {} }
  function stato() { if (!sw) return; sw.querySelector('[data-v=pc]').setAttribute('aria-pressed', !tel); sw.querySelector('[data-v=tel]').setAttribute('aria-pressed', !!tel); }
  function apri() {
    if (tel) return; salva('tel');
    tel = document.createElement('div'); tel.id = 'mq-telefono';
    tel.innerHTML = '<div class="mq-tel-scocca"><iframe name="mq-tel" title="Versione mobile" src="' + location.href.replace(/"/g, '&quot;') + '"></iframe></div>' +
      '<p class="mq-tel-nota">📱 Versione mobile · ci navighi come sul telefono · premi <b>💻 PC</b> per tornare in grande su questa pagina</p>';
    document.body.appendChild(tel); document.documentElement.style.overflow = 'hidden'; stato();
  }
  function chiudi() {
    if (!tel) { salva('pc'); return; }
    var dove = null; try { dove = tel.querySelector('iframe').contentWindow.location.href; } catch (e) {}
    salva('pc'); tel.remove(); tel = null; document.documentElement.style.overflow = ''; stato();
    if (dove && dove !== location.href && dove.indexOf('about:') !== 0) location.href = dove;
  }
  window.MQ_TEL = { apri: apri, chiudi: chiudi };
  addEventListener('message', function (e) { if (e.origin === location.origin && e.data === 'mq-pc') chiudi(); });
  function parti() {
    var st = document.createElement('style');
    st.textContent =
      '#mq-vista{position:fixed;left:16px;bottom:16px;z-index:100001;display:flex;gap:6px;padding:6px;border-radius:14px;background:linear-gradient(#1d1d21,#111113);border:1px solid #3a3a44;box-shadow:0 6px 0 #0a0a0b,0 16px 30px rgba(0,0,0,.6)}' +
      '#mq-vista button{all:unset;cursor:pointer;font:700 14px -apple-system,Helvetica,Arial,sans-serif;letter-spacing:.04em;color:#fff;padding:10px 14px;border-radius:10px;background:linear-gradient(#34343a,#26262a);box-shadow:0 4px 0 #0c0c0d,0 5px 0 #40404a;transition:transform .1s}' +
      '#mq-vista button:hover{transform:translateY(-2px)}#mq-vista button[aria-pressed=true]{background:#ffd60a;color:#000;transform:translateY(3px);box-shadow:0 1px 0 #a88a00}' +
      '#mq-telefono{position:fixed;inset:0;z-index:100000;background:radial-gradient(circle at 50% 40%,rgba(40,36,10,.92),rgba(0,0,0,.94));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;animation:mqtel .35s ease-out}' +
      '@keyframes mqtel{from{opacity:0;transform:scale(.97)}}' +
      '.mq-tel-scocca{position:relative;width:390px;height:min(844px,calc(100vh - 90px));padding:14px;border-radius:54px;background:#050505;border:3px solid #55555e;box-shadow:0 0 0 2px #1a1a1e,0 40px 80px rgba(0,0,0,.7),0 0 60px rgba(255,214,10,.12)}' +
      '.mq-tel-scocca iframe{width:100%;height:100%;border:0;border-radius:22px;background:#000;display:block}' +
      '.mq-tel-tacca{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:110px;height:28px;border-radius:16px;background:#000;z-index:2;pointer-events:none}' +
      '.mq-tel-nota{margin:0;color:#d6d6dc;font:14px -apple-system,Helvetica,Arial,sans-serif}.mq-tel-nota b{color:#ffd60a}';
    document.head.appendChild(st);
    sw = document.createElement('div'); sw.id = 'mq-vista'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Vista');
    sw.innerHTML = '<button type="button" data-v="pc">💻 PC</button><button type="button" data-v="tel">📱 Mobile</button>';
    sw.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; b.dataset.v === 'tel' ? apri() : chiudi(); };
    document.body.appendChild(sw);
    var v = null; try { v = localStorage.getItem('mq-vista'); } catch (e) {}
    if (v === 'tel') apri(); else stato();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', parti); else parti();
})();
