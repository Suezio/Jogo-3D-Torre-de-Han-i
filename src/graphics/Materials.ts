import * as THREE from 'three';

export interface DiskColors {
    base: number;
    emissive: number;
}

// Vibrant color palette for disks
export const DISK_COLORS: DiskColors[] = [
    { base: 0xff4757, emissive: 0xff2f3d }, // Red
    { base: 0xff6b35, emissive: 0xff5722 }, // Orange
    { base: 0xffd700, emissive: 0xffc107 }, // Gold
    { base: 0x2ed573, emissive: 0x26de81 }, // Green
    { base: 0x00d4ff, emissive: 0x00bcd4 }, // Cyan
    { base: 0x5352ed, emissive: 0x7c4dff }, // Blue
    { base: 0xa55eea, emissive: 0x9c27b0 }, // Purple
    { base: 0xff6b9d, emissive: 0xe91e63 }, // Pink
];

export class MaterialFactory {
    private static instance: MaterialFactory;

    private diskMaterials: Map<number, THREE.MeshStandardMaterial> = new Map();
    private highlightedMaterials: Map<number, THREE.MeshStandardMaterial> = new Map();

    public towerMaterial!: THREE.MeshStandardMaterial;
    public baseMaterial!: THREE.MeshStandardMaterial;

    private constructor() {
        this.createTowerMaterials();
        this.createDiskMaterials();
    }

    public static getInstance(): MaterialFactory {
        if (!MaterialFactory.instance) {
            MaterialFactory.instance = new MaterialFactory();
        }
        return MaterialFactory.instance;
    }

    private createTowerMaterials(): void {
        // Tower pole material - brushed metal look
        this.towerMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b8b8b,
            metalness: 0.9,
            roughness: 0.3,
            envMapIntensity: 1.5,
        });

        // Base material - dark premium finish
        this.baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d2d3a,
            metalness: 0.7,
            roughness: 0.4,
            envMapIntensity: 1.0,
        });
    }

    private createDiskMaterials(): void {
        DISK_COLORS.forEach((color, index) => {
            // Normal state
            const material = new THREE.MeshStandardMaterial({
                color: color.base,
                metalness: 0.4,
                roughness: 0.3,
                emissive: color.emissive,
                emissiveIntensity: 0.1,
                envMapIntensity: 1.2,
            });
            this.diskMaterials.set(index, material);

            // Highlighted state (when selected)
            const highlightedMaterial = new THREE.MeshStandardMaterial({
                color: color.base,
                metalness: 0.3,
                roughness: 0.2,
                emissive: color.emissive,
                emissiveIntensity: 0.5, // Stronger glow
                envMapIntensity: 1.5,
            });
            this.highlightedMaterials.set(index, highlightedMaterial);
        });
    }

    public getDiskMaterial(diskIndex: number): THREE.MeshStandardMaterial {
        const colorIndex = diskIndex % DISK_COLORS.length;
        return this.diskMaterials.get(colorIndex)!.clone();
    }

    public getHighlightedDiskMaterial(diskIndex: number): THREE.MeshStandardMaterial {
        const colorIndex = diskIndex % DISK_COLORS.length;
        return this.highlightedMaterials.get(colorIndex)!.clone();
    }

    public getDiskColor(diskIndex: number): DiskColors {
        return DISK_COLORS[diskIndex % DISK_COLORS.length];
    }
}
