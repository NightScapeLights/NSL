/* =============================================
   NSL – Night-Scape Lighting  |  script.js
   ============================================= */

'use strict';

/* ===== STARFIELD CANVAS ===== */
(function initStars() {
    const canvas = document.getElementById('stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let animId;

    function resize() {
        const hero = canvas.parentElement;
        canvas.width  = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }

    function createStars() {
        stars = [];
        const count = Math.floor((canvas.width * canvas.height) / 5000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x:      Math.random() * canvas.width,
                y:      Math.random() * canvas.height,
                r:      Math.random() * 1.4 + 0.2,
                alpha:  Math.random(),
                speed:  Math.random() * 0.006 + 0.002,
                dir:    Math.random() > 0.5 ? 1 : -1,
                hue:    40 + Math.random() * 30   // warm gold-ish whites
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const s of stars) {
            s.alpha += s.speed * s.dir;
            if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
            s.alpha = Math.max(0, Math.min(1, s.alpha));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${s.hue}, 80%, 95%, ${s.alpha})`;
            ctx.fill();
        }
        animId = requestAnimationFrame(draw);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); createStars(); }, 150);
    });

    resize();
    createStars();
    draw();

    // Pause animation when tab is hidden to save resources
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else draw();
    });
})();


/* ===== NAVBAR ===== */
(function initNav() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('nav-links');
    const links     = navLinks ? navLinks.querySelectorAll('.nav-link') : [];

    // Scroll state
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // Hamburger toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('open');
            navLinks.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(l => l.classList.remove('active'));
                const match = navLinks.querySelector(`[href="#${e.target.id}"]`);
                if (match) match.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => observer.observe(s));
})();


/* ===== SCROLL REVEAL ===== */
(function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
})();


/* ===== COUNTER ANIMATION ===== */
(function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    function animateCounter(el) {
        const target   = parseFloat(el.dataset.target);
        const duration = 1800;
        const start    = performance.now();

        function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value    = Math.round(easeOutQuart(progress) * target);
            el.textContent = value;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                animateCounter(e.target);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
})();


/* ===== GALLERY TABS ===== */
(function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const grids   = document.querySelectorAll('.gallery-grid');
    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            grids.forEach(g => g.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(`tab-${btn.dataset.tab}`);
            if (target) target.classList.add('active');
        });
    });
})();


/* ===== LIGHTBOX ===== */
(function initLightbox() {
    const lb       = document.getElementById('lightbox');
    const lbImg    = document.getElementById('lb-img');
    const lbClose  = document.getElementById('lb-close');
    const lbPrev   = document.getElementById('lb-prev');
    const lbNext   = document.getElementById('lb-next');
    const lbCount  = document.getElementById('lb-counter');
    if (!lb) return;

    let images = [];
    let index  = 0;

    function show(i) {
        index = (i + images.length) % images.length;
        lbImg.style.opacity = '0';
        setTimeout(() => {
            lbImg.src = images[index];
            lbImg.style.opacity = '1';
        }, 150);
        lbCount.textContent = `${index + 1} / ${images.length}`;
    }

    function open(src, imgs) {
        images = imgs;
        index  = imgs.indexOf(src);
        show(index);
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Attach to gallery items
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const activeGrid = document.querySelector('.gallery-grid.active');
            const srcs = [...activeGrid.querySelectorAll('.gallery-item')]
                .map(i => i.dataset.src);
            open(item.dataset.src, srcs);
        });
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click',  () => show(index - 1));
    lbNext.addEventListener('click',  () => show(index + 1));

    lb.addEventListener('click', e => {
        if (e.target === lb) close();
    });

    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('active')) return;
        if (e.key === 'Escape')     close();
        if (e.key === 'ArrowLeft')  show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
    });

    // Touch/swipe support
    let touchStartX = 0;
    lb.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
    });
})();


/* ===== TESTIMONIALS SLIDER ===== */
(function initTestimonials() {
    const track   = document.getElementById('t-track');
    const dotsEl  = document.getElementById('t-dots');
    const prevBtn = document.getElementById('t-prev');
    const nextBtn = document.getElementById('t-next');
    if (!track) return;

    const cards  = track.querySelectorAll('.testimonial-card');
    let current  = 0;
    let autoPlay;

    // Build dots
    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 't-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Review ${i + 1}`);
        dot.addEventListener('click', () => go(i));
        dotsEl.appendChild(dot);
    });

    function go(n) {
        current = (n + cards.length) % cards.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dotsEl.querySelectorAll('.t-dot').forEach((d, i) =>
            d.classList.toggle('active', i === current)
        );
    }

    function startAuto() {
        clearInterval(autoPlay);
        autoPlay = setInterval(() => go(current + 1), 5500);
    }

    prevBtn.addEventListener('click', () => { go(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { go(current + 1); startAuto(); });

    // Touch/swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) { go(dx < 0 ? current + 1 : current - 1); startAuto(); }
    });

    startAuto();
})();


/* ===== BACK TO TOP ===== */
(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
})();


/* ===== CONTACT FORM ===== */
(function initForm() {
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        const submitBtn = form.querySelector('[type="submit"]');
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        // Simulate async send (no backend)
        setTimeout(() => {
            form.querySelectorAll('input, textarea').forEach(el => el.value = '');
            success.classList.add('show');
            submitBtn.textContent = 'Send My Request';
            submitBtn.disabled = false;
            setTimeout(() => success.classList.remove('show'), 6000);
        }, 900);
    });
})();


/* ===== SMOOTH ANCHOR SCROLLING (offset for fixed nav) ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-h')) || 76;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});
