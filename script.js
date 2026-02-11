const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const speedSlider = document.getElementById('speedControl');
const speedValueSpan = document.getElementById('speedValue');

let speedMultiplier = parseFloat(speedSlider.value);
speedValueSpan.textContent = speedSlider.value;

speedSlider.addEventListener('input', (event) => {
    const newSpeed = event.target.value;
    speedMultiplier = parseFloat(newSpeed);
    speedValueSpan.textContent = newSpeed;
});


function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function interpolateColor(color1, color2, factor) {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    return rgbToHex(r, g, b);
}

const stars = [];
const shootingStars = [];
const fallingElements = [];

const phrases = [
    "Te Amo Melli",
    "eres la mejorr🥺💘",
    "Eres preciosa🥺💘",
    "Me🥺 encantas",
    "Amor de mi vida",
    "❤️"
];

const images = [
    'https://png.pngtree.com/png-vector/20220619/ourmid/pngtree-sparkling-star-vector-icon-glitter-star-shape-png-image_5228522.png'
];

const heartImages = [
    '1.png',
    '2.png',
    '3.png',
    '4.png'
];

const textColorsCycle = [
    '#FFD700', '#FFA500', '#ADFF2F', '#00FFFF', '#FF69B4', '#FFFFFF', '#9932CC'
];
let currentColorIndex = 0;
let nextColorIndex = 1;
let transitionProgress = 0;
const transitionSpeed = 0.005;

let cameraX = 0;
let cameraY = 0;
let zoomLevel = 1;
const focalLength = 300;

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stars.length = 0;
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            delta: (Math.random() * 0.02) + 0.005
        });
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0a0a23");
    gradient.addColorStop(1, "#0c0004ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
    stars.forEach(star => {
        star.alpha += star.delta;
        if (star.alpha <= 0 || star.alpha >= 1) star.delta *= -1;
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function createShootingStar() {
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height / 2;
    shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 300 + 100,
        speed: Math.random() * 10 + 6,
        angle: Math.PI / 4,
        opacity: 1
    });
}

function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];

        const endX = s.x - Math.cos(s.angle) * s.length;
        const endY = s.y - Math.sin(s.angle) * s.length;

        const gradient = ctx.createLinearGradient(s.x, s.y, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.01;

        if (s.opacity <= 0) {
            shootingStars.splice(i, 1);
        }
    }
}

function createFallingElement() {
    const rand = Math.random();
    let type = (rand < 0.6) ? 'phrase' : (rand < 0.8) ? 'image' : 'heart';

    const initialZ = focalLength * 0.5 + Math.random() * focalLength * 4;
    const worldPlaneWidth = (canvas.width / focalLength) * initialZ;
    const worldPlaneHeight = (canvas.height / focalLength) * initialZ;
    const initialX = (Math.random() - 0.5) * worldPlaneWidth;
    const initialY = (Math.random() - 0.5) * worldPlaneHeight - (worldPlaneHeight * 0.5);

    let content;
    let baseSize;

    if (type === 'phrase') {
        content = phrases[Math.floor(Math.random() * phrases.length)];
        basebaseSiz = 700;
    } else {
        content = new Image();
        if (type === 'heart') {
            content.src = heartImages[Math.floor(Math.random() * heartImages.length)];
            baseSize = 150;
        } else {
            content.src = images[Math.floor(Math.random() * images.length)];
            baseSize = 100;
        }
        content.onload = () => {};
        content.onerror = () => {
            console.error("Failed to load image:", content.src);
            const index = fallingElements.findIndex(el => el.content === content);
            if (index > -1) fallingElements.splice(index, 1);
        };
    }

    fallingElements.push({
        type: type,
        content: content,
        x: initialX,
        y: initialY,
        z: initialZ,
        baseSize: baseSize,
        speedY: Math.random() * 0.8 + 0.4,
    });
}

function drawFallingElements() {
    const currentTextColor = interpolateColor(
        textColorsCycle[currentColorIndex],
        textColorsCycle[nextColorIndex],
        transitionProgress
    );

    fallingElements.sort((a, b) => b.z - a.z);

    for (let i = fallingElements.length - 1; i >= 0; i--) {
        const el = fallingElements[i];

        el.y += el.speedY * speedMultiplier;

        const perspectiveScale = focalLength / (focalLength + el.z);
        const size = el.baseSize * perspectiveScale * zoomLevel;
        const opacity = Math.max(0, Math.min(1, perspectiveScale * 2.5));

        const displayX = (el.x - cameraX) * perspectiveScale + canvas.width / 2;
        const displayY = (el.y - cameraY) * perspectiveScale + canvas.height / 2;

    
        if (displayY - size > canvas.height) {
            const worldPlaneWidth = (canvas.width / focalLength) * el.z;
            const worldPlaneHeight = (canvas.height / focalLength) * el.z;
            el.y = -worldPlaneHeight / 2 - 100; 
            el.x = (Math.random() - 0.5) * worldPlaneWidth;
            continue; 
        }

        ctx.save();
        ctx.globalAlpha = opacity;

        if (el.type === 'phrase') {
            ctx.fillStyle = currentTextColor;
            ctx.font = `${size}px 'Indie Flower', cursive`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = currentTextColor;
            ctx.shadowBlur = 5 * perspectiveScale;
            ctx.fillText(el.content, displayX, displayY);
            ctx.shadowColor = 'transparent';
        } else if (el.content.complete && el.content.naturalHeight !== 0) {
            ctx.drawImage(el.content, displayX - size / 2, displayY - size / 2, size, size);
        }

        ctx.restore();
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawStars();
    drawShootingStars();
    drawFallingElements();
    transitionProgress += transitionSpeed;
    if (transitionProgress >= 1) {
        transitionProgress = 0;
        currentColorIndex = nextColorIndex;
        nextColorIndex = (nextColorIndex + 1) % textColorsCycle.length;
    }
}


canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const scaleAmount = 0.1;
    if (event.deltaY < 0) zoomLevel += scaleAmount;
    else zoomLevel -= scaleAmount;
    zoomLevel = Math.max(0.1, Math.min(zoomLevel, 5));
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    cameraX -= dx / zoomLevel;
    cameraY -= dy / zoomLevel;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
animate();

setInterval(createShootingStar, 2000);

const initialFallingElementsCount = 250;
for (let i = 0; i < initialFallingElementsCount; i++) {
    createFallingElement();
}
