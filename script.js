// ============================================================
// BELEZA COM IDENTIDADE — script.js
// ============================================================

// ┌──────────────────────────────────────────────────────────┐
// │  CONFIG — edite o contato da clínica em UM lugar só.       │
// │  phone: DDI + DDD + número, somente dígitos.               │
// └──────────────────────────────────────────────────────────┘
const CONFIG = {
  phone: '5547990000000',                          // ex.: 5547999998888
  waMessage: 'Olá! Gostaria de agendar uma consulta.',
  // opções do campo "Procedimento" no agendamento (edite à vontade)
  // OBS: quando integrar ao JLBruns, os procedimentos passam a vir do sistema.
  procedimentos: [
    'Avaliação inicial',
    'Procedimento 01',
    'Procedimento 02',
    'Procedimento 03',
    'Procedimento 04',
    'Outro / ainda não sei',
  ],
  // ── Integração com o sistema JLBruns ──
  // Enquanto useMock=true, o calendário usa dados de exemplo (sem backend).
  // Para ligar no JLBruns real: useMock=false + preencha apiBase e clinicSlug.
  jlbruns: {
    useMock: false,
    apiBase: 'https://jwsaemznqrstensiywdt.supabase.co/functions/v1/public',
    clinicSlug: 'teste',   // clínica de teste — trocar pelo slug real da cliente depois
  },
};

// ── Aplica o contato em todos os links marcados ──
//   data-wa            → link de WhatsApp com a mensagem padrão
//   data-wa="texto..." → link de WhatsApp com mensagem própria
//   data-tel           → link de telefone
(function applyContact() {
  const { phone, waMessage } = CONFIG;
  document.querySelectorAll('[data-wa]').forEach(a => {
    const msg = a.getAttribute('data-wa') || waMessage;
    a.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  });
  document.querySelectorAll('[data-tel]').forEach(a => {
    a.href = `tel:+${phone}`;
  });
})();

// ── Ano do rodapé (nunca fica desatualizado) ──
(function footerYear() {
  const el = document.querySelector('.foot-copy');
  if (el) el.textContent = `© ${new Date().getFullYear()} Beleza com Identidade. Todos os direitos reservados.`;
})();

