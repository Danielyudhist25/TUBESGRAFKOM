import * as THREE from 'three';

export class Flower {
    constructor(scene, position) {
        this.scene = scene;
        this.growth = 0.2; // Ukuran awal
        this.maxGrowth = 1.0;
        this.isDry = false;
        this.lastWatered = Date.now();
        this.alive = true;

        // Grouping: Pot + Tanah + Bunga
        this.group = new THREE.Group();
        this.group.position.copy(position);

        // 1. Pot (Ukuran tetap)
        const potGeo = new THREE.CylinderGeometry(0.3, 0.2, 0.4, 12);
        const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        this.pot = new THREE.Mesh(potGeo, potMat);
        this.pot.position.y = 0.2;
        this.group.add(this.pot);

        // 2. Tanah
        const soilGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 12);
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.position.y = 0.4;
        this.group.add(soil);

        // 3. Bunga (Bagian yang tumbuh)
        this.flowerGroup = new THREE.Group();
        this.flowerGroup.position.y = 0.4;
        this.flowerGroup.scale.set(this.growth, this.growth, this.growth);

        // Batang
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
        this.stemMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const stem = new THREE.Mesh(stemGeo, this.stemMat);
        stem.position.y = 0.5;
        this.flowerGroup.add(stem);

        // Kelopak (Warna Random)
        const petalGeo = new THREE.SphereGeometry(0.2, 8, 8);
        this.petalMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        const head = new THREE.Mesh(petalGeo, this.petalMat);
        head.position.y = 1;
        this.flowerGroup.add(head);

        this.group.add(this.flowerGroup);
        this.scene.add(this.group);
    }

    grow() {
        if (this.growth < this.maxGrowth && !this.isDry) {
            this.growth += 0.0005;
            this.flowerGroup.scale.set(this.growth, this.growth, this.growth);
            this.lastWatered = Date.now(); // Reset timer saat disiram
        }
    }

    update() {
        const now = Date.now();
        const timeSinceWater = (now - this.lastWatered) / 1000;

        // Jika tidak disiram 3 menit (180 detik)
        if (timeSinceWater > 180 && !this.isDry) {
            this.makeDry();
        }

        // Jika sudah kering lebih dari 5 detik, hapus
        if (this.isDry && timeSinceWater > 305) {
            this.die();
        }
    }

    makeDry() {
        this.isDry = true;
        this.stemMat.color.set(0x8b4513); // Coklat kering
        this.petalMat.color.set(0x555522); // Kuning layu
    }

    die() {
        this.scene.remove(this.group);
        this.alive = false;
    }
}
