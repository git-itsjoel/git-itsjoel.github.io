document.addEventListener('DOMContentLoaded', () => {
    // 0. Scroll Progress Bar (Mobile)
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        });
    }

    // 1. Fluid Scroll Observer (Looping Animations)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-reveal');
            } else {
                // Remove class to allow re-animation when scrolling back into view
                entry.target.classList.remove('animate-reveal');
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll(
        '.hero-content > *,' +
        '.section-title,' +
        '.about-content,' +
        '.skill-card,' +
        '.project-card,' +
        '.timeline-item,' +
        '.contact-wrapper > *'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // 2. Stagger Logic for Grids
    const grids = document.querySelectorAll('.skills-grid, .projects-grid');
    grids.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, i) => {
            child.style.animationDelay = `${i * 100}ms`;
        });
    });

    // 3. Navbar Scroll Effect (Glassmorphism toggle)
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });

    // 4. Gradient Parallax Background
    class GradientParallax {
        constructor() {
            this.layers = document.querySelectorAll('.parallax-layer');
            this.scrollY = 0;
            this.ticking = false;

            // Parallax speeds for each layer (y-axis movement relative to scroll)
            this.speeds = [0.15, -0.1, 0.05]; // Different directions/speeds

            window.addEventListener('scroll', () => {
                this.scrollY = window.pageYOffset;
                if (!this.ticking) {
                    window.requestAnimationFrame(() => {
                        this.update();
                        this.ticking = false;
                    });
                    this.ticking = true;
                }
            });

            // Initial update
            this.update();
        }

        update() {
            // Reduce motion amplitude on mobile for performance/subtlety
            // Increased to 0.8 (from 0.5) to ensure perceptible motion against the new static anchor
            const isMobile = window.innerWidth < 768;
            const factor = isMobile ? 0.8 : 1;

            this.layers.forEach((layer, index) => {
                const speed = this.speeds[index] || 0.1;
                // Simple translation based on scroll position
                const yPos = this.scrollY * speed * factor;

                // Using translate3d for GPU acceleration
                layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        }
    }

    // Initialize Parallax
    if (document.querySelector('.parallax-layer')) {
        new GradientParallax();
    }
});
