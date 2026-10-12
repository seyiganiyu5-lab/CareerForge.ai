'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// MUST match the actual order sections appear on the page
const SECTIONS = ['home', 'about', 'features', 'templates', 'pricing', 'faq'] as const;
export type SectionId = (typeof SECTIONS)[number];

export function useHashNavigation() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const isScrollingRef = useRef(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const id = sectionId.replace('#', '') as SectionId;
    const element = document.getElementById(id);
    if (element) {
      isScrollingRef.current = true;
      const navHeight = 72;
      const y = element.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
      setActiveSection(id);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as SectionId;
      if (SECTIONS.includes(hash)) {
        scrollToSection(hash);
      }
    };

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const navHeight = 72;
      let current = 'home' as SectionId;

      for (const sectionId of SECTIONS) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= navHeight + 80) {
            current = sectionId;
          }
        }
      }

      setActiveSection(current);
      if (window.location.hash.replace('#', '') !== current) {
        history.replaceState(null, '', `#${current}`);
      }
    };

    handleHashChange();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [scrollToSection]);

  return { activeSection, scrollToSection, sections: SECTIONS };
}