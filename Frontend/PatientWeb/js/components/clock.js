/**
 * Simulates a real-time mobile clock display.
 * @param {string} elementId - The ID of the DOM element to update.
 * @returns {Function} A cleanup function to stop the clock interval.
 */
export function initClock(elementId = 'phone-time') {
    const clockElement = document.getElementById(elementId);
    if (!clockElement) {
        console.warn(`Clock element with ID "${elementId}" not found.`);
        return () => {};
    }

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.innerText = `${hours}:${minutes}`;
    }

    const intervalId = setInterval(updateClock, 1000);
    updateClock();

    // Return cleanup callback
    return () => clearInterval(intervalId);
}
