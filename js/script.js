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

async function init() {
    const status = document.getElementById('load-status');
    const images = document.querySelectorAll('.polaroid img');
    
    try {
        for (let img of images) {
            const src = img.getAttribute('src');
            status.innerText = `Loading memory...`;

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
        
        status.innerText = "Ready.";
        document.getElementById('start-btn').classList.remove('hidden');
    } catch (e) {
        status.innerHTML = `Error: ${e}`;
        document.getElementById('retry-btn').classList.remove('hidden');
    }
}

document.getElementById('start-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    audio.play().catch(console.error);
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    showNext();
});

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
            // WIDER SPREAD MULTIPLIERS
            const isMobile = window.innerWidth < 768;
            const rangeX = isMobile ? 65 : 85; // Increased horizontal spread
            const rangeY = isMobile ? 55 : 75; // Increased vertical spread

            const xDist = (Math.random() * rangeX - (rangeX/2)); 
            const yDist = (Math.random() * rangeY - (rangeY/2)); 
            const rot = (Math.random() * 30 - 15); // Random rotation up to 15 degrees
            
            p.style.transform = `translate(calc(-50% + ${xDist}vw), calc(-50% + ${yDist}vh)) rotate(${rot}deg)`;
            
            // FADE OUT TIMING (Animation takes 2s, plus 4s to look at them = 6s total)
            if (i === polaroids.length - 1) {
                setTimeout(() => {
                    gallery.style.transition = "opacity 2.5s";
                    gallery.style.opacity = 0;
                    setTimeout(() => {
                        gallery.classList.add('hidden');
                        document.getElementById('final-screen').classList.remove('hidden');
                    }, 2500);
                }, 6000); // 6000ms = 6 seconds wait before starting the fade out
            }
        });
    }, 500);
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'start-btn') return;
    if (document.getElementById('gallery-container').classList.contains('hidden') && 
        !document.getElementById('main-content').classList.contains('hidden')) {
        showNext();
    }
});

window.onload = init;