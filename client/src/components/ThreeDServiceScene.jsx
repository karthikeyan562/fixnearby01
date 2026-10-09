import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export const ThreeDServiceScene = () => {
  const mountRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [use3DCanvas, setUse3DCanvas] = useState(true);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    if (reducedMotion || !use3DCanvas) return;

    const currentMount = mountRef.current;
    if (!currentMount) return;

    let scene, camera, renderer, houseGroup, animationFrameId;

    try {
      scene = new THREE.Scene();
      scene.fog = THREE.FogExp2 ? new THREE.FogExp2(0x0f172a, 0.03) : null;

      const width = currentMount.clientWidth || 600;
      const height = currentMount.clientHeight || 400;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 3, 10);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;

      currentMount.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
      dirLight.position.set(5, 10, 7);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const pointLight = new THREE.PointLight(0xf59e0b, 2, 10);
      pointLight.position.set(0, 1, 2);
      scene.add(pointLight);

      // Create 3D House Group
      houseGroup = new THREE.Group();

      // House Body (Wall)
      const wallGeo = new THREE.BoxGeometry(3, 2.2, 2.5);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.y = 1.1;
      wallGroup(houseGroup, wallMesh);

      // Roof (Pyramid)
      const roofGeo = new THREE.ConeGeometry(2.4, 1.5, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.2 });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = 2.95;
      roofMesh.rotation.y = Math.PI / 4;
      houseGroup.add(roofMesh);

      // Glowing Door
      const doorGeo = new THREE.BoxGeometry(0.7, 1.2, 0.1);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 });
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(0, 0.6, 1.26);
      houseGroup.add(doorMesh);

      // Floating Service Spheres / Tool Models around House
      const serviceCategories = [
        { color: 0xf59e0b, pos: [-2.5, 2.2, 1], label: 'Electrical' },
        { color: 0x06b6d4, pos: [2.5, 1.8, 1.2], label: 'Plumbing' },
        { color: 0x3b82f6, pos: [-2.2, 0.8, -1], label: 'AC Repair' },
        { color: 0x10b981, pos: [2.3, 2.6, -0.8], label: 'Appliances' },
      ];

      const floatingMeshes = [];
      serviceCategories.forEach((cat) => {
        const geo = new THREE.IcosahedronGeometry(0.45, 1);
        const mat = new THREE.MeshStandardMaterial({
          color: cat.color,
          roughness: 0.1,
          metalness: 0.4,
          wireframe: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...cat.pos);
        houseGroup.add(mesh);
        floatingMeshes.push({ mesh, initialY: cat.pos[1], speed: Math.random() * 0.02 + 0.01 });
      });

      // Ground plane grid
      const gridHelper = new THREE.GridHelper(12, 12, 0x3b82f6, 0x334155);
      gridHelper.position.y = 0;
      scene.add(gridHelper);

      scene.add(houseGroup);

      // Mouse interactive tilt
      let mouseX = 0;
      let mouseY = 0;
      const handleMouseMove = (e) => {
        const rect = currentMount.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove);

      let step = 0;
      const animate = () => {
        step += 0.02;
        houseGroup.rotation.y = step * 0.2 + mouseX * 0.3;
        houseGroup.rotation.x = mouseY * 0.1;

        floatingMeshes.forEach((item, idx) => {
          item.mesh.position.y = item.initialY + Math.sin(step + idx) * 0.15;
          item.mesh.rotation.y += 0.02;
        });

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      const handleResize = () => {
        if (!currentMount) return;
        const w = currentMount.clientWidth;
        const h = currentMount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.warn('WebGL 3D Context Init Error:', err);
      setWebGLError(true);
    }
  }, [reducedMotion, use3DCanvas]);

  function wallGroup(parent, mesh) {
    parent.add(mesh);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', overflow: 'hidden', borderRadius: '24px' }}>
      {/* 3D Motion Toggle Button */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 20,
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setReducedMotion(!reducedMotion)}
          className="btn btn-secondary btn-sm"
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            color: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.78rem',
          }}
          title={reducedMotion ? 'Enable 3D Interactive Scene' : 'Enable Reduced Motion'}
        >
          {reducedMotion ? <EyeOff size={14} color="#f59e0b" /> : <Eye size={14} color="#10b981" />}
          <span>{reducedMotion ? 'Reduced Motion' : '3D Active'}</span>
        </button>
      </div>

      {/* Render 3D Canvas or 3D CSS Fallback */}
      {!reducedMotion && use3DCanvas && !webGLError ? (
        <div ref={mountRef} style={{ width: '100%', height: '100%', background: 'transparent' }} />
      ) : (
        /* CSS 3D Glassmorphism Fallback Scene */
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '24px',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                margin: '0 auto 1rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 30px rgba(37, 99, 235, 0.4)',
                transform: 'rotate(6deg)',
              }}
            >
              <Sparkles size={44} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
              3D Smart Home Service Hub
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              Verified Electricians, Plumbers, AC Technicians & Appliance Experts ready in your neighborhood.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