// ── NAV scroll (muda de cor) ──
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Barra de progresso de rolagem (fio metálico no topo) ──
(function scrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  let ticking = false;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ── DRAWER — fecha de múltiplas formas ──
(function drawerNav() {
  const burger = document.querySelector('.burger');
  const drawer = document.querySelector('.drawer');
  const closeBtn = document.querySelector('.drawer-close');
  if (!burger || !drawer) return;

  // elementos focáveis dentro do drawer (para o focus-trap)
  const focusable = () => drawer.querySelectorAll('a[href], button:not([disabled])');

  function open() {
    drawer.classList.add('open');
    burger.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    (closeBtn || focusable()[0])?.focus();
  }
  function close() {
    drawer.classList.remove('open');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus(); // devolve o foco ao botão que abriu
  }
  function toggle() {
    drawer.classList.contains('open') ? close() : open();
  }

  burger.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', close);

  // fecha ao clicar em qualquer link do drawer
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // fecha ao clicar no fundo (área vazia do drawer)
  drawer.addEventListener('click', e => {
    if (e.target === drawer) close();
  });

  document.addEventListener('keydown', e => {
    if (!drawer.classList.contains('open')) return;
    // fecha com Escape
    if (e.key === 'Escape') { close(); return; }
    // prende o foco (Tab) dentro do drawer
    if (e.key === 'Tab') {
      const items = Array.from(focusable());
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

// ── SCROLL REVEAL ──
(function reveal() {
  const els = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
  const obs = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ── DEPOIMENTOS carrossel ──
(function carousel() {
  const track = document.querySelector('.depo-track');
  const prev = document.querySelector('.depo-prev');
  const next = document.querySelector('.depo-next');
  if (!track || !prev || !next) return;
  const cards = track.querySelectorAll('.depo-card');
  let idx = 0;
  const vis = () => window.innerWidth < 900 ? 1 : 3;
  function go(n) {
    const max = Math.max(0, cards.length - vis());
    idx = Math.max(0, Math.min(n, max));
    const gap = 24;
    const cw = cards[0].getBoundingClientRect().width + gap;
    track.style.transform = `translateX(-${idx * cw}px)`;
  }
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  window.addEventListener('resize', () => go(idx));
  let sx = 0;
  track.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) go(dx > 0 ? idx + 1 : idx - 1);
  }, { passive: true });
})();

// ── GALERIA lightbox antes/depois ──
(function lightbox() {
  const cards = Array.from(document.querySelectorAll('.gal-card'));
  const lb = document.querySelector('.lightbox');
  if (!lb || cards.length === 0) return;

  const stage = lb.querySelector('.lb-stage');
  const caption = lb.querySelector('.lb-caption');
  const counter = lb.querySelector('.lb-counter');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev = lb.querySelector('.lb-prev');
  const btnNext = lb.querySelector('.lb-next');

  const items = cards.map(c => ({
    label: c.dataset.label || '',
    antes: c.dataset.antes || 'antes',
    depois: c.dataset.depois || 'depois',
  }));
  let cur = 0;

  function render(i) {
    const it = items[i];
    stage.innerHTML =
      '<div class="lb-half"><span class="lb-tag l">Antes</span><div class="lb-ph antes">' + it.antes + '</div></div>' +
      '<div class="lb-half"><span class="lb-tag r">Depois</span><div class="lb-ph depois">' + it.depois + '</div></div>' +
      '<div class="lb-divider"></div>';
    caption.textContent = it.label;
    counter.textContent = (i + 1) + ' / ' + items.length;
  }
  function open(i) { cur = i; render(cur); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  function go(d) { cur = (cur + d + items.length) % items.length; render(cur); }

  cards.forEach((c, i) => {
    // torna o card operável por teclado (vira "botão" acessível)
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    c.setAttribute('aria-label', `Ampliar antes e depois — ${items[i].label}`);
    c.addEventListener('click', () => open(i));
    c.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => go(-1));
  btnNext.addEventListener('click', () => go(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
  }, { passive: true });
})();

// ════════════════════════════════════════════════════════════
//  AGENDAMENTO — adapter de dados (JLBruns)
// ════════════════════════════════════════════════════════════
//  Hoje roda em MODO MOCK (dados de exemplo no próprio navegador).
//  Para ligar no JLBruns real: em CONFIG.jlbruns defina useMock=false e
//  preencha apiBase + clinicSlug. A interface do calendário NÃO muda:
//  ela só consome Scheduling.getAvailability e Scheduling.createAppointment.
//
//  Contrato esperado do JLBruns (Edge Function pública):
//    GET  {apiBase}/availability?clinic={slug}&from=YYYY-MM-DD&to=YYYY-MM-DD
//         → { "YYYY-MM-DD": [ { "time":"09:00", "status":"livre" },
//                             { "time":"10:00", "status":"reservado" } ], ... }
//    POST {apiBase}/booking
//         body: { clinic, nome, telefone, procedimento, data, hora }
//         → { id, status: "confirmado" }
//         (o backend valida o horário e dispara as notificações de WhatsApp)
// ════════════════════════════════════════════════════════════
const Scheduling = (function () {
  const cfg = CONFIG.jlbruns || {};
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const midnight = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

  // ---------- MOCK ----------
  // Horários por dia da semana (0=dom … 6=sáb). No JLBruns isto é
  // configurado pela clínica; aqui é só exemplo.
  const HOURS = {
    1: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], // seg
    2: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], // ter
    3: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], // qua
    4: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], // qui
    5: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], // sex
    6: ['09:00', '10:00', '11:00', '12:00'],                            // sáb
    // domingo (0) fechado
  };
  const booked = new Set(); // reservas feitas nesta sessão (demonstração)

  function mockGetAvailability(fromISO, toISO) {
    const out = {};
    const today = midnight(new Date());
    const [fy, fm, fd] = fromISO.split('-').map(Number);
    const [ty, tm, td] = toISO.split('-').map(Number);
    const cur = new Date(fy, fm - 1, fd);
    const end = new Date(ty, tm - 1, td);
    while (cur <= end) {
      const key = iso(cur);
      const times = HOURS[cur.getDay()];
      if (times && midnight(cur) >= today) {
        out[key] = times.map(t => {
          // ~30% reservados de forma estável (não "pisca" a cada render)
          const reservado = booked.has(`${key} ${t}`) || (hash(key + t) % 10 < 3);
          return { time: t, status: reservado ? 'reservado' : 'livre' };
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return Promise.resolve(out);
  }

  function mockCreateAppointment(p) {
    booked.add(`${p.data} ${p.hora}`);
    // simula latência de rede
    return new Promise(res => setTimeout(() => res({ id: 'DEMO-' + Date.now(), status: 'confirmado' }), 650));
  }

  // ---------- JLBruns real (usado quando CONFIG.jlbruns está configurado) ----------
  function apiGetAvailability(fromISO, toISO) {
    const url = `${cfg.apiBase}/availability?clinic=${encodeURIComponent(cfg.clinicSlug)}&from=${fromISO}&to=${toISO}`;
    return fetch(url, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('availability'); return r.json(); });
  }
  function apiCreateAppointment(p) {
    return fetch(`${cfg.apiBase}/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinic: cfg.clinicSlug, ...p }),
    }).then(r => { if (!r.ok) throw new Error('booking'); return r.json(); });
  }

  function apiGetServices() {
    return fetch(`${cfg.apiBase}/services?clinic=${encodeURIComponent(cfg.clinicSlug)}`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('services'); return r.json(); });
  }
  function mockGetServices() {
    return Promise.resolve((CONFIG.procedimentos || []).map(name => ({ name, duration_minutes: 60, description: null })));
  }

  // usa o JLBruns real só quando desligado o mock E com apiBase/clinicSlug preenchidos
  const usarReal = !cfg.useMock && cfg.apiBase && cfg.clinicSlug;
  let servicesPromise;
  return {
    getAvailability: usarReal ? apiGetAvailability : mockGetAvailability,
    createAppointment: usarReal ? apiCreateAppointment : mockCreateAppointment,
    // busca os procedimentos do JLBruns uma única vez (cache)
    getServices: () => (servicesPromise ??= (usarReal ? apiGetServices() : mockGetServices())),
  };
})();

// ════════════════════════════════════════════════════════════
//  AGENDAMENTO — controlador do calendário
// ════════════════════════════════════════════════════════════
(function scheduler() {
  const root = document.querySelector('.sched');
  if (!root) return;

  const $ = sel => root.querySelector(sel);
  const grid = $('[data-cal-grid]');
  const monthLabel = $('[data-cal-month]');
  const btnPrev = $('[data-cal-prev]');
  const btnNext = $('[data-cal-next]');
  const empty = $('[data-sched-empty]');
  const slotsWrap = $('[data-slots-wrap]');
  const slotsBox = $('[data-slots]');
  const selDateEl = $('[data-sel-date]');
  const form = $('[data-form]');
  const procSel = $('[data-proc]');
  const summary = $('[data-summary]');
  const errorEl = $('[data-error]');
  const success = $('[data-success]');
  const successMsg = $('[data-success-msg]');
  const restart = $('[data-restart]');

  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtMonth = d => cap(d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
  const fmtFull = d => d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateFromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

  let view = new Date(); view.setDate(1); view.setHours(0, 0, 0, 0);
  let availability = {};
  let selectedDate = null;
  let selectedTime = null;

  // popula o select de procedimentos a partir do JLBruns (fallback: CONFIG.procedimentos)
  function fillProcedimentos(nomes) {
    procSel.innerHTML = '<option value="" disabled selected>Selecione…</option>';
    nomes.forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n; procSel.appendChild(o); });
  }
  procSel.innerHTML = '<option value="" disabled selected>Carregando…</option>';
  Scheduling.getServices()
    .then(list => fillProcedimentos(list && list.length ? list.map(s => s.name) : (CONFIG.procedimentos || [])))
    .catch(() => fillProcedimentos(CONFIG.procedimentos || []));

  function updateNav() {
    const now = new Date();
    const curMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    btnPrev.disabled = view <= curMonthStart; // não navega para meses passados
  }

  async function loadMonth() {
    monthLabel.textContent = fmtMonth(view);
    updateNav();
    grid.innerHTML = '<p class="sched-loading">Carregando…</p>';
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const last = new Date(view.getFullYear(), view.getMonth() + 1, 0);
    try {
      availability = await Scheduling.getAvailability(iso(first), iso(last));
    } catch (e) {
      grid.innerHTML = '<p class="sched-loading">Não foi possível carregar os horários. Tente novamente.</p>';
      return;
    }
    renderGrid();
  }

  const dayHasFree = key => {
    const slots = availability[key];
    return slots && slots.some(s => s.status === 'livre');
  };

  function renderGrid() {
    grid.innerHTML = '';
    const year = view.getFullYear(), month = view.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDow; i++) {
      const e = document.createElement('span');
      e.className = 'sched-day empty';
      grid.appendChild(e);
    }
    for (let d = 1; d <= days; d++) {
      const key = `${year}-${pad(month + 1)}-${pad(d)}`;
      if (dayHasFree(key)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sched-day free' + (key === selectedDate ? ' sel' : '');
        b.dataset.date = key;
        b.textContent = d;
        b.setAttribute('aria-label', `${fmtFull(dateFromKey(key))} — horários disponíveis`);
        b.addEventListener('click', () => selectDay(key, b));
        grid.appendChild(b);
      } else {
        const s = document.createElement('span');
        s.className = 'sched-day off';
        s.textContent = d;
        s.setAttribute('aria-disabled', 'true');
        grid.appendChild(s);
      }
    }
  }

  function selectDay(key, btn) {
    selectedDate = key;
    selectedTime = null;
    grid.querySelectorAll('.sched-day.sel').forEach(x => x.classList.remove('sel'));
    if (btn) btn.classList.add('sel');
    empty.hidden = true;
    success.hidden = true;
    form.hidden = true;
    slotsWrap.hidden = false;
    selDateEl.textContent = fmtFull(dateFromKey(key));
    renderSlots();
  }

  function renderSlots() {
    slotsBox.innerHTML = '';
    (availability[selectedDate] || []).forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sched-slot ' + (s.status === 'livre' ? 'free' : 'res');
      b.textContent = s.time;
      if (s.status === 'livre') {
        b.addEventListener('click', () => selectSlot(s.time, b));
      } else {
        b.disabled = true;
        b.setAttribute('aria-label', `${s.time} — reservado`);
      }
      slotsBox.appendChild(b);
    });
  }

  function selectSlot(time, btn) {
    selectedTime = time;
    slotsBox.querySelectorAll('.sched-slot.sel').forEach(x => x.classList.remove('sel'));
    btn.classList.add('sel');
    form.hidden = false;
    errorEl.hidden = true;
    summary.textContent = `${cap(fmtFull(dateFromKey(selectedDate)))} às ${time}`;
    form.querySelector('input[name="nome"]').focus();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    const fd = new FormData(form);
    const payload = {
      nome: (fd.get('nome') || '').trim(),
      telefone: (fd.get('telefone') || '').trim(),
      email: (fd.get('email') || '').trim(), // opcional — usado para confirmação por e-mail
      procedimento: fd.get('procedimento') || '',
      data: selectedDate,
      hora: selectedTime,
      website: (fd.get('website') || '').trim(), // honeypot anti-robô (deve ir vazio)
    };
    if (!payload.nome || !payload.telefone || !payload.procedimento) {
      errorEl.textContent = 'Preencha todos os campos para confirmar.';
      errorEl.hidden = false;
      return;
    }
    const submitBtn = form.querySelector('.sched-submit');
    const submitSpan = submitBtn.querySelector('span');
    submitBtn.disabled = true;
    submitSpan.textContent = 'Confirmando…';
    try {
      await Scheduling.createAppointment(payload);
      showSuccess(payload);
    } catch (err) {
      errorEl.textContent = 'Não foi possível confirmar agora. Tente novamente ou use o WhatsApp.';
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitSpan.textContent = 'Confirmar agendamento';
    }
  });

  function showSuccess(p) {
    form.hidden = true;
    slotsWrap.hidden = true;
    const quando = `${cap(fmtFull(dateFromKey(p.data)))} às ${p.hora}`;
    const primeiroNome = p.nome.split(' ')[0];
    successMsg.textContent = `${primeiroNome}, seu agendamento (${p.procedimento}) está confirmado para ${quando}. Ele já está na agenda da clínica. Até breve!`;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    loadMonth(); // recarrega para refletir o horário recém-reservado
  }

  restart.addEventListener('click', () => {
    success.hidden = true;
    form.reset();
    selectedTime = null;
    if (selectedDate) { slotsWrap.hidden = false; renderSlots(); }
    else empty.hidden = false;
  });

  function resetSelection() {
    selectedDate = null;
    selectedTime = null;
    slotsWrap.hidden = true;
    form.hidden = true;
    success.hidden = true;
    empty.hidden = false;
  }

  btnPrev.addEventListener('click', () => { view.setMonth(view.getMonth() - 1); resetSelection(); loadMonth(); });
  btnNext.addEventListener('click', () => { view.setMonth(view.getMonth() + 1); resetSelection(); loadMonth(); });

  loadMonth();
})();

// ════════════════════════════════════════════════════════════
//  EFEITOS — parallax · revelação (clip) · cursor magnético · fundo WebGL
//  Progressivo e leve: liga só quando faz sentido (mouse presente,
//  sem "reduzir movimento") e pausa o WebGL quando o hero sai da tela.
// ════════════════════════════════════════════════════════════
(function effects() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // ── Revelação das seções: MÁSCARA GRADIENTE ligada ao SCROLL (topo → base) ──
  //  O topo do bloco surge primeiro; o resto aparece de cima para baixo conforme
  //  a página rola. Estilo do site de referência.
  (function scrollReveal() {
    if (reduced) return;
    document.documentElement.classList.add('fx-scroll'); // neutraliza o reveal antigo
    const sel = '.sobre-visual, .sobre-text-col, .equipe-head, .equipe-grid, .proc-head, .proc-grid, .fil-intro, .fil-grid, .gal-head, .gal-grid, .depo-head, .depo-vp, .loc-info, .loc-map, .agendar-in, .foot-top';
    const els = Array.from(document.querySelectorAll(sel));
    if (!els.length) return;
    els.forEach(el => el.classList.add('fx-reveal'));
    const SOFT = 16; // borda suave do gradiente (%)
    let ticking = false;
    function update() {
      const vh = window.innerHeight;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        // 0 quando o topo está a ~88% da tela; 1 quando chega a ~38%
        const p = Math.max(0, Math.min(1, (vh * 0.88 - r.top) / (vh * 0.5)));
        const stop = p * (100 + SOFT);
        const m = `linear-gradient(to bottom, #000 ${Math.max(0, stop - SOFT).toFixed(1)}%, rgba(0,0,0,0) ${stop.toFixed(1)}%)`;
        el.style.webkitMaskImage = m;
        el.style.maskImage = m;
      }
      ticking = false;
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  // ── FAIXA (marquee): clona o conteúdo p/ preencher a largura e ficar contínuo ──
  //  Recalcula após as fontes carregarem e no resize (evita o "buraco" quando a
  //  largura medida muda depois que a fonte troca).
  (function buildMarquee() {
    const track = document.querySelector('.marquee-track');
    const wrap = document.querySelector('.marquee');
    const seq0 = track && track.querySelector('.mq-seq');
    if (!track || !wrap || !seq0) return;
    const template = seq0.cloneNode(true); // guarda o original antes de limpar
    function build() {
      const probe = template.cloneNode(true);
      probe.style.visibility = 'hidden';
      track.innerHTML = '';
      track.appendChild(probe);
      const seqW = probe.getBoundingClientRect().width || 400;
      track.removeChild(probe);
      const need = Math.max(2, Math.ceil(wrap.clientWidth / seqW) + 1); // cópias p/ cobrir a tela
      const half = () => {
        const h = document.createElement('div');
        h.className = 'mq-half';
        for (let i = 0; i < need; i++) h.appendChild(template.cloneNode(true));
        return h;
      };
      track.append(half(), half()); // 2 metades idênticas → translateX(-50%) contínuo
      track.style.animationDuration = Math.max(24, (need * seqW) / 70) + 's'; // velocidade constante
    }
    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  })();

  // ── Parallax de profundidade ([data-parallax] com velocidade própria) ──
  (function parallax() {
    if (reduced) return;
    const els = Array.from(document.querySelectorAll('[data-parallax]'))
      .map(el => ({ el, speed: parseFloat(el.dataset.parallax) || 0 }))
      .filter(x => x.speed);
    if (!els.length) return;
    let ticking = false;
    function update() {
      const mid = window.innerHeight / 2;
      for (const { el, speed } of els) {
        const r = el.getBoundingClientRect();
        const offset = (r.top + r.height / 2) - mid;
        el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
      }
      ticking = false;
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  // ── Botões magnéticos (discreto; só com mouse). O cursor personalizado foi removido. ──
  (function magnetic() {
    if (reduced || !finePointer) return;
    document.querySelectorAll('.btn, .nav-cta, .depo-btn').forEach(el => {
      el.setAttribute('data-magnetic', '');
      const strength = 0.22, max = 9;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        let x = (e.clientX - (r.left + r.width / 2)) * strength;
        let y = (e.clientY - (r.top + r.height / 2)) * strength;
        x = Math.max(-max, Math.min(max, x)); y = Math.max(-max, Math.min(max, y));
        el.style.transition = 'transform 0s';
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform = '';
      });
    });
  })();

  // ── Fundo WebGL do hero — SHADER FLUIDO INTERATIVO ──
  //  Desktop: reage ao mouse (o fluxo gira e o brilho champagne segue o cursor).
  //  Mobile/toque: um ponto de interação percorre sozinho um laço suave (Lissajous).
  //  Se o mouse parar (desktop), volta suavemente ao laço. Paleta do site.
  //  Sem WebGL → fica o gradiente CSS do hero (fallback silencioso).
  (function heroShader() {
    if (reduced) return;
    const canvas = document.querySelector('.fx-canvas');
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    const vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
    const fs = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }',
      'float noise(vec2 p){ vec2 i=floor(p), f=fract(p);',
      ' float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));',
      ' vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x), mix(c,d,u.x), u.y); }',
      'float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.02; a*=.5; } return v; }',
      'void main(){',
      ' float ar = u_res.x / u_res.y;',
      ' vec2 uv = gl_FragCoord.xy / u_res.xy;',
      ' float d = distance(vec2(uv.x*ar, uv.y), vec2(u_mouse.x*ar, u_mouse.y));',
      ' float infl = smoothstep(0.5, 0.0, d);',          // foco suave onde o ponto (defasado) está/passou
      ' uv += (u_mouse - uv) * infl * 0.12;',            // LENTE suave — arrasta a fumaça, sem vórtice (nada bufado)
      ' float t = u_time*0.035;',                         // fumaça: lenta e constante
      ' vec2 p = vec2(uv.x*ar, uv.y) * 1.6;',
      ' vec2 warp = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(4.3, 1.9) - vec2(t*0.8, 0.0)));',  // domain warp = fumaça
      ' float n = fbm(p + 1.6*warp);',
      ' vec3 pearl=vec3(0.949,0.945,0.933), silver=vec3(0.486,0.529,0.549), champ=vec3(0.784,0.718,0.608), graph=vec3(0.227,0.239,0.251);',
      ' vec3 col = mix(pearl, silver, smoothstep(0.15,0.82,n));',
      ' col = mix(col, champ, smoothstep(0.55,0.96,n)*0.55);',
      ' col = mix(col, graph, smoothstep(0.86,1.0,n)*0.10);',
      ' col = mix(col, champ, infl*0.12);',              // leve realce por onde passou (discreto)
      ' float alpha = 0.5 + 0.3*n + infl*0.05;',
      ' alpha = clamp(alpha, 0.0, 0.85);',
      ' gl_FragColor = vec4(col, alpha);',
      '}',
    ].join('\n');

    function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    // ponto de interação em 0..1 (y invertido p/ casar com o shader)
    let tx = 0.5, ty = 0.55, mxs = 0.5, mys = 0.55, lastMove = -9999;
    if (finePointer) {
      window.addEventListener('mousemove', e => {
        tx = e.clientX / window.innerWidth;
        ty = 1 - e.clientY / window.innerHeight;
        lastMove = performance.now();
      }, { passive: true });
    }
    const maxDPR = finePointer ? 1.5 : 1.25;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDPR);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    }
    let visible = true, running = false;
    const start = performance.now();
    function frame(now) {
      if (!visible || document.hidden) { running = false; return; }
      const el = (now - start) / 1000;
      // laço automático LENTO (movimento próprio, tipo fumaça) — SEMPRE ativo
      const ax = 0.5 + 0.30 * Math.sin(el * 0.22);
      const ay = 0.5 + 0.22 * Math.cos(el * 0.18);
      // o mouse mistura seu ponto ao laço; o peso decai ao parar, mas nunca é
      // 100% → o movimento próprio nunca para, mesmo com o cursor parado.
      const recency = finePointer ? Math.max(0, 1 - (now - lastMove) / 2000) : 0;
      const wgt = 0.65 * recency;
      const gx = ax * (1 - wgt) + tx * wgt;
      const gy = ay * (1 - wgt) + ty * wgt;
      // interpolação BEM lenta → o ponto desliza devagar "por onde o mouse passou"
      mxs += (gx - mxs) * 0.03;
      mys += (gy - mys) * 0.03;

      resize();
      gl.uniform1f(uTime, el);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mxs, mys);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(frame);
    }
    function play() { if (!running) { running = true; requestAnimationFrame(frame); } }
    canvas.classList.add('ready');
    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) play(); }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
    play();
  })();
})();

// ════════════════════════════════════════════════════════════
//  PROCEDIMENTOS — vitrine alimentada pelo JLBruns
//  A grade começa VAZIA e OCULTA (visibility:hidden no HTML).
//   • com dados  → renderiza os procedimentos reais e revela;
//   • sem dados / offline → esconde a seção inteira.
//  Como não há placeholder no HTML, nada "pisca" antes dos dados.
// ════════════════════════════════════════════════════════════
(function procShowcase() {
  const grid = document.querySelector('.proc-grid');
  if (!grid) return;
  const section = grid.closest('section');
  const icons = ['✦', '◈', '◇', '✧', '◉', '⬡', '◎', '✧'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtDur = min => { if (!min) return ''; const h = Math.floor(min / 60), m = min % 60; return h ? (m ? `${h}h${m}` : `${h}h`) : `${m} min`; };
  const hide = () => { if (section) section.style.display = 'none'; };
  Scheduling.getServices()
    .then(list => {
      if (!list || !list.length) { hide(); return; } // sem procedimentos → não exibe a seção
      grid.innerHTML = list.map((s, i) => (
        '<article class="proc-card">' +
          '<div class="proc-top"><span class="proc-num">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<div class="proc-ic">' + icons[i % icons.length] + '</div></div>' +
          '<h3 class="proc-name">' + esc(s.name) + '</h3>' +
          '<p class="proc-desc">' + esc(s.description || 'Fale com a clínica para saber mais sobre este procedimento.') + '</p>' +
          '<div class="proc-dur">' + fmtDur(s.duration_minutes) + '</div>' +
        '</article>'
      )).join('');
      grid.removeAttribute('aria-busy');
      grid.style.visibility = 'visible'; // revela só com o conteúdo real montado
    })
    .catch(hide); // erro/offline → esconde a seção (sem placeholders falsos)
})();
