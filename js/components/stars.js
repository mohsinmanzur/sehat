/**
 * Scatters small twinkling star dots across the hero's star field container.
 * Stars are kept in the upper portion of the hero so they don't overlap the
 * phone mockup lower down.
 * @param {string} containerId
 * @param {number} count
 */
export function initStars(containerId, count = 45) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const star = document.createElement('span');
        star.className = 'star';

        const size = 1.5 + Math.random() * 2.5;
        const top = Math.random() * 58;
        const left = Math.random() * 100;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 4;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${top}%`;
        star.style.left = `${left}%`;
        star.style.opacity = String(0.2 + Math.random() * 0.5);
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        fragment.appendChild(star);
    }

    container.appendChild(fragment);
}
