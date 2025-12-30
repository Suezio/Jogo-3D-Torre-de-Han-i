import * as THREE from 'three';
import { gsap } from 'gsap';
import { MaterialFactory } from '../graphics/Materials';

export class Disk {
    public mesh: THREE.Mesh;
    public size: number; // 1 = smallest, n = largest
    public currentTower: number;

    private normalMaterial: THREE.MeshStandardMaterial;
    private highlightedMaterial: THREE.MeshStandardMaterial;
    private isHighlighted: boolean = false;
    private isAnimating: boolean = false;

    constructor(size: number, totalDisks: number) {
        this.size = size;
        this.currentTower = 0; // Start on left tower

        const materials = MaterialFactory.getInstance();

        // Disk dimensions based on size
        const baseRadius = 0.5;
        const maxRadius = 1.8;
        const radiusRange = maxRadius - baseRadius;
        const radius = baseRadius + (radiusRange * (size / totalDisks));

        const height = 0.35;
        const bevelRadius = 0.08;

        // Create beveled cylinder geometry using lathe
        const points: THREE.Vector2[] = [];
        const segments = 12;

        // Bottom outer bevel
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(radius - bevelRadius, 0));

        // Outer bevel curve
        for (let i = 0; i <= segments; i++) {
            const angle = (Math.PI / 2) * (i / segments);
            const x = radius - bevelRadius + Math.sin(angle) * bevelRadius;
            const y = bevelRadius - Math.cos(angle) * bevelRadius;
            points.push(new THREE.Vector2(x, y));
        }

        // Side
        points.push(new THREE.Vector2(radius, height - bevelRadius));

        // Top outer bevel
        for (let i = 0; i <= segments; i++) {
            const angle = (Math.PI / 2) * (i / segments);
            const x = radius - bevelRadius + Math.cos(angle) * bevelRadius;
            const y = height - bevelRadius + Math.sin(angle) * bevelRadius;
            points.push(new THREE.Vector2(x, y));
        }

        // Top surface
        points.push(new THREE.Vector2(0.25, height));

        // Inner hole
        points.push(new THREE.Vector2(0.25, 0));

        const geometry = new THREE.LatheGeometry(points, 48);
        geometry.computeVertexNormals();

        // Materials
        this.normalMaterial = materials.getDiskMaterial(size - 1);
        this.highlightedMaterial = materials.getHighlightedDiskMaterial(size - 1);

        // Create mesh
        this.mesh = new THREE.Mesh(geometry, this.normalMaterial);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Store reference to this disk on the mesh for raycasting
        (this.mesh as any).diskRef = this;
    }

    public setHighlighted(highlighted: boolean): void {
        if (this.isHighlighted === highlighted) return;

        this.isHighlighted = highlighted;
        this.mesh.material = highlighted ? this.highlightedMaterial : this.normalMaterial;

        // Scale animation
        gsap.to(this.mesh.scale, {
            x: highlighted ? 1.05 : 1,
            y: highlighted ? 1.1 : 1,
            z: highlighted ? 1.05 : 1,
            duration: 0.2,
            ease: 'power2.out'
        });

        // Lift animation
        if (highlighted) {
            gsap.to(this.mesh.position, {
                y: this.mesh.position.y + 0.3,
                duration: 0.2,
                ease: 'power2.out'
            });
        }
    }

    public async animateTo(targetPosition: THREE.Vector3, towerIndex: number): Promise<void> {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const currentY = this.mesh.position.y;
        const liftHeight = 6; // Height to lift the disk

        // Create smooth path animation
        const timeline = gsap.timeline();

        // 1. Lift up
        timeline.to(this.mesh.position, {
            y: liftHeight,
            duration: 0.3,
            ease: 'power2.out'
        });

        // 2. Move horizontally
        timeline.to(this.mesh.position, {
            x: targetPosition.x,
            z: targetPosition.z,
            duration: 0.4,
            ease: 'power2.inOut'
        });

        // 3. Drop down
        timeline.to(this.mesh.position, {
            y: targetPosition.y,
            duration: 0.3,
            ease: 'bounce.out'
        });

        // Reset highlight when animation completes
        timeline.call(() => {
            this.setHighlighted(false);
            this.currentTower = towerIndex;
            this.isAnimating = false;
        });

        // Wait for animation to complete
        return new Promise(resolve => {
            timeline.eventCallback('onComplete', resolve);
        });
    }

    public setPosition(x: number, y: number, z: number): void {
        this.mesh.position.set(x, y, z);
    }

    public getIsAnimating(): boolean {
        return this.isAnimating;
    }

    public dispose(): void {
        this.mesh.geometry.dispose();
        this.normalMaterial.dispose();
        this.highlightedMaterial.dispose();
    }
}
