import * as THREE from 'three';
import { SceneManager } from '../graphics/SceneManager';
import { Tower } from './Tower';
import { Disk } from './Disk';
import { RecordsManager } from '../utils/RecordsManager';
import type { RecordEntry } from '../utils/RecordsManager';

export class Game {
    private sceneManager!: SceneManager;
    private towers: Tower[] = [];
    private disks: Disk[] = [];
    private recordsManager: RecordsManager;

    private selectedDisk: Disk | null = null;
    private isPlaying: boolean = false;
    private diskCount: number = 4;
    private moveCount: number = 0;
    private startTime: number = 0;
    private timerInterval: number = 0;
    private playerName: string = '';

    // Raycasting
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    // UI Elements
    private mainMenu!: HTMLElement;
    private victoryPanel!: HTMLElement;
    private recordsPanel!: HTMLElement;
    private gameHeader!: HTMLElement;
    private instructions!: HTMLElement;
    private movesCounter!: HTMLElement;
    private timerDisplay!: HTMLElement;
    private minMovesDisplay!: HTMLElement;

    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.recordsManager = new RecordsManager();
    }

    public init(): void {
        // Get canvas
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Initialize scene
        this.sceneManager = new SceneManager(canvas);

        // Cache UI elements
        this.cacheUIElements();

        // Setup event listeners
        this.setupEventListeners();

        // Start render loop
        this.sceneManager.startRenderLoop();

        // Show main menu
        this.showMainMenu();
    }

    private cacheUIElements(): void {
        this.mainMenu = document.getElementById('main-menu')!;
        this.victoryPanel = document.getElementById('victory-panel')!;
        this.recordsPanel = document.getElementById('records-panel')!;
        this.gameHeader = document.getElementById('game-header')!;
        this.instructions = document.getElementById('instructions')!;
        this.movesCounter = document.getElementById('moves-counter')!;
        this.timerDisplay = document.getElementById('timer')!;
        this.minMovesDisplay = document.getElementById('min-moves')!;
    }

    private setupEventListeners(): void {
        // Disk selector buttons
        document.querySelectorAll('.disk-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.disk-btn').forEach(b => b.classList.remove('selected'));
                (e.target as HTMLElement).classList.add('selected');
                this.diskCount = parseInt((e.target as HTMLElement).dataset.disks || '4');
            });
        });

        // Start button
        document.getElementById('start-btn')?.addEventListener('click', () => {
            const nameInput = document.getElementById('player-name') as HTMLInputElement;
            this.playerName = nameInput?.value || 'Jogador';
            this.startGame();
        });

        // Records button
        document.getElementById('records-btn')?.addEventListener('click', () => {
            this.showRecordsPanel();
        });

        // Close records button
        document.getElementById('close-records-btn')?.addEventListener('click', () => {
            this.hideRecordsPanel();
        });

        // Records tabs
        document.querySelectorAll('.records-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.records-tab').forEach(t => t.classList.remove('active'));
                (e.target as HTMLElement).classList.add('active');
                const disks = parseInt((e.target as HTMLElement).dataset.disks || '3');
                this.displayRecords(disks);
            });
        });

        // Play again button
        document.getElementById('play-again-btn')?.addEventListener('click', () => {
            this.startGame();
        });

        // Menu button
        document.getElementById('menu-btn')?.addEventListener('click', () => {
            this.showMainMenu();
        });

        // Mouse/touch events for game interaction
        const canvas = this.sceneManager.renderer.domElement;
        canvas.addEventListener('click', this.onCanvasClick.bind(this));
        canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    private onCanvasClick(event: MouseEvent): void {
        if (!this.isPlaying) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.handleInteraction();
    }

    private onTouchEnd(event: TouchEvent): void {
        if (!this.isPlaying) return;

        const touch = event.changedTouches[0];
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        this.handleInteraction();
    }

    private handleInteraction(): void {
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        // Get all meshes for raycasting
        const meshes: THREE.Object3D[] = [];
        this.towers.forEach(tower => {
            meshes.push(tower.base, tower.pole);
            tower.disks.forEach(disk => meshes.push(disk.mesh));
        });

        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            const hit = intersects[0].object as THREE.Mesh;

            // Check if clicked on a disk
            if ((hit as any).diskRef) {
                this.handleDiskClick((hit as any).diskRef as Disk);
                return;
            }

            // Check if clicked on a tower
            if ((hit as any).towerRef) {
                this.handleTowerClick((hit as any).towerRef as Tower);
                return;
            }

            // Check parent for tower reference (in case of hitting pole geometry)
            if (hit.parent) {
                const parent = this.findTowerFromObject(hit);
                if (parent) {
                    this.handleTowerClick(parent);
                }
            }
        }
    }

    private findTowerFromObject(obj: THREE.Object3D): Tower | null {
        for (const tower of this.towers) {
            if (tower.group === obj.parent || tower.pole === obj || tower.base === obj) {
                return tower;
            }
        }
        return null;
    }

    private handleDiskClick(disk: Disk): void {
        // Can only select the top disk of a tower
        const tower = this.towers[disk.currentTower];
        const topDisk = tower.getTopDisk();

        if (topDisk !== disk) {
            // Not the top disk, can't select
            return;
        }

        if (disk.getIsAnimating()) return;

        if (this.selectedDisk === disk) {
            // Deselect
            disk.setHighlighted(false);
            this.selectedDisk = null;
        } else {
            // Select new disk
            if (this.selectedDisk) {
                this.selectedDisk.setHighlighted(false);
            }
            disk.setHighlighted(true);
            this.selectedDisk = disk;
        }
    }

    private handleTowerClick(tower: Tower): void {
        if (!this.selectedDisk) {
            // No disk selected, try to select top disk of this tower
            const topDisk = tower.getTopDisk();
            if (topDisk && !topDisk.getIsAnimating()) {
                topDisk.setHighlighted(true);
                this.selectedDisk = topDisk;
            }
            return;
        }

        // Try to move selected disk to this tower
        if (this.selectedDisk.currentTower === tower.index) {
            // Same tower, deselect
            this.selectedDisk.setHighlighted(false);
            this.selectedDisk = null;
            return;
        }

        // Check if move is valid
        if (!tower.canPlaceDisk(this.selectedDisk)) {
            // Invalid move - shake animation
            this.shakeCamera();
            return;
        }

        // Valid move!
        this.moveDisk(this.selectedDisk, tower);
    }

    private async moveDisk(disk: Disk, targetTower: Tower): Promise<void> {
        const sourceTower = this.towers[disk.currentTower];

        // Remove from source tower
        sourceTower.removeDisk();

        // Add to target tower
        targetTower.addDisk(disk, true);

        // Increment move counter
        this.moveCount++;
        this.updateMoveCounter();

        // Clear selection
        this.selectedDisk = null;

        // Check for victory
        setTimeout(() => {
            this.checkVictory();
        }, 800);
    }

    private shakeCamera(): void {
        const camera = this.sceneManager.camera;
        const originalX = camera.position.x;

        const shake = [
            { x: originalX + 0.1 },
            { x: originalX - 0.1 },
            { x: originalX + 0.05 },
            { x: originalX - 0.05 },
            { x: originalX }
        ];

        let i = 0;
        const interval = setInterval(() => {
            camera.position.x = shake[i].x;
            i++;
            if (i >= shake.length) clearInterval(interval);
        }, 50);
    }

    private checkVictory(): void {
        // Victory if all disks are on the rightmost tower (index 2)
        const rightTower = this.towers[2];

        if (rightTower.disks.length === this.diskCount) {
            this.victory();
        }
    }

    private victory(): void {
        this.isPlaying = false;
        clearInterval(this.timerInterval);

        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

        // Check if new record
        const isNewRecord = this.recordsManager.addRecord(
            this.diskCount,
            this.playerName,
            this.moveCount,
            elapsedTime
        );

        // Update victory panel
        document.getElementById('final-moves')!.textContent = this.moveCount.toString();
        document.getElementById('final-time')!.textContent = this.formatTime(elapsedTime);

        const newRecordElement = document.getElementById('new-record')!;
        if (isNewRecord) {
            newRecordElement.classList.remove('hidden');
        } else {
            newRecordElement.classList.add('hidden');
        }

        // Show victory panel
        this.hideGameUI();
        this.victoryPanel.classList.remove('hidden');
    }

    private startGame(): void {
        // Reset game state
        this.moveCount = 0;
        this.selectedDisk = null;
        this.isPlaying = true;

        // Clear existing objects
        this.clearGame();

        // Create towers
        this.createTowers();

        // Create disks
        this.createDisks();

        // Hide menus, show game UI
        this.mainMenu.classList.add('hidden');
        this.victoryPanel.classList.add('hidden');
        this.recordsPanel.classList.add('hidden');
        this.showGameUI();

        // Start timer
        this.startTime = Date.now();
        this.startTimer();

        // Update min moves display
        const minMoves = this.recordsManager.getMinMoves(this.diskCount);
        this.minMovesDisplay.textContent = minMoves.toString();
    }

    private createTowers(): void {
        for (let i = 0; i < 3; i++) {
            const tower = new Tower(i);
            this.towers.push(tower);
            this.sceneManager.scene.add(tower.group);
        }
    }

    private createDisks(): void {
        // Create disks from largest to smallest
        for (let i = this.diskCount; i >= 1; i--) {
            const disk = new Disk(i, this.diskCount);
            this.disks.push(disk);
            this.sceneManager.scene.add(disk.mesh);

            // Add to first tower without animation
            this.towers[0].addDisk(disk, false);
        }
    }

    private clearGame(): void {
        // Remove all towers from scene
        this.towers.forEach(tower => {
            this.sceneManager.scene.remove(tower.group);
            tower.dispose();
        });
        this.towers = [];

        // Remove all disks from scene
        this.disks.forEach(disk => {
            this.sceneManager.scene.remove(disk.mesh);
            disk.dispose();
        });
        this.disks = [];
    }

    private showMainMenu(): void {
        this.isPlaying = false;
        clearInterval(this.timerInterval);

        this.clearGame();

        this.mainMenu.classList.remove('hidden');
        this.victoryPanel.classList.add('hidden');
        this.recordsPanel.classList.add('hidden');
        this.hideGameUI();
    }

    private showGameUI(): void {
        this.gameHeader.classList.add('visible');
        this.instructions.classList.remove('hidden');
        this.updateMoveCounter();
    }

    private hideGameUI(): void {
        this.gameHeader.classList.remove('visible');
        this.instructions.classList.add('hidden');
    }

    private showRecordsPanel(): void {
        this.recordsPanel.classList.remove('hidden');
        this.displayRecords(3); // Default to 3 disks

        // Reset tab selection
        document.querySelectorAll('.records-tab').forEach((tab, index) => {
            tab.classList.toggle('active', index === 0);
        });
    }

    private hideRecordsPanel(): void {
        this.recordsPanel.classList.add('hidden');
    }

    private displayRecords(disks: number): void {
        const records = this.recordsManager.getRecords(disks);
        const container = document.getElementById('records-list')!;

        if (records.length === 0) {
            container.innerHTML = '<div class="no-records">Nenhum recorde ainda. Seja o primeiro!</div>';
            return;
        }

        container.innerHTML = records.map((record, index) => `
      <div class="record-item">
        <span class="record-rank">#${index + 1}</span>
        <span class="record-name">${this.escapeHtml(record.name)}</span>
        <div class="record-stats">
          <div class="record-stat">
            <span class="record-stat-value">${record.moves}</span>
            <span class="record-stat-label">MOV</span>
          </div>
          <div class="record-stat">
            <span class="record-stat-value">${this.formatTime(record.time)}</span>
            <span class="record-stat-label">TEMPO</span>
          </div>
        </div>
      </div>
    `).join('');
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private updateMoveCounter(): void {
        this.movesCounter.textContent = this.moveCount.toString();
    }

    private startTimer(): void {
        this.timerInterval = window.setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerDisplay.textContent = this.formatTime(elapsed);
        }, 1000);
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
