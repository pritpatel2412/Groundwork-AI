import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeMeshCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.id = 'meshGL';
    renderer.domElement.className = 'w-full h-full block pointer-events-none';
    container.appendChild(renderer.domElement);

    // 2. Main Parent Group for positioning & smooth mouse tracking
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Dynamic responsive placement (Desktop right-aligned x=4.2, Mobile centered)
    const updatePosition = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        mainGroup.position.set(3.8, 0.2, 0);
        mainGroup.scale.set(1.05, 1.05, 1.05);
      } else {
        mainGroup.position.set(0, -0.6, 0);
        mainGroup.scale.set(0.72, 0.72, 0.72);
      }
    };
    updatePosition();

    // 3. LAYER A: Translucent Refractive Outer Crystal (Icosahedron with optical glass material)
    const outerGeo = new THREE.IcosahedronGeometry(2.7, 0);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88, // Optical glass transmission
      opacity: 1,
      transparent: true,
      roughness: 0.12,
      metalness: 0.1,
      ior: 1.52, // Glass refraction
      thickness: 2.2,
      attenuationColor: new THREE.Color(0xF05A3C), // Warm coral absorption
      attenuationDistance: 1.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      flatShading: true,
    });
    const outerCrystal = new THREE.Mesh(outerGeo, outerMat);
    mainGroup.add(outerCrystal);

    // 4. LAYER B: Geometric Golden/Coral Edge Wireframe Lattice
    const wireGeo = new THREE.IcosahedronGeometry(2.72, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xF05A3C,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    mainGroup.add(wireframe);

    // 5. LAYER C: Glowing Incandescent Inner Neural Core (Octahedron with intense emissive coral)
    const innerGeo = new THREE.OctahedronGeometry(1.35, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xE34A32,
      emissive: 0xFF3B1E,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.8,
      flatShading: true,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerCore);

    // 6. LAYER D: Dual Gyroscopic Orbital Rings with metallic sheen
    // Ring 1 (Coral Accent)
    const ring1Geo = new THREE.TorusGeometry(3.6, 0.022, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xE34A32,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xE34A32,
      emissiveIntensity: 0.25,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    mainGroup.add(ring1);

    // Ring 2 (Obsidian Titanium Accent)
    const ring2Geo = new THREE.TorusGeometry(4.1, 0.016, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x2E3034,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    mainGroup.add(ring2);

    // 7. LAYER E: Floating Quantum Particle Constellation (70 floating stars/synapses)
    const particleCount = 70;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleScales[i] = Math.random() * 0.8 + 0.3;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

    const particlesMat = new THREE.PointsMaterial({
      color: 0xF05A3C,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    mainGroup.add(particles);

    // 8. Studio Lighting with Rim Glints
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Warm Key Light (Top-Front Right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(6, 8, 8);
    scene.add(keyLight);

    // Coral Rim Light (Back-Left)
    const rimLight = new THREE.DirectionalLight(0xE34A32, 2.8);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // Dynamic Specular Light (Tracks cursor)
    const cursorLight = new THREE.PointLight(0xFF6B4A, 3.0, 18);
    cursorLight.position.set(4, 2, 6);
    scene.add(cursorLight);

    // 9. Interactive Mouse Tracking with Damping
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const xNorm = (e.clientX / window.innerWidth) * 2 - 1;
      const yNorm = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.targetX = xNorm * 0.4;
      mouse.targetY = yNorm * 0.4;
      cursorLight.position.x = mainGroup.position.x + xNorm * 3;
      cursorLight.position.y = mainGroup.position.y + yNorm * 3;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 10. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Floating oscillation: Math.sin(t * 1.2) * 0.3
      const floatY = Math.sin(t * 1.2) * 0.28;
      const isDesktop = window.innerWidth >= 1024;
      mainGroup.position.y = (isDesktop ? 0.2 : -0.6) + floatY;

      // Compound rotation
      outerCrystal.rotation.x = t * 0.2 + mouse.y * 0.5;
      outerCrystal.rotation.y = t * 0.28 + mouse.x * 0.5;

      wireframe.rotation.x = outerCrystal.rotation.x;
      wireframe.rotation.y = outerCrystal.rotation.y;

      // Inner core rotates in opposite direction for mesmerizing internal kinetic feel
      innerCore.rotation.x = -t * 0.35;
      innerCore.rotation.y = -t * 0.45;
      innerCore.rotation.z = Math.sin(t * 0.8) * 0.2;

      // Orbital rings rotate on distinct axes
      ring1.rotation.z = t * 0.35;
      ring2.rotation.y = -t * 0.28;
      ring2.rotation.x = Math.sin(t * 0.5) * 0.3 - Math.PI / 4;

      // Particle swarm slow precession
      particles.rotation.y = t * 0.08;
      particles.rotation.x = Math.sin(t * 0.1) * 0.1;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // 11. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updatePosition();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
