const lines = [
    `Upon looking at our photos,\nI've realized what I fear the most:\nLosing you.`,

    `We fight every day,\nWe get tired and drained as well—\nBut I'll always make you feel that you're the reason\nI choose to wake up each day.`,

    `These fights are nothing more than simple lessons\nWe need to learn,\nAnd I'll take them with you,\nEven if it feels like the whole world is falling apart,\nBecause staying means being with you until the end.`,

    `What a privilege to stay, despite the rough days we've had recently,\nWhat a privilege to be loved by you.`,

    `I've always liked running,\nEspecially when I know it's hard,\nBut it's even harder to realize that one day\nYou might eventually give up.`,

    `I want to do better,\nI want you to do better,\nI don't want to waste something\nI thought I'd never have.`
];

let currentLine = 0;
let isTransitioning = false;
const audio = new Audio('music.mp3');
audio.loop = true;

// ===== TASKBAR CLOCK =====
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('taskbar-clock');
    if (el) el.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 30000);

// ===== LOG BOX helper =====
const logMessages = [
    'Initializing memory module...',
    'Checking disk space...',
    'Loading image cache...',
    'Connecting to heart.exe...',
    'Scanning photo library...',
    'Converting HEIC files...',
    'Assembling memories...',
    'Almost there...',
];
let logIdx = 0;
function tickLog() {
    const el = document.getElementById('log-text');
    if (el && logIdx < logMessages.length) {
        el.textContent = logMessages[logIdx++];
    }
}
const logInterval = setInterval(tickLog, 900);

// ===== INIT =====
async function init() {
    const status = document.getElementById('load-status');
    const images = document.querySelectorAll('.polaroid img');

    try {
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const src = img.getAttribute('src');
            status.innerText = `Loading memory ${i + 1} of ${images.length}...`;
            tickLog();

            if (src.toLowerCase().endsWith('.heic')) {
                const response = await fetch(src);
                const blob = await response.blob();
                const convertedBlob = await heic2any({ blob, toType: "image/jpeg", quality: 0.5 });
                img.src = URL.createObjectURL(convertedBlob);
            }

            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = () => rej(src);
                if (img.complete) res();
            });
        }

        clearInterval(logInterval);
        status.innerText = 'All files loaded. Ready.';
        document.getElementById('log-text').textContent = 'Done. Click "Open" to begin.';
        document.getElementById('start-btn').classList.remove('hidden');

        // Stop progress bar animation
        const bar = document.getElementById('progress-bar');
        if (bar) {
            bar.style.animation = 'none';
            bar.style.width = '100%';
            bar.style.marginLeft = '0';
        }

    } catch (e) {
        clearInterval(logInterval);
        status.innerHTML = `Error: ${e}`;
        document.getElementById('log-text').textContent = `Failed to load: ${e}`;
        document.getElementById('retry-btn').classList.remove('hidden');
    }
}

// ===== START =====
document.getElementById('start-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    audio.play().catch(console.error);
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    showNext();
});

// ===== POEM =====
function showNext() {
    if (isTransitioning) return;

    if (currentLine < lines.length) {
        isTransitioning = true;
        const textEl = document.getElementById('poetic-text');
        textEl.style.opacity = 0;

        setTimeout(() => {
            textEl.innerText = lines[currentLine];
            textEl.style.opacity = 1;
            currentLine++;
            isTransitioning = false;
        }, 500);
    } else {
        startScatter();
    }
}

// ===== GALLERY =====
function startScatter() {
    document.getElementById('text-container').classList.add('hidden');
    const gallery = document.getElementById('gallery-container');
    const caption = document.getElementById('gallery-caption');
    gallery.classList.remove('hidden');

    const polaroids = document.querySelectorAll('.polaroid');

    setTimeout(() => {
        caption.classList.remove('hidden');
        setTimeout(() => caption.style.opacity = 1, 100);

        polaroids.forEach((p, i) => {
            const isMobile = window.innerWidth < 768;
            const rangeX = isMobile ? 65 : 85;
            const rangeY = isMobile ? 55 : 75;

            const xDist = (Math.random() * rangeX - (rangeX / 2));
            const yDist = (Math.random() * rangeY - (rangeY / 2));
            const rot = (Math.random() * 30 - 15);

            p.style.transform = `translate(calc(-50% + ${xDist}vw), calc(-50% + ${yDist}vh)) rotate(${rot}deg)`;

            if (i === polaroids.length - 1) {
                setTimeout(() => {
                    gallery.style.transition = 'opacity 2.5s';
                    gallery.style.opacity = 0;
                    setTimeout(() => {
                        gallery.classList.add('hidden');
                        document.getElementById('final-screen').classList.remove('hidden');
                    }, 2500);
                }, 6000);
            }
        });
    }, 500);
}

// ===== CLICK TO ADVANCE =====
document.addEventListener('click', (e) => {
    if (e.target.id === 'start-btn') return;
    if (
        document.getElementById('gallery-container').classList.contains('hidden') &&
        !document.getElementById('main-content').classList.contains('hidden')
    ) {
        showNext();
    }
});

window.onload = init;
