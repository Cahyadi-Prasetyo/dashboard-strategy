<template>
  <canvas
    ref="canvasRef"
    class="absolute inset-0 w-full h-full pointer-events-none"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);

let particles: Particle[] = [];
let animationFrameId: number | null = null;

// 1. Inisialisasi di luar layar agar partikel tidak 'kaget' di pojok (0,0)
let mouseX = -1000;
let mouseY = -1000;

// --- KONFIGURASI TAMPILAN ---
// Warna Slate-300 (Abu kebiruan modern)
const PARTICLE_COLOR = "203, 213, 225";
const PARTICLE_COUNT = 50;
const PARTICLE_RADIUS = 5; // Ukuran titik
const LINE_WIDTH = 2; // Ketebalan garis (Request kamu: ditebalkan)
const PARTICLE_VELOCITY = 0.5;
const ATTRACTION_DISTANCE = 200; // Jarak respon mouse
const ATTRACTION_FORCE = 0.02;

function initializeParticles(width: number, height: number) {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * PARTICLE_VELOCITY,
      vy: (Math.random() - 0.5) * PARTICLE_VELOCITY,
      radius: PARTICLE_RADIUS,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    // --- Update Physics ---
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Pantulan Dinding
    if (
      particle.x - particle.radius < 0 ||
      particle.x + particle.radius > width
    ) {
      particle.vx *= -1;
      particle.x = Math.max(
        particle.radius,
        Math.min(width - particle.radius, particle.x)
      );
    }
    if (
      particle.y - particle.radius < 0 ||
      particle.y + particle.radius > height
    ) {
      particle.vy *= -1;
      particle.y = Math.max(
        particle.radius,
        Math.min(height - particle.radius, particle.y)
      );
    }

    // --- Mouse Interaction ---
    const dx = mouseX - particle.x;
    const dy = mouseY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ATTRACTION_DISTANCE) {
      const angle = Math.atan2(dy, dx);
      particle.vx += Math.cos(angle) * ATTRACTION_FORCE;
      particle.vy += Math.sin(angle) * ATTRACTION_FORCE;

      // Limit max speed
      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      const maxSpeed = 3;
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed;
        particle.vy = (particle.vy / speed) * maxSpeed;
      }
    }

    // --- Draw Point ---
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${PARTICLE_COLOR}, ${particle.opacity})`;
    ctx.fill();
  });

  // --- Draw Connections ---
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];

      if (!p1 || !p2) continue;

      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        // Opacity dinamis: Semakin dekat semakin jelas (Max 0.6 agar tegas)
        const opacity = 0.6 * (1 - dist / 100);

        ctx.strokeStyle = `rgba(${PARTICLE_COLOR}, ${opacity})`;
        ctx.lineWidth = LINE_WIDTH; // Menggunakan setting ketebalan baru
        ctx.stroke();
      }
    }
  }
}

function animate() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawParticles(ctx, canvas.width, canvas.height);
  animationFrameId = requestAnimationFrame(animate);
}

// 2. Handler Mouse yang Lebih Akurat
function handleMouseMove(event: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Hitung posisi relatif terhadap canvas (penting jika ada scroll/margin)
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
}

function handleResize() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Ambil ukuran parent container agar responsif
  const rect = canvas.parentElement?.getBoundingClientRect();
  if (!rect) return;

  canvas.width = rect.width;
  canvas.height = rect.height;

  // Reset partikel agar tidak gepeng saat resize
  initializeParticles(canvas.width, canvas.height);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  handleResize();

  // Event Listener Global (Window) agar tembus elemen lain (seperti Card)
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);

  animate();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>
