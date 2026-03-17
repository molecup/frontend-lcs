'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function AnimatedTitle({ text, className }) {
    const titleRef = useRef(null);
    const lastScrollY = useRef(0);
    const [isHiddenOnMobile, setIsHiddenOnMobile] = useState(false);

    useEffect(() => {
        const el = titleRef.current;
        if (!el) return;
        gsap.fromTo(
            el,
            { autoAlpha: 0 },
            {
                autoAlpha: 1,
                duration: 0.35,
                ease: 'power2.out',
                overwrite: 'auto',
            }
        );
    }, []);

    useEffect(() => {
        const MOBILE_BREAKPOINT = 768;
        const TOP_LOCK_THRESHOLD = 50;
        const DIRECTION_DELTA = 6;

        const handleScroll = () => {
            const currentScrollY = Math.max(window.scrollY || 0, 0);

            if (window.innerWidth > MOBILE_BREAKPOINT) {
                setIsHiddenOnMobile(false);
                lastScrollY.current = currentScrollY;
                return;
            }

            if (currentScrollY <= TOP_LOCK_THRESHOLD) {
                setIsHiddenOnMobile(false);
                lastScrollY.current = currentScrollY;
                return;
            }

            const delta = currentScrollY - lastScrollY.current;
            if (Math.abs(delta) < DIRECTION_DELTA) {
                lastScrollY.current = currentScrollY;
                return;
            }

            setIsHiddenOnMobile(delta > 0);
            lastScrollY.current = currentScrollY;
        };

        const handleResize = () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                setIsHiddenOnMobile(false);
            }
        };

        lastScrollY.current = Math.max(window.scrollY || 0, 0);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <h1
            ref={titleRef}
            className={`city-title ${className || ''}`.trim()}
            style={{
                transform: isHiddenOnMobile ? 'translateY(-120%)' : 'translateY(0)',
                opacity: isHiddenOnMobile ? 0 : 1,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                willChange: 'transform, opacity',
            }}
        >
            {text}
        </h1>
    );
}