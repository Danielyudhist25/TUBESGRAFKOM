import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Flower } from './Flower.js';

// --- Setup Dasar ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); // Langit malam gelap

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const flowers = [];
let isWatering = false;

// --- Cahaya ---
const sun = new THREE.PointLight(0xffffff, 100, 100);
sun.position.set(5, 10, 5);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x404040, 2));

// --- Dasar Bulan ---
const moonGeo = new THREE.CylinderGeometry(8, 8, 0.5, 32);
const moonMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1 });
const moon = new THREE.Mesh(moonGeo, moonMat);
scene.add(moon);

// --- Logika Overlay ---
const welcome = document.getElementById('welcome-screen');
setTimeout(() => { welcome.style.opacity = '0'; }, 3000);

// --- Event Listeners ---
document.getElementById('add-btn').addEventListener('click', () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    flowers.push(new Flower(scene, new THREE.Vector3(x, 0.25, z)));
});

const waterBtn = document.getElementById('water-btn');
waterBtn.addEventListener('mousedown', () => isWatering = true);
window.addEventListener('mouseup', () => isWatering = false);

// --- Raycaster untuk Deteksi Siram ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateWatering() {
    if (!isWatering) return;

    // Deteksi bunga di bawah mouse
    raycaster.setFromCamera(mouse, camera);
    flowers.forEach(f => {
        const intersects = raycaster.intersectObject(f.group, true);
        if (intersects.length > 0) f.grow();
    });
}

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// --- Main Loop ---
function animate() {
    requestAnimationFrame(animate);
    
    // Update setiap bunga
    for (let i = flowers.length - 1; i >= 0; i--) {
        flowers[i].update();
        if (!flowers[i].alive) flowers.splice(i, 1);
    }

    updateWatering();
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
