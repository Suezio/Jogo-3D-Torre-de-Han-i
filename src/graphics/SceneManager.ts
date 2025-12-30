import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class SceneManager {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public controls: OrbitControls;
    public composer: EffectComposer;

    private animationId: number = 0;
    private clock: THREE.Clock;

    constructor(canvas: HTMLCanvasElement) {
        this.clock = new THREE.Clock();

        // Scene setup
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 8, 14);

        // Renderer with high quality settings
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 25;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.target.set(0, 2, 0);

        // Post-processing
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.3, // intensity
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(bloomPass);

        // Setup scene
        this.setupLighting();
        this.setupEnvironment();

        // Handle resize
        window.addEventListener('resize', this.onResize.bind(this));
    }

    private setupLighting(): void {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
        this.scene.add(ambientLight);

        // Main directional light (sun-like)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        mainLight.shadow.bias = -0.0001;
        mainLight.shadow.radius = 4;
        this.scene.add(mainLight);

        // Warm fill light
        const fillLight = new THREE.DirectionalLight(0xffd4a6, 0.5);
        fillLight.position.set(-10, 10, -5);
        this.scene.add(fillLight);

        // Cool rim light
        const rimLight = new THREE.DirectionalLight(0x4fc3f7, 0.3);
        rimLight.position.set(0, 5, -15);
        this.scene.add(rimLight);

        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0xffd700, 0.5, 20);
        pointLight1.position.set(-8, 3, 0);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x00d4ff, 0.5, 20);
        pointLight2.position.set(8, 3, 0);
        this.scene.add(pointLight2);
    }

    private setupEnvironment(): void {
        // Ground plane with reflective material
        const groundGeometry = new THREE.CircleGeometry(20, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.3,
            roughness: 0.7,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid helper for sci-fi look
        const gridHelper = new THREE.GridHelper(40, 40, 0x2a2a4a, 0x1a1a3a);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);

        // Fog for depth
        this.scene.fog = new THREE.Fog(0x0a0a15, 15, 40);

        // Background gradient
        this.scene.background = new THREE.Color(0x0a0a15);

        // Add floating particles
        this.addParticles();
    }

    private addParticles(): void {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const positions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 40;
            positions[i + 1] = Math.random() * 15;
            positions[i + 2] = (Math.random() - 0.5) * 40;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xffd700,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particles);

        // Store for animation
        (this as any).particles = particles;
    }

    private onResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    public startRenderLoop(callback?: () => void): void {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            const delta = this.clock.getDelta();
            const elapsed = this.clock.getElapsedTime();

            // Update controls
            this.controls.update();

            // Animate particles
            const particles = (this as any).particles as THREE.Points;
            if (particles) {
                particles.rotation.y = elapsed * 0.02;
                const positions = particles.geometry.attributes.position.array as Float32Array;
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] += Math.sin(elapsed + i) * 0.001;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }

            // Custom callback
            if (callback) callback();

            // Render with post-processing
            this.composer.render();
        };

        animate();
    }

    public stopRenderLoop(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    public dispose(): void {
        this.stopRenderLoop();
        this.renderer.dispose();
        this.controls.dispose();
    }
}
