"use client";
import React, { useEffect, useState, useRef } from "react";
import "./Styles/Nav.css";
import { usePathname } from "next/navigation";
import NavDesktop from "./nav/NavDesktop.jsx";
import NavMobile from "./nav/NavMobile.jsx";
import { useCitiesNav, DEFAULT_NAV_LOGO } from "./nav/useCitiesNav.js";
import Image from "next/image";


export default function NavClientSide({defaultCities}) {
  const pathname = usePathname();
  const {
    cities,
    mobileCities,
    mounted,
    persistCitiesOrder,
    sectionLinks,
    persistSectionLinksOrder,
    currentCitySlug,
  } = useCitiesNav(pathname, defaultCities);
  const [navLogoSrc, setNavLogoSrc] = useState(DEFAULT_NAV_LOGO);
  const [navLogoLabel, setNavLogoLabel] = useState("LCS");

  // Smart navbar: hide on scroll down, show on scroll up
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const TOP_LOCK_THRESHOLD = 80;
    const DIRECTION_DELTA = 6;

    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY || 0, 0);
      const delta = currentScrollY - lastScrollY.current;

      // Keep navbar visible near top of page.
      if (currentScrollY <= TOP_LOCK_THRESHOLD) {
        setNavHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Ignore tiny movement to avoid flicker.
      if (Math.abs(delta) < DIRECTION_DELTA) {
        lastScrollY.current = currentScrollY;
        return;
      }

      setNavHidden(delta > 0);
      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = Math.max(window.scrollY || 0, 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Trova la città corrente basandosi sullo slug estratto dal pathname
    if (currentCitySlug && currentCitySlug !== "esl") {
      const currentCity = cities.find(
        (city) => city?.slug === currentCitySlug ||
                  city?.href?.toLowerCase().includes(currentCitySlug)
      );
      if (currentCity?.logoSrc) {
        setNavLogoSrc(currentCity.logoSrc);
        setNavLogoLabel(currentCity.name || "LCS");
        return;
      }
    }
    // Default: logo LCS
    setNavLogoSrc(DEFAULT_NAV_LOGO);
    setNavLogoLabel("LCS");
  }, [cities, currentCitySlug]);

  return (
    <nav className={navHidden ? "nav-hidden" : undefined} suppressHydrationWarning>
      <a href="/" className="logo" aria-label={`Vai alla home di ${navLogoLabel}`} suppressHydrationWarning>
        <Image
          src={navLogoSrc}
          alt={`Logo ${navLogoLabel}`}
          className="logo-img"
          loading="lazy"
          suppressHydrationWarning
          fill
          sizes="(max-width: 600px) 40px, (max-width: 1200px) 60px, 80px"
        />
      </a>
      {/* Desktop: visibile via CSS su viewport >= 1200px */}
      {mounted ? (
        <NavDesktop
          cities={cities}
          mounted={mounted}
          persistCitiesOrder={persistCitiesOrder}
          sectionLinks={sectionLinks}
          persistSectionLinksOrder={persistSectionLinksOrder}
        />
      ) : (
        <div className="vetro1" style={{ visibility: "hidden" }}>
          <ul className="list-città">
            {mobileCities.map((city) => (
              <li key={city.href}>
                <a href={city.href}>{city.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Mobile: visibile via CSS su viewport < 1200px */}
      <NavMobile mobileCities={mobileCities} sectionLinks={sectionLinks} mounted={mounted} />
    </nav>
  );
}