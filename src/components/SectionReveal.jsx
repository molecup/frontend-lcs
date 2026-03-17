'use client';

import { useEffect, useRef, useState } from 'react';

export default function SectionReveal({ title, children, className = '', align = 'left' }) {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const triggerEl = sectionRef.current;
        if (!triggerEl) return;

        // Usa IntersectionObserver per attivare l'animazione solo quando necessario
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px', threshold: 0.1 }
        );

        observer.observe(triggerEl);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || typeof window === 'undefined') return;

        const triggerEl = sectionRef.current;
        if (!triggerEl) return;

        const prefersReduced =
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Dynamic import di GSAP solo quando necessario
        import('gsap').then(({ gsap }) => {
            import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);

                const items = gsap.utils.toArray(triggerEl.children);
                if (!items.length) return;

                if (prefersReduced) {
                    gsap.set(items, { autoAlpha: 1, y: 0 });
                    return;
                }

                const ctx = gsap.context(() => {
                    gsap.set(items, { autoAlpha: 0, y: 20 });
                    const isMobile = window.matchMedia('(max-width: 900px)').matches;

                    gsap.timeline({
                        defaults: { ease: 'power3.out' },
                        scrollTrigger: {
                            trigger: triggerEl,
                            start: 'top 80%',
                            end: 'bottom 60%',
                            once: true,
                        },
                    }).to(items, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.15,
                    });

                    // Effetto parallasse solo desktop: su mobile causa overlap nello stack verticale.
                    if (!isMobile) {
                        const parallaxItems = gsap.utils.toArray(triggerEl.querySelectorAll('.parallax'));
                        parallaxItems.forEach((item) => {
                            const speed = item.dataset.speed || 0.5;
                            gsap.to(item, {
                                y: () => -ScrollTrigger.maxScroll(window) * (speed * 0.1),
                                ease: 'none',
                                scrollTrigger: {
                                    trigger: triggerEl,
                                    start: 'top bottom',
                                    end: 'bottom top',
                                    scrub: true,
                                },
                            });
                        });
                    }
                }, triggerEl);

                return () => ctx.revert();
            });
        });
    }, [isVisible]);

    return (
        <section
            ref={sectionRef}
            className={`section-reveal ${className}`.trim()}
            style={{ textAlign: align }}
        >
            {title ? <h2 className="section-reveal__title">{title}</h2> : null}
            {children}
        </section>
    );
}
