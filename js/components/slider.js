/**
 * Manages the slide-to-accept consent slider gesture and ticking countdown timer.
 * @returns {Function} A cleanup function to tear down event listeners and intervals.
 */
export function initConsentSlider() {
    const sliderHandle = document.getElementById('slider-handle');
    const sliderContainer = document.getElementById('consent-slider-container');
    const sliderText = document.getElementById('slider-text');
    const successOverlay = document.getElementById('share-success-overlay');
    const revokeBtn = document.getElementById('revoke-btn');
    const countdownTimer = document.getElementById('countdown-timer');

    if (!sliderHandle || !sliderContainer || !sliderText || !successOverlay || !revokeBtn || !countdownTimer) {
        console.warn('Consent slider elements not fully found.');
        return () => {};
    }

    let isDragging = false;
    let startX = 0;
    let maxSlide = 0;
    let currentTranslate = 0;
    let countdownInterval;

    function calculateMaxSlide() {
        maxSlide = sliderContainer.clientWidth - sliderHandle.clientWidth - 6; // Padding adjustments
    }

    function setHandlePosition(translateX) {
        currentTranslate = translateX;
        sliderHandle.style.transform = `translateX(${translateX}px)`;
        sliderText.style.opacity = maxSlide > 0 ? 1 - (translateX / maxSlide) : 1;
        const percent = maxSlide > 0 ? Math.round((translateX / maxSlide) * 100) : 0;
        sliderHandle.setAttribute('aria-valuenow', String(percent));
        sliderHandle.setAttribute('aria-valuetext', percent >= 100 ? 'Granted' : 'Not granted');
    }

    function startDrag(e) {
        isDragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        sliderHandle.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;

        // Prevent page scrolling on mobile while sliding
        if (e.type === 'touchmove') e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        let deltaX = clientX - startX;

        if (deltaX < 0) deltaX = 0;
        if (deltaX > maxSlide) deltaX = maxSlide;

        setHandlePosition(deltaX);
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;

        sliderHandle.style.transition = 'transform 0.3s ease';
        sliderText.style.transition = 'opacity 0.3s ease';

        // If dragged more than 80% of the way, complete the action
        if (currentTranslate >= maxSlide * 0.8) {
            setHandlePosition(maxSlide);

            // Show success screen
            setTimeout(triggerConsentSuccess, 200);
        } else {
            // Snap back
            setHandlePosition(0);
        }
    }

    function handleKeydown(e) {
        const step = Math.max(maxSlide * 0.1, 1);

        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            sliderHandle.style.transition = 'transform 0.15s ease';
            setHandlePosition(Math.min(currentTranslate + step, maxSlide));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            sliderHandle.style.transition = 'transform 0.15s ease';
            setHandlePosition(Math.max(currentTranslate - step, 0));
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sliderHandle.style.transition = 'transform 0.3s ease';
            sliderText.style.transition = 'opacity 0.3s ease';
            setHandlePosition(maxSlide);
            setTimeout(triggerConsentSuccess, 200);
        }
    }

    function triggerConsentSuccess() {
        successOverlay.classList.add('active');

        // Start a ticking down countdown (24 Hours)
        let hours = 23;
        let minutes = 59;
        let seconds = 59;

        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            seconds--;
            if (seconds < 0) {
                seconds = 59;
                minutes--;
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                    if (hours < 0) {
                        clearInterval(countdownInterval);
                        resetConsentSlider();
                        return;
                    }
                }
            }
            const hStr = String(hours).padStart(2, '0');
            const mStr = String(minutes).padStart(2, '0');
            const sStr = String(seconds).padStart(2, '0');
            countdownTimer.innerText = `Access Expires: ${hStr}:${mStr}:${sStr}`;
        }, 1000);
    }

    function resetConsentSlider() {
        clearInterval(countdownInterval);
        successOverlay.classList.remove('active');

        sliderHandle.style.transition = 'none';
        setHandlePosition(0);
    }

    // Set up dragging, clicking, and keyboard control
    calculateMaxSlide();
    sliderHandle.addEventListener('mousedown', startDrag);
    sliderHandle.addEventListener('touchstart', startDrag, { passive: true });
    sliderHandle.addEventListener('keydown', handleKeydown);

    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    // Click support for slider container in case drag is finicky on desktop
    sliderContainer.addEventListener('click', (e) => {
        if (e.target !== sliderHandle && !isDragging) {
            sliderHandle.style.transition = 'transform 0.4s ease';
            sliderText.style.transition = 'opacity 0.4s ease';
            setHandlePosition(maxSlide);
            setTimeout(triggerConsentSuccess, 300);
        }
    });

    revokeBtn.addEventListener('click', resetConsentSlider);
    window.addEventListener('resize', calculateMaxSlide);

    // Return cleanup callback to prevent memory leaks if needed
    return () => {
        clearInterval(countdownInterval);
        window.removeEventListener('resize', calculateMaxSlide);
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('touchmove', drag);
        window.removeEventListener('mouseup', endDrag);
        window.removeEventListener('touchend', endDrag);
    };
}
