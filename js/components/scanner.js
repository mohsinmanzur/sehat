/**
 * Simulates document scanning (laser line movements, highlight matches, and reveals checks).
 * @returns {Object} An object with start() and stop() methods.
 */
export function initScanner() {
    let scannerAnimationTimeout;
    let ocrTimeout1, ocrTimeout2, ocrTimeout3;

    const res1 = document.getElementById('scan-res-1');
    const res2 = document.getElementById('scan-res-2');
    const res3 = document.getElementById('scan-res-3');
    const hl1 = document.getElementById('scan-hl-1');
    const hl2 = document.getElementById('scan-hl-2');
    const hl3 = document.getElementById('scan-hl-3');

    function resetScanner() {
        clearTimeout(scannerAnimationTimeout);
        clearTimeout(ocrTimeout1);
        clearTimeout(ocrTimeout2);
        clearTimeout(ocrTimeout3);

        if (res1) res1.classList.remove('visible');
        if (res2) res2.classList.remove('visible');
        if (res3) res3.classList.remove('visible');
        if (hl1) hl1.style.backgroundColor = 'transparent';
        if (hl2) hl2.style.backgroundColor = 'transparent';
        if (hl3) hl3.style.backgroundColor = 'transparent';
    }

    function startScannerSimulation() {
        resetScanner();

        // Animate checkmarks appearing sequentially as the laser moves
        ocrTimeout1 = setTimeout(() => {
            if (hl1) hl1.style.backgroundColor = 'rgba(42, 92, 255, 0.2)';
            if (res1) res1.classList.add('visible');
        }, 800);

        ocrTimeout2 = setTimeout(() => {
            if (hl2) hl2.style.backgroundColor = 'rgba(42, 92, 255, 0.2)';
            if (res2) res2.classList.add('visible');
        }, 1600);

        ocrTimeout3 = setTimeout(() => {
            if (hl3) hl3.style.backgroundColor = 'rgba(42, 92, 255, 0.2)';
            if (res3) res3.classList.add('visible');
        }, 2400);

        // Loop the scan simulation triggers
        scannerAnimationTimeout = setTimeout(startScannerSimulation, 5000);
    }

    return {
        start: startScannerSimulation,
        stop: resetScanner
    };
}
