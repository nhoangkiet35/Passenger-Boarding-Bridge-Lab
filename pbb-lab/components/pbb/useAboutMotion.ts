'use client';
import { useEffect, type RefObject } from 'react';
import { animate, inView } from 'motion';

/** Animate small content blocks rather than entire tall sections. */
export default function useAboutMotion(ref: RefObject<HTMLDivElement | null>, mode: 'system' | 'on' | 'off' = 'system') {
  useEffect(() => {
    const page = ref.current;
    if (!page) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const enabled = () => mode === 'on' || (mode === 'system' && !preference.matches);
    const selector = '.editorial-heading, .about-editorial > *, .about-stats > div, .about-visual-story > *, .bridge-explorer, .motion-story > *, .connection-study h2, .connection-study ol > li, .experience-list > article, .philosophy-list > article, .press-heading, .press-feature > *, .exhibition-intro > *, .exhibition-feature, .exhibit-card, .about-closing h2, .about-closing p';
    let cleanups: (() => void)[] = [];
    let seen = new WeakSet<Element>();
    const reveal = (element: HTMLElement) => {
      element.style.opacity = '1';
      element.style.transform = 'none';
    };
    const register = () => {
      if (!enabled()) return;
      page.querySelectorAll<HTMLElement>(selector).forEach(element => {
        if (seen.has(element)) return;
        seen.add(element);
        const rect = element.getBoundingClientRect();
        // Enhance after hydration: content remains readable without JavaScript.
        if (rect.top >= innerHeight) { element.style.opacity = '0'; element.style.transform = 'translateY(44px)'; }
        const stop = inView(element, () => {
          const index = Array.from(element.parentElement?.children ?? []).indexOf(element);
          const controls = animate(element, { opacity: [0, 1], y: [44, 0] }, { duration: .8, delay: Math.min(index * .09, .27), ease: [.22, 1, .36, 1] });
          cleanups.push(() => { controls.stop(); reveal(element); });
        }, { amount: .12, margin: '0px 0px -45px 0px' });
        cleanups.push(() => { stop(); reveal(element); });
      });
    };
    const configure = () => {
      if (!enabled()) { cleanups.forEach(stop => stop()); cleanups = []; seen = new WeakSet<Element>(); }
      else register();
    };
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(page, { childList: true, subtree: true });
    preference.addEventListener('change', configure);
    return () => { mutations.disconnect(); preference.removeEventListener('change', configure); cleanups.forEach(stop => stop()); };
  }, [ref, mode]);
}
