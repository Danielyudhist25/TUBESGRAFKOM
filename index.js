import * as THREE from "three"
import PBRLoader from "./pbr_loader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; 
import KeyboardHandler from "./keyboard_handler";
import ui_overlay from "./ui_overlay";

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(
    45, window.innerWidth/window.innerHeight,
    0.1, 1000
)

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); 

cam.position.z = 5;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.setClearColor(0x000000, 0);

document.body.appendChild(renderer.domElement);

// Penanganan perubahan ukuran jendela
window.addEventListener('resize',()=> {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
});

// --- Pemuatan Tekstur Batu (Bolder) ---
let tex_loader = new THREE.TextureLoader();
// Menggunakan Promise.all untuk memuat semua tekstur secara bersamaan
let [tex_batu, tex_normal, tex_roughness, tex_ao] = await Promise.all([
    tex_loader.loadAsync('./img/boulder/badlands-boulders_albedo.png'),
    tex_loader.loadAsync('./img/boulder/badlands-boulders_normal-dx.png'),
    tex_loader.loadAsync('./img/boulder/badlands-boulders_roughness.png'),
    tex_loader.loadAsync('./img/boulder/badlands-boulders_ao.png')
]);

// Create Stone
function createStone(size, x, z) {
    // Menggunakan Dodecahedron agar bentuk batu tidak terlalu sempurna/bulat
    const geo = new THREE.DodecahedronGeometry(size, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
    const stone = new THREE.Mesh(geo, mat);
    stone.position.set(x, size * 0.6, z); // Agar batu sedikit tenggelam di pasir
    stone.castShadow = true;
    stone.receiveShadow = true;
    scene.add(stone);
    return stone;
}

const stone1 = createStone(1, -2, 0);
const stone2 = createStone(0.6, 1.5, 1);
const stone3 = createStone(0.4, 1, -1.5);

// --- Pemuatan Tekstur Karpet (Lantai) ---
let carpetloader = new PBRLoader("img/carpet/beige-carpet-worn1-","png");
await carpetloader.loadTexture();

// --- Pencahayaan ---
const light = new THREE.AmbientLight( 0x404040 ); 
scene.add( light );

const plight = new THREE.PointLight(0xffffff, 50, 100, 2); 
plight.castShadow = true;
plight.position.set(0, 3, 2);
plight.shadow.mapSize.width = 1024;
plight.shadow.mapSize.height = 1024;
scene.add(plight);

// --- Objek (Bolder Sphere) ---
const geo = new THREE.SphereGeometry(1, 50, 50);
const mat = new THREE.MeshStandardMaterial({ 
    map: tex_batu, 
    normalMap: tex_normal, 
    roughnessMap: tex_roughness, 
    roughness: 1, 
    aoMap : tex_ao,

});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
mesh.castShadow = true;

// --- Lantai (Plane) ---
const plane_geo = new THREE.PlaneGeometry(50, 50);
const plane_mat = new THREE.MeshStandardMaterial({
    map: carpetloader.albedo,
    normalMap : carpetloader.normal,
    roughness : carpetloader.roughness,

    map: carpetloader.albedo.clone(),
    normalMap: carpetloader.normal.clone(),
    roughnessMap: carpetloader.roughness.clone(),
});

const repeat = 10;
[plane_mat.map, plane_mat.normalMap, plane_mat.roughnessMap].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
});

const plane_mesh = new THREE.Mesh(plane_geo, plane_mat);
plane_mesh.rotation.x = -Math.PI/2;
plane_mesh.position.set(0, -1.2, 0); 
plane_mesh.receiveShadow = true;
scene.add(plane_mesh);

// --- Kontrol dan UI ---
const controls = new OrbitControls(cam, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

let keyboard_handler = new KeyboardHandler();
const gui = new ui_overlay();

mesh.matrixAutoUpdate = false; 

// --- Loop Animasi ---
function draw() {
    controls.update(); 

    let rMatrix = new THREE.Matrix4().makeRotationY(gui.param.y); 
    let tMatrix = new THREE.Matrix4().makeTranslation(gui.param.x, 0, gui.param.z); 
    
    let result = new THREE.Matrix4().multiplyMatrices(tMatrix, rMatrix);

    mesh.matrix.copy(result);
    
    renderer.render(scene, cam);
    
    requestAnimationFrame(draw);
}

draw();
