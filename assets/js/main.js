/* معهد إيكو كارديو — حركة صفحة «قريبًا» (بدون مكتبات خارجية) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const GOLD = '205,176,124';

  // احتياط: إزالة شاشة الافتتاح حتى لو تأخرت الحركة
  setTimeout(() => { const intro = $('.intro'); if (intro) intro.remove(); }, 3200);

  // السنة الحالية في التذييل
  $$('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // الترويسة عند التمرير
  const top = $('.top');
  const onScroll = () => top.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ظهور العناصر عند التمرير
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$('.reveal').forEach((el) => io.observe(el));

  // شبكة جسيمات حيّة تتفاعل مع الماوس
  const pc = $('.particles');
  if (pc) {
    const ctx = pc.getContext('2d');
    let w, h, pts = [];
    const mouse = { x: -9999, y: -9999 };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = pc.clientWidth; h = pc.clientHeight;
      pc.width = w * dpr; pc.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(100, Math.max(28, Math.round((w * h) / 15000)));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.6, g: Math.random() < 0.6, p: Math.random() * 6 }));
    };
    const frame = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        if (dx * dx + dy * dy < 30000) { p.x -= dx * 0.01; p.y -= dy * 0.01; }
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 140) { ctx.strokeStyle = a.g && b.g ? `rgba(${GOLD},${(1 - d / 140) * 0.3})` : `rgba(130,140,230,${(1 - d / 140) * 0.28})`; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
      for (const p of pts) {
        const tw = 0.6 + Math.sin(t / 700 + p.p) * 0.4;
        ctx.fillStyle = p.g ? `rgba(231,212,170,${0.5 + tw * 0.5})` : `rgba(150,160,255,${0.45 + tw * 0.4})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.8 + tw * 0.4), 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    resize(); addEventListener('resize', resize);
    pc.parentElement.addEventListener('pointermove', (e) => { const r = pc.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    pc.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    requestAnimationFrame(frame);
  }

  // شاشة تخطيط القلب الحيّة
  const ec = $('.ecg');
  if (ec) {
    const ctx = ec.getContext('2d');
    const g = (t, m, s) => Math.exp(-((t - m) ** 2) / (2 * s * s));
    const wave = (t) => 0.12 * g(t, 0.14, 0.025) - 0.12 * g(t, 0.245, 0.008) + g(t, 0.27, 0.01) - 0.28 * g(t, 0.295, 0.01) + 0.24 * g(t, 0.5, 0.045);
    let w, h, ys, head = 0, ph = 0, period = 240;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(ec.clientWidth)); h = ec.clientHeight;
      ec.width = w * dpr; ec.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ys = new Float32Array(w); head = 0; period = Math.max(200, Math.min(300, w / 5));
    };
    const y = (v) => h * 0.62 - v * h * 0.5;
    const seg = (a, b, fa, fb) => {
      if (b - a < 2) return;
      const gr = ctx.createLinearGradient(a, 0, b, 0);
      gr.addColorStop(0, `rgba(${GOLD},${fa})`); gr.addColorStop(1, `rgba(${GOLD},${fb})`);
      ctx.strokeStyle = gr; ctx.beginPath(); ctx.moveTo(a, y(ys[a]));
      for (let x = a + 1; x < b; x++) ctx.lineTo(x, y(ys[x]));
      ctx.stroke();
    };
    const frame = () => {
      for (let s = 0; s < 3; s++) { head = (head + 1) % w; ph = (ph + 1 / period) % 1; ys[head] = wave(ph); }
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.shadowColor = `rgba(${GOLD},.8)`; ctx.shadowBlur = 10;
      const start = (head + 40) % w;
      if (start < head) seg(start, head, 0.05, 1);
      else { const m = (w - start) / ((w - start) + head || 1); seg(start, w, 0.05, 0.05 + m * 0.95); seg(0, head, 0.05 + m * 0.95, 1); }
      ctx.shadowBlur = 0;
      const gl = ctx.createRadialGradient(head, y(ys[head]), 0, head, y(ys[head]), 14);
      gl.addColorStop(0, 'rgba(255,246,223,1)'); gl.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(head, y(ys[head]), 14, 0, Math.PI * 2); ctx.fill();
      requestAnimationFrame(frame);
    };
    resize(); addEventListener('resize', resize); requestAnimationFrame(frame);
  }

  if (fine) {
    // توهج يتبع المؤشر
    const cur = $('.cursor');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; document.documentElement.classList.add('has-pointer'); });
    (function loop() { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); })();

    // الشعار يميل ثلاثي الأبعاد مع الماوس
    const em = $('.emblem');
    addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      em.style.transform = `perspective(900px) rotateY(${nx * 24}deg) rotateX(${-ny * 20}deg)`;
    });

    // أزرار مغناطيسية
    $$('[data-magnetic]').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    // بطاقات تميل وتتوهج
    $$('[data-tilt]').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.transition = 'transform .15s';
        c.style.transform = `translateY(-8px) rotateX(${(0.5 - py) * 12}deg) rotateY(${(px - 0.5) * 14}deg)`;
        c.style.setProperty('--mx', `${px * 100}%`); c.style.setProperty('--my', `${py * 100}%`);
      });
      c.addEventListener('pointerleave', () => { c.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1)'; c.style.transform = ''; });
    });
  }
})();
