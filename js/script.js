/* ═══════════════════════════════════════════
   JOEL PORTFOLIO — SCRIPT  (perf-optimised)
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── CAPABILITY DETECTION ── */
    const supportsIO        = 'IntersectionObserver' in window;
    const prefersReduced    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch           = window.matchMedia('(pointer: coarse)').matches;
    const hasLimitedCpu     = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    const hasLimitedMemory  = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
    const isLowSpec         = prefersReduced || (isTouch && (hasLimitedCpu || hasLimitedMemory));

    if (isLowSpec) document.body.classList.add('low-spec');
    if (isTouch)   document.body.classList.add('is-touch');

    /* ─────────────────────────────────────────
       SINGLE rAF SCROLL LOOP
       All scroll-driven work is batched into ONE
       requestAnimationFrame tick so the browser
       only repaints once per frame.
    ───────────────────────────────────────────*/
    let scrollY      = window.scrollY;
    let rafPending   = false;

    // Cached DOM refs — never query inside scroll handler
    const scrollLine = document.querySelector('.scroll-line');
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    const orb3 = document.querySelector('.orb-3');

    /* NAV state */
    const nav = document.getElementById('island-nav');
    let navScrolled = false;
    // Use 30vh as the threshold: once scrolled past it, nav moves to bottom
    const NAV_THRESHOLD = () => window.innerHeight * 0.30;
    let navThreshold = NAV_THRESHOLD();

    function onScrollFrame() {
        rafPending = false;
        const y      = scrollY;
        const maxY   = document.documentElement.scrollHeight - window.innerHeight;
        const pct    = maxY > 0 ? (y / maxY) * 100 : 0;

        /* 1. Scroll progress line */
        if (scrollLine) scrollLine.style.width = pct + '%';

        /* 2. Nav position toggle — only touch classList when state changes */
        const shouldBeScrolled = y > navThreshold;
        if (shouldBeScrolled !== navScrolled) {
            navScrolled = shouldBeScrolled;
            document.body.classList.toggle('nav-scrolled', navScrolled);
        }

        /* 3. Orb parallax — desktop only, uses transform (compositor layer) */
        if (!isTouch && !isLowSpec) {
            if (orb1) orb1.style.transform = `translateY(${y * 0.06}px)`;
            if (orb2) orb2.style.transform = `translateY(${y * -0.04}px)`;
            if (orb3) orb3.style.transform = `translateY(${y * 0.03}px)`;
        }
    }

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(onScrollFrame);
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        navThreshold = NAV_THRESHOLD();
    }, { passive: true });

    // Run once on load
    onScrollFrame();

    /* ── CUSTOM CURSOR (desktop only) ── */
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (dot && ring && !isTouch) {
        dot.style.display  = 'block';
        ring.style.display = 'block';

        let mouseX = -200, mouseY = -200;
        let ringX  = -200, ringY  = -200;
        let cursorRaf = false;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Dot is instant via transform (compositor)
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
            if (!cursorRaf) {
                cursorRaf = true;
                requestAnimationFrame(animateRing);
            }
        }, { passive: true });

        function animateRing() {
            cursorRaf = false;
            ringX += (mouseX - ringX) * 0.14;
            ringY += (mouseY - ringY) * 0.14;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            if (Math.abs(mouseX - ringX) > 0.5 || Math.abs(mouseY - ringY) > 0.5) {
                cursorRaf = true;
                requestAnimationFrame(animateRing);
            }
        }

        document.querySelectorAll('a, button, [data-hover]').forEach(el => {
            el.addEventListener('mouseenter', () => { ring.classList.add('hovered'); dot.classList.add('hovered'); });
            el.addEventListener('mouseleave', () => { ring.classList.remove('hovered'); dot.classList.remove('hovered'); });
        });
    } else {
        if (dot)  dot.style.display = 'none';
        if (ring) ring.style.display = 'none';
    }

    /* ── ACTIVE NAV (IntersectionObserver — zero scroll cost) ── */
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item[data-section]');

    if (supportsIO && navItems.length) {
        const secObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navItems.forEach(n => n.classList.toggle('active', n.dataset.section === entry.target.id));
                }
            });
        }, { threshold: 0, rootMargin: '-20% 0px -60% 0px' });
        sections.forEach(s => secObs.observe(s));
    }

    /* ── REVEAL ON SCROLL (IntersectionObserver) ── */
    let revealObs = null;
    if (supportsIO) {
        revealObs = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const delay = Number(entry.target.dataset.revealDelay || i * 80);
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    revealObs.unobserve(entry.target); // fire once, then stop watching
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));
    } else {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('visible'));
    }

    /* ── SECTION TITLE FADE (IntersectionObserver) ── */
    if (supportsIO) {
        const fadeObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                    fadeObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.section-eyebrow, .section-title, .about-text p, .edu-card').forEach(el => {
            el.classList.add('fade-in-ready');
            fadeObs.observe(el);
        });
    } else {
        document.querySelectorAll('.section-eyebrow, .section-title, .about-text p, .edu-card').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    /* ── GITHUB PROJECTS ── */
    class GitHubProjects {
        constructor(username, exclude = []) {
            this.username = username;
            this.exclude  = exclude;
            this.grid = document.querySelector('.projects-grid');
            if (this.grid) this.init();
        }

        async init() {
            for (let i = 0; i < 3; i++) {
                const sk = document.createElement('article');
                sk.className = 'project-card skeleton-card';
                sk.innerHTML = `<div class="sk-line sk-title"></div><div class="sk-line sk-body"></div><div class="sk-line sk-body sk-short"></div>`;
                this.grid.appendChild(sk);
            }
            try {
                const repos = await this.fetch();
                this.grid.querySelectorAll('.skeleton-card').forEach(s => s.remove());
                const filtered = repos
                    .filter(r => !this.exclude.includes(r.name) && !r.fork)
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    .slice(0, 9);

                filtered.forEach((r, i) => {
                    const card = this.makeCard(r);
                    card.style.transitionDelay = `${i * 60}ms`;
                    this.grid.appendChild(card);
                    if (revealObs) {
                        setTimeout(() => revealObs.observe(card), 50);
                    } else {
                        card.classList.add('visible');
                    }
                });
            } catch {
                this.grid.querySelectorAll('.skeleton-card').forEach(s => s.remove());
                this.grid.innerHTML = `<article class="project-card"><p class="problem-statement" style="color:var(--text-tertiary)">Could not load GitHub repositories. Check back later.</p></article>`;
            }
        }

        async fetch() {
            const r = await fetch(`https://api.github.com/users/${this.username}/repos`, {
                headers: { Accept: 'application/vnd.github.v3+json' }
            });
            if (!r.ok) throw new Error('GitHub API ' + r.status);
            return r.json();
        }

        makeCard(repo) {
            const el = document.createElement('article');
            el.className = 'project-card';
            el.setAttribute('data-reveal', '');
            const stack = this.stack(repo);
            const type  = this.type(repo);
            el.innerHTML = `
                <div class="project-header">
                    <h3>${repo.name.replace(/-/g,' ')} <span class="accent">// ${type}</span></h3>
                    <a href="${repo.html_url}" class="github-link" target="_blank" rel="noopener">GitHub ↗</a>
                </div>
                <p class="problem-statement">${repo.description || 'A GitHub project showcasing engineering skills.'}</p>
                <div class="tech-stack">${stack.map(t => `<span>${t}</span>`).join('')}</div>
                <p class="outcome">${repo.stargazers_count > 0 ? `⭐ ${repo.stargazers_count} · ` : ''}Updated ${this.ago(repo.updated_at)}</p>
            `;
            // Spotlight: desktop only, cache rect and update only on rAF
            if (!isTouch && !isLowSpec) {
                let spotRaf = false;
                let cx = 0, cy = 0;
                el.addEventListener('mousemove', e => {
                    cx = e.offsetX; cy = e.offsetY;
                    if (!spotRaf) {
                        spotRaf = true;
                        requestAnimationFrame(() => {
                            el.style.setProperty('--mx', cx + 'px');
                            el.style.setProperty('--my', cy + 'px');
                            spotRaf = false;
                        });
                    }
                });
            }
            return el;
        }

        stack(r) {
            const s = r.language ? [r.language] : [];
            if (Array.isArray(r.topics) && r.topics.length) s.push(...r.topics.slice(0, 2));
            const def = { JavaScript: ['Web'], Python: ['Backend'], TypeScript: ['Full Stack'], 'C++': ['Systems'], HTML: ['Frontend'] };
            if (s.length === 1 && def[r.language]) s.push(def[r.language][0]);
            return s.slice(0, 3);
        }
        type(r) {
            const t = Array.isArray(r.topics) ? r.topics : [];
            if (t.includes('bot') || r.name.toLowerCase().includes('bot')) return 'Bot';
            if (t.includes('api') || r.name.toLowerCase().includes('api')) return 'API';
            if (t.includes('library')) return 'Lib';
            return 'Project';
        }
        ago(str) {
            const d = Math.ceil(Math.abs(new Date() - new Date(str)) / 864e5);
            if (d < 7)   return `${d}d ago`;
            if (d < 30)  return `${Math.floor(d / 7)}w ago`;
            if (d < 365) return `${Math.floor(d / 30)}mo ago`;
            return new Date(str).toLocaleDateString('en', { year: 'numeric', month: 'short' });
        }
    }

    new GitHubProjects('git-itsjoel', ['git-itsjoel', 'git-itsjoel.github.io']);

    /* Skeleton pulse CSS */
    const skStyle = document.createElement('style');
    skStyle.textContent = `
        .sk-line{background:rgba(252,237,216,.07);border-radius:6px;margin-bottom:.75rem;animation:sk-pulse 1.4s ease-in-out infinite}
        .sk-title{height:18px;width:60%}.sk-body{height:12px;width:100%}.sk-short{width:45%}
        @keyframes sk-pulse{0%,100%{opacity:.4}50%{opacity:.9}}
    `;
    document.head.appendChild(skStyle);

});
