// js/satellite.js

/**
 * This script creates a moving particle background animation on an HTML5 canvas.
 * It features particles (satellites) that move and connect with lines based on proximity,
 * and also interact with the user's mouse.
 */


// --- Canvas & Context Setup ---
const canvas = document.getElementById('satelliteCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to fill the entire window.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===================================================================
// BASE CONFIGURATION - Default values
// ===================================================================
let config = {
    // --- Particle Settings ---
    numberOfSatellites: 80,       // The total number of satellites on screen.
    satelliteColor: '0, 255, 255',   // The RGB color of the satellites.
    satelliteBaseSize: 0.5,         // The minimum size of a satellite.
    satelliteAddedSize: 2,          // Max additional random size for a satellite.
    satelliteBaseSpeed: 0.5,        // The base speed of satellites. Higher value = faster.

    // --- Satellite Image Configuration ---
    useSatelliteImage: false,              // true = use image, false = use circles.
    satelliteImageSrc: 'images/1.png',   // Example image URL.

    // --- Mouse Interaction Settings ---
    mouseInteractionRadius: 150,    // The radius around the mouse to connect with satellites.
    mouseNodeSize: 0,               // The size of the circle that follows the mouse.
    mouseNodeColor: '255, 255, 0',    // The RGB color of the mouse node.

    connectionDistance: 150,          // The maximum distance between satellites line.
    connectionLineColor: '0, 255, 255', // The RGB color of the connection lines.
    connectionLineWidth: 0.5          // The width of the lines connecting satellites.
};


// ===================================================================
// --- নতুন কোড: RESPONSIVE CONFIGURATIONS ---
// ===================================================================
// Configuration for large screens (desktops)
const configLarge = {
    numberOfSatellites: 50,
    connectionDistance: 150,
    mouseInteractionRadius: 100
};

// Configuration for medium screens (tablets)
const configMedium = {
    numberOfSatellites: 30,
    connectionDistance: 120,
    mouseInteractionRadius: 80
};

// Configuration for small screens (mobiles)
const configSmall = {
    numberOfSatellites: 20,
    connectionDistance: 100,
    mouseInteractionRadius: 60
};

// --- নতুন কোড: Function to update config based on screen size ---
function updateConfigForScreenSize() {
    const screenWidth = window.innerWidth;
    if (screenWidth > 1024) { // Large screens
        Object.assign(config, configLarge);
    } else if (screenWidth > 768) { // Medium screens
        Object.assign(config, configMedium);
    } else { // Small screens
        Object.assign(config, configSmall);
    }
    console.log(`Screen size updated. Using config for ${screenWidth > 1024 ? 'large' : screenWidth > 768 ? 'medium' : 'small'} screens.`);
}


// ===================================================================
// END OF CONFIGURATION
// ===================================================================


// --- Global State & Image Loading ---
let satellites = [];
let mouse = { x: null, y: null };

// Preload the satellite image if configured.
let satelliteImg = null;
if (config.useSatelliteImage && config.satelliteImageSrc) {
    satelliteImg = new Image();
    satelliteImg.src = config.satelliteImageSrc;
}

// --- Event Listeners ---
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateConfigForScreenSize(); // --- নতুন কোড: Resize-এর সময় কনফিগারেশন আপডেট করা
    init(); // Re-initialize with new settings
});

// --- Satellite Class Definition ---
class Satellite {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * config.satelliteAddedSize + config.satelliteBaseSize;
        this.speedX = (Math.random() * 2 - 1) * config.satelliteBaseSpeed;
        this.speedY = (Math.random() * 2 - 1) * config.satelliteBaseSpeed;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        if (satelliteImg && satelliteImg.complete) {
            ctx.drawImage(satelliteImg, this.x - this.size / 2, this.y - this.size / 2, this.size * 5, this.size * 5);
        } else {
            ctx.fillStyle = `rgba(${config.satelliteColor}, 0.8)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// --- Core Animation Functions ---
function init() {
    satellites = [];
    for (let i = 0; i < config.numberOfSatellites; i++) {
        satellites.push(new Satellite());
    }
}

function connectSatellites() {
    for (let i = 0; i < satellites.length; i++) {
        // Mouse to satellite connection
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - satellites[i].x;
            let dy = mouse.y - satellites[i].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < config.mouseInteractionRadius) {
                let opacity = 1 - (distance / config.mouseInteractionRadius);
                ctx.strokeStyle = `rgba(${config.connectionLineColor}, ${opacity})`;
                ctx.lineWidth = config.connectionLineWidth * 2;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(satellites[i].x, satellites[i].y);
                ctx.stroke();
            }
        }
        // Satellite to satellite connection
        for (let j = i + 1; j < satellites.length; j++) {
            let dx = satellites[i].x - satellites[j].x;
            let dy = satellites[i].y - satellites[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < config.connectionDistance) {
                let opacity = 1 - (distance / config.connectionDistance);
                ctx.strokeStyle = `rgba(${config.connectionLineColor}, ${opacity})`;
                ctx.lineWidth = config.connectionLineWidth;
                ctx.beginPath();
                ctx.moveTo(satellites[i].x, satellites[i].y);
                ctx.lineTo(satellites[j].x, satellites[j].y);
                ctx.stroke();
            }
        }
    }
}

function drawMouseNode() {
    if (mouse.x != null && mouse.y != null) {
        ctx.fillStyle = `rgba(${config.mouseNodeColor}, 1)`;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, config.mouseNodeSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < satellites.length; i++) {
        satellites[i].update();
        satellites[i].draw();
    }
    connectSatellites();
    drawMouseNode();
    requestAnimationFrame(animate);
}

// --- Start Animation ---
// --- নতুন কোড: প্রথমে স্ক্রিনের সাইজ অনুযায়ী কনফিগারেশন সেট করা ---
updateConfigForScreenSize();

if (satelliteImg) {
    satelliteImg.onload = () => {
        init();
        animate();
    };
    satelliteImg.onerror = () => {
        console.error("Image failed to load. Falling back to circles.");
        satelliteImg = null;
        init();
        animate();
    }
} else {
    init();
    animate();
}