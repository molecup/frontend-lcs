"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import EmptyState from './EmptyState';
import './Styles/LocalPartners.css';

const fallbackLogo = '/logoCities/lcs.png';
const MOBILE_BREAKPOINT = '(max-width: 640px)';
const AUTO_PLAY_MS = 1000;

export default function LocalPartners({ partners = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [allowAutoPlay, setAllowAutoPlay] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mobileMedia = window.matchMedia(MOBILE_BREAKPOINT);
        const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

        const syncMediaState = () => {
            setIsMobile(mobileMedia.matches);
            setAllowAutoPlay(!reducedMotionMedia.matches);
        };

        syncMediaState();
        mobileMedia.addEventListener('change', syncMediaState);
        reducedMotionMedia.addEventListener('change', syncMediaState);

        return () => {
            mobileMedia.removeEventListener('change', syncMediaState);
            reducedMotionMedia.removeEventListener('change', syncMediaState);
        };
    }, []);

    useEffect(() => {
        if (!isMobile || !allowAutoPlay || partners.length < 2) return;

        const intervalId = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % partners.length);
        }, AUTO_PLAY_MS);

        return () => window.clearInterval(intervalId);
    }, [allowAutoPlay, isMobile, partners.length]);

    useEffect(() => {
        if (!isMobile || partners.length === 0) {
            setCurrentIndex(0);
            return;
        }

        if (currentIndex > partners.length - 1) {
            setCurrentIndex(0);
        }
    }, [currentIndex, isMobile, partners.length]);

    if (!Array.isArray(partners) || partners.length === 0) {
        return (
            <EmptyState
                title="Nessun partner locale"
                description="Stiamo lavorando per coinvolgere nuove realtà sul territorio. Torna presto per scoprire chi supporterà la competizione."
                action={{ label: 'Richiedi informazioni', href: '/#contatti' }}
                align="left"
            />
        );
    }

    const slideStyle = isMobile
        ? { transform: `translate3d(-${currentIndex * 100}%, 0, 0)` }
        : undefined;

    return (
        <section className="local-partners">
            <div className="local-partners__header">
                <p className="local-partners__eyebrow">Partnership locali</p>
                <h2 className="local-partners__title">Insieme per crescere il movimento scolastico</h2>
                <p className="local-partners__subtitle">Sponsor e istituzioni che sostengono il torneo con servizi, visibilità e iniziative sul territorio.</p>
            </div>
            <div className="local-partners__viewport">
                <div className="local-partners__track" style={slideStyle}>
                {partners.map((partner) => (
                    <a
                        key={partner.id || partner.name}
                        href={partner.url || '/#contatti'}
                        className="local-partner-card"
                        target={partner.url ? '_blank' : undefined}
                        rel={partner.url ? 'noreferrer' : undefined}
                        aria-label={`Visita ${partner.name}`}
                    >
                        <div className="local-partner-card__logo">
                            <Image
                                src={partner.logo || fallbackLogo}
                                alt={partner.name}
                                width={64}
                                height={64}
                                draggable={false}
                            />
                        </div>
                        <div className="local-partner-card__meta">
                            <span className="local-partner-card__type">{partner.type}</span>
                            <strong className="local-partner-card__name">{partner.name}</strong>
                        </div>
                        <div className="local-partner-card__cta">Scopri</div>
                    </a>
                ))}
                </div>
            </div>
            {isMobile && partners.length > 1 && (
                <div className="local-partners__dots" aria-label="Navigazione sponsor">
                    {partners.map((partner, index) => (
                        <button
                            key={`dot-${partner.id || partner.name}`}
                            type="button"
                            className={`local-partners__dot ${index === currentIndex ? 'is-active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Vai allo sponsor ${partner.name}`}
                            aria-current={index === currentIndex ? 'true' : 'false'}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
