import { initClock } from './components/clock.js';
import { initScanner } from './components/scanner.js';
import { initConsentSlider } from './components/slider.js';

document.addEventListener('DOMContentLoaded', () => {
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

            // Update active tab styles
            if (phoneNavDash) phoneNavDash.classList.toggle('active', index === 0);
            if (phoneNavScan) phoneNavScan.classList.toggle('active', index === 1);
            if (phoneNavShare) phoneNavShare.classList.toggle('active', index === 2);

            // Manage scanning loop on screen activation/deactivation
            if (index === 1) {
                scanner.start();
            } else {
                scanner.stop();
            }
        }
    }
});
