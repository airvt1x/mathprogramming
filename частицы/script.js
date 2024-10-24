const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const particles = [];
const numParticles = 10;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
let animationFrameId;

function createParticles() {
    particles.length = 0; 
    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * 2 * Math.PI; // случайный угол
        const speed = Math.random(1,3) * 2 + 1; 
        particles.push({
            x: centerX, // Начальная позиция по X
            y: centerY, // Начальная позиция по Y
            speedX: Math.cos(angle) * speed, 
            speedY: Math.sin(angle) * speed  
        });
        console.log(`Частица ${i}: скоростьX = ${particles[i].speedX}, скоростьY = ${particles[i].speedY}`); // консоль скорости
    }
}


function displayCoordinates() {
    const coordinatesDiv = document.getElementById('coordinates');
    coordinatesDiv.innerHTML = `<strong>Координаты:</strong><br>`;

    particles.forEach((particle, index) => {
        coordinatesDiv.innerHTML += `Частица ${index}: (${particle.x.toFixed(2)}, ${particle.y.toFixed(2)})<br>`;
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    particles.forEach(particle => {
        particle.x += particle.speedX; 
        particle.y += particle.speedY;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    });

    displayCoordinates();
    animationFrameId = requestAnimationFrame(update); 
}

// сброс
function resetAnimation() {
    console.log("Сброс анимации"); 
    cancelAnimationFrame(animationFrameId); 
    createParticles(); 
    update();
}
document.getElementById('resetButton').addEventListener('click', resetAnimation);