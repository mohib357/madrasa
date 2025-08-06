const canvas = document.getElementById('satelliteCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===================================================================
// CONFIGURATION - Change these values to customize the animation
// ===================================================================
const config = {
    numberOfSatellites: 50,        // The total number of satellites on screen.
    satelliteColor: '0, 255, 255',  // The RGB color of the satellites.
    satelliteBaseSize: .5,          // The minimum size of a satellite.
    satelliteAddedSize: 2,          // Max additional random size for a satellite.
    satelliteBaseSpeed: 0.5,        // The base speed of satellites. Higher value = faster.

    // --- Satellite Image Configuration ---
    useSatelliteImage: false,               // true = use image, false = use circles.
    satelliteImageSrc: 'images/1.png',      // Example image URL.

    mouseInteractionRadius: 100,    // The radius around the mouse to connect with satellites.
    mouseNodeSize: 0,               // The size of the circle that follows the mouse.
    mouseNodeColor: '255, 255, 0',  // The RGB color of the mouse node.

    connectionDistance: 150,            // The maximum distance between satellites line.
    connectionLineColor: '0, 255, 255', // The RGB color of the connection lines.
    connectionLineWidth: 0.5            // The width of the lines connecting satellites.
};
// ===================================================================
// END OF CONFIGURATION
// ===================================================================

let satellites = [];
let mouse = { x: null, y: null, radius: config.mouseInteractionRadius };

// --- Image setup for satellites ---
let satelliteImg = null;
// Load the image only if useSatelliteImage is true and a source is provided.
if (config.useSatelliteImage && config.satelliteImageSrc) {
    satelliteImg = new Image();
    satelliteImg.src = config.satelliteImageSrc;
}

// --- Event Listeners ---
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// When mouse leaves the window, hide the mouse node
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouse.radius = config.mouseInteractionRadius; // Update radius on resize
    init();
});

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

        // Boundary check (bounce off walls)
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        // If an image is configured, loaded, and complete, draw the image
        if (satelliteImg && satelliteImg.complete) {
            // Draw image centered on x,y coordinates
            ctx.drawImage(satelliteImg, this.x - this.size / 2, this.y - this.size / 2, this.size * 5, this.size * 5);
        } else {
            // Otherwise, draw a circle
            ctx.fillStyle = `rgba(${config.satelliteColor}, 0.8)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }
}

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

            if (distance < mouse.radius) {
                let opacity = 1 - (distance / mouse.radius);
                ctx.strokeStyle = `rgba(${config.connectionLineColor}, ${opacity})`;
                ctx.lineWidth = config.connectionLineWidth * 2; // Make mouse lines thicker
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
        ctx.closePath();
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
// If using an image, wait for it to load before starting the animation.
// Otherwise, start immediately.
if (satelliteImg) {
    satelliteImg.onload = () => {
        init();
        animate();
    };
    // If image fails to load, start animation with circles
    satelliteImg.onerror = () => {
        console.error("Image failed to load. Falling back to circles.");
        satelliteImg = null; // Prevent further attempts
        init();
        animate();
    }
} else {
    init();
    animate();
}