import { initClock } from './components/clock.js';
import { initScanner } from './components/scanner.js';
import { initConsentSlider } from './components/slider.js';
import { initStars } from './components/stars.js';

document.addEventListener('DOMContentLoaded', () => {
    // Toggle a solid background on the fixed header only once the page has
    // scrolled past the blue hero band - otherwise the blurred white bar
    // shows up as a hard-edged strip floating over the blue gradient.
    const header = document.getElementById('main-header');
    const heroEl = document.querySelector('.hero');
    if (header) {
        // Cache the scroll threshold outside the scroll handler - offsetHeight is a
        // layout read, and the header/hero heights only change on resize, not on
        // every scroll tick. Keeps the hot scroll path down to a plain comparison.
        let scrolledThreshold = 40;
        const updateThreshold = () => {
            scrolledThreshold = heroEl ? heroEl.offsetHeight - header.offsetHeight : 40;
        };
        const toggleHeaderBg = () => {
            header.classList.toggle('scrolled', window.scrollY > scrolledThreshold);
        };
        updateThreshold();
        toggleHeaderBg();
        window.addEventListener('scroll', toggleHeaderBg, { passive: true });
        window.addEventListener('resize', () => {
            updateThreshold();
            toggleHeaderBg();
        }, { passive: true });
    }

    initStars('hero-stars');

    const mockupContainer = document.getElementById('phone-mockup-container');
    if (mockupContainer) {
        fetch('phone.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load phone.html: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                mockupContainer.innerHTML = html;
                initializePhoneMockup();
            })
            .catch(err => console.error('Error loading simulated phone:', err));
    }

    function initializePhoneMockup() {
        // 1. Initialize clock simulation
        initClock('phone-time');

        // 2. Initialize scanner simulation
        const scanner = initScanner();

        // 3. Initialize slide to grant access gesture
        initConsentSlider();

        // 4. Set up interactive phone mockup views switching
        const slider = document.getElementById('screen-slider');
        const phoneNavDash = document.getElementById('phone-nav-dash-btn');
        const phoneNavScan = document.getElementById('phone-nav-scan-btn');
        const phoneNavShare = document.getElementById('phone-nav-share-btn');

        if (slider && phoneNavDash && phoneNavScan && phoneNavShare) {
            phoneNavDash.addEventListener('click', () => switchToScreen(0));
            phoneNavScan.addEventListener('click', () => switchToScreen(1));
            phoneNavShare.addEventListener('click', () => switchToScreen(2));
        }

        function switchToScreen(index) {
            if (!slider) return;

            // Shift slider (3 screens total, each taking up 33.333% of width)
            slider.style.transform = `translateX(-${index * 33.333}%)`;

            // Update active tab styles and ARIA selected state
            [[phoneNavDash, 0], [phoneNavScan, 1], [phoneNavShare, 2]].forEach(([tab, tabIndex]) => {
                if (!tab) return;
                tab.classList.toggle('active', index === tabIndex);
                tab.setAttribute('aria-selected', String(index === tabIndex));
            });

            // Manage scanning loop on screen activation/deactivation
            if (index === 1) {
                scanner.start();
            } else {
                scanner.stop();
            }
        }
    }
});
