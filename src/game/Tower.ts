import * as THREE from 'three';
import { MaterialFactory } from '../graphics/Materials';
import { Disk } from './Disk';

export class Tower {
    public group: THREE.Group;
    public pole: THREE.Mesh;
    public base: THREE.Mesh;
    public disks: Disk[] = [];
    public index: number;

    private static readonly TOWER_SPACING = 5;
    private static readonly POLE_RADIUS = 0.15;
    private static readonly POLE_HEIGHT = 5;
    private static readonly BASE_WIDTH = 3.5;
    private static readonly BASE_HEIGHT = 0.3;
    private static readonly BASE_DEPTH = 2;

    constructor(index: number) {
        this.index = index;
        this.group = new THREE.Group();

        const materials = MaterialFactory.getInstance();

        // Create pole
        const poleGeometry = new THREE.CylinderGeometry(
            Tower.POLE_RADIUS,
            Tower.POLE_RADIUS * 1.2,
            Tower.POLE_HEIGHT,
            24
        );
        this.pole = new THREE.Mesh(poleGeometry, materials.towerMaterial.clone());
        this.pole.position.y = Tower.POLE_HEIGHT / 2 + Tower.BASE_HEIGHT;
        this.pole.castShadow = true;
        this.pole.receiveShadow = true;

        // Pole top cap (decorative sphere)
        const topCapGeometry = new THREE.SphereGeometry(Tower.POLE_RADIUS * 1.5, 16, 16);
        const topCap = new THREE.Mesh(topCapGeometry, materials.towerMaterial.clone());
        topCap.position.y = Tower.POLE_HEIGHT + Tower.BASE_HEIGHT;
        topCap.castShadow = true;

        // Create base with rounded edges
        const baseShape = new THREE.Shape();
        const bw = Tower.BASE_WIDTH / 2;
        const bd = Tower.BASE_DEPTH / 2;
        const br = 0.2; // Corner radius

        baseShape.moveTo(-bw + br, -bd);
        baseShape.lineTo(bw - br, -bd);
        baseShape.quadraticCurveTo(bw, -bd, bw, -bd + br);
        baseShape.lineTo(bw, bd - br);
        baseShape.quadraticCurveTo(bw, bd, bw - br, bd);
        baseShape.lineTo(-bw + br, bd);
        baseShape.quadraticCurveTo(-bw, bd, -bw, bd - br);
        baseShape.lineTo(-bw, -bd + br);
        baseShape.quadraticCurveTo(-bw, -bd, -bw + br, -bd);

        const extrudeSettings = {
            depth: Tower.BASE_HEIGHT,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 3
        };

        const baseGeometry = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
        baseGeometry.rotateX(-Math.PI / 2);

        this.base = new THREE.Mesh(baseGeometry, materials.baseMaterial.clone());
        this.base.position.y = Tower.BASE_HEIGHT / 2;
        this.base.castShadow = true;
        this.base.receiveShadow = true;

        // Position group based on tower index
        const xOffset = (index - 1) * Tower.TOWER_SPACING;
        this.group.position.x = xOffset;

        // Add to group
        this.group.add(this.pole);
        this.group.add(topCap);
        this.group.add(this.base);

        // Store reference for raycasting
        (this.base as any).towerRef = this;
        (this.pole as any).towerRef = this;
    }

    public addDisk(disk: Disk, animate: boolean = true): void {
        this.disks.push(disk);

        const y = this.getNextDiskY();
        const targetPosition = new THREE.Vector3(
            this.group.position.x,
            y,
            0
        );

        if (animate) {
            disk.animateTo(targetPosition, this.index);
        } else {
            disk.setPosition(targetPosition.x, targetPosition.y, targetPosition.z);
            disk.currentTower = this.index;
        }
    }

    public removeDisk(): Disk | undefined {
        return this.disks.pop();
    }

    public getTopDisk(): Disk | undefined {
        return this.disks[this.disks.length - 1];
    }

    public getNextDiskY(): number {
        const baseY = Tower.BASE_HEIGHT + 0.18; // Slightly above base
        const diskHeight = 0.35;
        return baseY + this.disks.length * diskHeight;
    }

    public canPlaceDisk(disk: Disk): boolean {
        if (this.disks.length === 0) return true;
        const topDisk = this.getTopDisk();
        return topDisk ? disk.size < topDisk.size : true;
    }

    public getWorldPosition(): THREE.Vector3 {
        return this.group.position.clone();
    }

    public dispose(): void {
        this.pole.geometry.dispose();
        (this.pole.material as THREE.Material).dispose();
        this.base.geometry.dispose();
        (this.base.material as THREE.Material).dispose();

        this.disks.forEach(disk => disk.dispose());
    }
}
