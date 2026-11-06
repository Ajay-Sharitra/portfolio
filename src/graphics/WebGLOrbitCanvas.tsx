import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Project } from '../data/projects';

interface WebGLOrbitCanvasProps {
  projects: Project[];
  currentIndex: number;
  onSelectProject: (index: number) => void;
  onOpenProject: (project: Project) => void;
  onHoverCard?: (hovering: boolean) => void;
}

export default function WebGLOrbitCanvas({
  projects,
  currentIndex,
  onSelectProject,
  onOpenProject,
  onHoverCard,
}: WebGLOrbitCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cardMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b0b, 0.045);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xcee49f, 2.5);
    dirLight.position.set(5, 8, 10);
    scene.add(dirLight);

    const greenPoint = new THREE.PointLight(0xcee49f, 3, 20);
    greenPoint.position.set(0, -2, 6);
    scene.add(greenPoint);

    // 3. Orbit Group
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const textureLoader = new THREE.TextureLoader();
    const cardGeometry = new THREE.PlaneGeometry(5.2, 3.2, 16, 16);
    const cardMeshes: THREE.Mesh[] = [];

    const radius = 7.5;
    const count = projects.length;

    projects.forEach((proj, i) => {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - 2;

      const texture = textureLoader.load(proj.cover);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(cardGeometry, material);
      mesh.position.set(x, 0, z);
      // Face towards center
      mesh.rotation.y = angle + Math.PI;

      // Custom attributes for raycasting
      mesh.userData = { index: i, project: proj };
      orbitGroup.add(mesh);
      cardMeshes.push(mesh);

      // Add a subtle frame around the card
      const edgeGeo = new THREE.EdgesGeometry(cardGeometry);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xcee49f,
        transparent: true,
        opacity: 0.35,
      });
      const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
      wireframe.raycast = () => {};
      mesh.add(wireframe);
    });
    cardMeshesRef.current = cardMeshes;

    // Helper to find parent card mesh from any child hit
    const getCardMeshFromHit = (hitObject: THREE.Object3D): THREE.Mesh | null => {
      let curr: THREE.Object3D | null = hitObject;
      while (curr) {
        if (curr.userData && curr.userData.project) {
          return curr as THREE.Mesh;
        }
        curr = curr.parent;
      }
      return null;
    };

    // Helper to safely highlight/unhighlight card
    const setHighlight = (mesh: THREE.Mesh | null, active: boolean) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat && 'emissive' in mat && mat.emissive && typeof mat.emissive.setHex === 'function') {
        mat.emissive.setHex(active ? 0x223311 : 0x000000);
      }
      mesh.scale.set(active ? 1.06 : 1, active ? 1.06 : 1, active ? 1.06 : 1);
    };

    // Set initial rotation so current project faces camera
    const initialAngle = -(currentIndex / count) * Math.PI * 2;
    orbitGroup.rotation.y = initialAngle;

    // 4. Mouse interaction & Inertia
    let targetRotationY = initialAngle;
    let targetTiltX = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredMesh: THREE.Mesh | null = null;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotationY += deltaX * 0.006;
        targetTiltX = Math.max(-0.4, Math.min(0.4, targetTiltX + deltaY * 0.002));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Subtle tilt with mouse
        targetTiltX = -mouse.y * 0.15;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      if (Math.abs(e.clientX - prevMouseX) > 10) return; // Ignore drag clicks
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes, true);
      if (intersects.length > 0) {
        const hit = getCardMeshFromHit(intersects[0].object);
        if (hit && hit.userData?.project) {
          const { index, project } = hit.userData;
          onSelectProject(index);
          onOpenProject(project);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('click', onClick);

    // 5. Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      // Smooth interpolation for orbit rotation
      orbitGroup.rotation.y += (targetRotationY - orbitGroup.rotation.y) * 0.08;
      orbitGroup.rotation.x += (targetTiltX - orbitGroup.rotation.x) * 0.08;

      // Floating wave motion
      const time = clock.getElapsedTime();
      cardMeshes.forEach((mesh, idx) => {
        mesh.position.y = Math.sin(time * 1.5 + idx * 1.2) * 0.18;
      });

      // Raycasting for hover state
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes, true);

      if (intersects.length > 0) {
        const hit = getCardMeshFromHit(intersects[0].object);
        if (hit && hoveredMesh !== hit) {
          if (hoveredMesh) {
            setHighlight(hoveredMesh, false);
          }
          hoveredMesh = hit;
          setHighlight(hit, true);
          onHoverCard?.(true);
        }
      } else if (hoveredMesh) {
        setHighlight(hoveredMesh, false);
        hoveredMesh = null;
        onHoverCard?.(false);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    // 6. Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);

      cardMeshes.forEach((m) => {
        (m.material as THREE.Material).dispose();
        m.geometry.dispose();
      });
      cardGeometry.dispose();
      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [projects, currentIndex, onSelectProject, onOpenProject, onHoverCard]);

  return (
    <div className="fixed inset-0 z-10 select-none cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />
      {/* Orbit UI Instructions */}
      <div className="blend mono absolute top-[calc(70*var(--px))] left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-60">
        DRAG TO ROTATE 3D ORBIT · CLICK TO EXPLORE PROJECT
      </div>
    </div>
  );
}
