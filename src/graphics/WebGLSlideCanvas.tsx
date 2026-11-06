import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Project } from '../data/projects';

interface WebGLSlideCanvasProps {
  projects: Project[];
  currentIndex: number;
  prevIndex: number;
  isTransitioning: boolean;
}

export default function WebGLSlideCanvas({
  projects,
  currentIndex,
  prevIndex,
  isTransitioning,
}: WebGLSlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current = renderer;
    } catch {
      // WebGL not supported, fallback cleanly
      return;
    }

    // Load noise texture
    const textureLoader = new THREE.TextureLoader();
    const noiseTexture = textureLoader.load('/textures/distortion-noise.jpg');
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;

    // Preload project textures
    const textures = projects.map((p) => {
      const tex = textureLoader.load(p.cover);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    });
    texturesRef.current = textures;

    // Custom displacement shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexCurrent;
      uniform sampler2D uTexNext;
      uniform sampler2D uNoise;
      uniform float uProgress;
      uniform vec2 uResolution;
      uniform vec2 uImageRes;
      varying vec2 vUv;

      vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
        float screenAspect = screenRes.x / screenRes.y;
        float imgAspect = imgRes.x / imgRes.y;
        vec2 newUv = uv;
        if (screenAspect > imgAspect) {
          float scale = screenAspect / imgAspect;
          newUv.y = (newUv.y - 0.5) * scale + 0.5;
        } else {
          float scale = imgAspect / screenAspect;
          newUv.x = (newUv.x - 0.5) * scale + 0.5;
        }
        return newUv;
      }

      void main() {
        vec2 uv = getCoverUv(vUv, uResolution, uImageRes);

        // Sample noise
        vec4 noise = texture2D(uNoise, vUv * 1.5 + vec2(uProgress * 0.15, 0.0));
        float distortion = (noise.r - 0.5) * 0.25;

        // Distort UVs based on transition progress
        vec2 uvCurrent = uv + vec2(distortion * uProgress, distortion * uProgress);
        vec2 uvNext = uv - vec2(distortion * (1.0 - uProgress), distortion * (1.0 - uProgress));

        vec4 colorCurrent = texture2D(uTexCurrent, uvCurrent);
        vec4 colorNext = texture2D(uTexNext, uvNext);

        // Film grain / moody vignette tone
        vec4 finalColor = mix(colorCurrent, colorNext, uProgress);
        
        // Deepen shadows and add subtle green-tinted contrast
        finalColor.rgb *= 0.52; // Ambient dark tone to allow typography to breathe
        
        gl_FragColor = finalColor;
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexCurrent: { value: textures[prevIndex] || textures[0] },
        uTexNext: { value: textures[currentIndex] || textures[0] },
        uNoise: { value: noiseTexture },
        uProgress: { value: 1.0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uImageRes: { value: new THREE.Vector2(1920, 1080) },
      },
      depthTest: false,
      depthWrite: false,
    });
    materialRef.current = material;

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let animationFrameId: number;
    const render = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      quad.geometry.dispose();
      material.dispose();
      textures.forEach((t) => t.dispose());
      noiseTexture.dispose();
    };
  }, [projects]);

  // Handle slide transitions
  useEffect(() => {
    const material = materialRef.current;
    const textures = texturesRef.current;
    if (!material || textures.length === 0) return;

    const fromTexture = textures[prevIndex] || textures[0];
    const toTexture = textures[currentIndex] || textures[0];

    material.uniforms.uTexCurrent.value = fromTexture;
    material.uniforms.uTexNext.value = toTexture;
    material.uniforms.uProgress.value = 0.0;

    if (animRef.current) {
      animRef.current.kill();
    }

    animRef.current = gsap.to(material.uniforms.uProgress, {
      value: 1.0,
      duration: 1.25,
      ease: 'power3.inOut',
    });
  }, [currentIndex, prevIndex]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle vignette layer overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-[#0b0b0b]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[#0b0b0b]/40 pointer-events-none" />
    </div>
  );
}
