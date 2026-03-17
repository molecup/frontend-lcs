'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Counter({ value, duration = 2 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const countRef = useRef({ val: 0 });
    const elementRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(countRef.current, {
                val: value,
                duration: duration,
                ease: 'power3.out',
                onUpdate: () => {
                    setDisplayValue(Math.floor(countRef.current.val));
                },
                scrollTrigger: {
                    trigger: elementRef.current,
                    start: 'top 90%',
                    once: true,
                }
            });
        }, elementRef);

        return () => ctx.revert();
    }, [value, duration]);

    return <span ref={elementRef}>{displayValue}</span>;
}
