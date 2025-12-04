import React, { Suspense, ReactNode, useLayoutEffect, useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Center, Html, Decal } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { Loader2, RotateCw } from 'lucide-react';

// ... (вспомогательные компоненты ErrorBoundary, LoadingPlaceholder и т.д. остаются без изменений)

interface Grill3DProps {
  url?: string | null;
  isMobile?: boolean;
  enableControls?: boolean;
  isVisible?: boolean;
  textureUrl?: string | null;
  engravingType?: 'none' | 'standard' | 'custom';
  color?: 'black' | 'stainless';
  onLoad?: () => void;
}

const OBJGrill: React.FC<{ url: string; isMobile: boolean; engravingType: 'none' | 'standard' | 'custom'; textureUrl: string | null; color: 'black' | 'stainless'; onLoad?: () => void }> = ({ url, isMobile, engravingType, textureUrl, color, onLoad }) => {
  const obj = useLoader(OBJLoader, url);
  const activeTextureUrl = engravingType === 'custom' ? (textureUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=") : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const texture = useLoader(THREE.TextureLoader, activeTextureUrl);
  const scene = useMemo(() => obj.clone(), [obj]);
  const [modelDims, setModelDims] = useState<{ width: number, height: number, depth: number } | null>(null);
  const modelScale = isMobile ? 0.3 : 0.4;

  useEffect(() => {
      if (onLoad) onLoad();
  }, [onLoad]);

  useLayoutEffect(() => {
    const isBlack = color === 'black';
    const material = new THREE.MeshStandardMaterial({
        color: isBlack ? new THREE.Color('#202020') : new THREE.Color('#e5e7eb'),
        roughness: isBlack ? 0.4 : 0.2, 
        metalness: isBlack ? 0.4 : 0.9, 
        envMapIntensity: isBlack ? 1.5 : 1.0, 
        side: THREE.DoubleSide
    });
    scene.traverse((child: any) => {
      if (child.isMesh) child.material = material;
    });
  }, [scene, color]);

  // ... (логика decalConfig и рендер <group> остаются без изменений)
  const decalConfig = useMemo(() => {
    if (!modelDims) return null;
    const { width, height, depth } = modelDims;
    const isFrontBackWide = width >= depth;
    const faceW = isFrontBackWide ? width : depth;
    const faceH = height;
    const size = Math.min(faceW, faceH) * 0.7;
    return { isFrontBackWide, size, zOffset: (depth / 2) * 0.95, xOffset: (width / 2) * 0.95 };
  }, [modelDims]);

  const showDecal = engravingType !== 'none' && engravingType !== 'standard';

  return (
    <group>
        <Center onCentered={({ width, height, depth }) => setModelDims({ width, height, depth })}>
            <primitive object={scene} scale={modelScale} />
        </Center>
        {modelDims && decalConfig && showDecal && (
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[modelDims.width, modelDims.height, modelDims.depth]} />
                <meshBasicMaterial visible={false} /> 
                {texture && (
                    <>
                    {decalConfig.isFrontBackWide ? (
                        <>
                            <Decal position={[0, 0, decalConfig.zOffset]} rotation={[0, 0, 0]} scale={[decalConfig.size, decalConfig.size, 1]}><meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} /></Decal>
                            <Decal position={[0, 0, -decalConfig.zOffset]} rotation={[0, Math.PI, 0]} scale={[decalConfig.size, decalConfig.size, 1]}><meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} /></Decal>
                        </>
                    ) : (
                        <>
                            <Decal position={[decalConfig.xOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[decalConfig.size, decalConfig.size, 1]}><meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} /></Decal>
                            <Decal position={[-decalConfig.xOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[decalConfig.size, decalConfig.size, 1]}><meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} /></Decal>
                        </>
                    )}
                    </>
                )}
            </mesh>
        )}
    </group>
  );
};


// --- НАЧАЛО ИЗМЕНЕНИЙ: Упрощенный рендер компонента ---
const Grill3D: React.FC<Grill3DProps> = ({ url, isMobile = false, enableControls = true, isVisible = true, textureUrl = null, engravingType = 'none', color = 'stainless', onLoad }) => {

  // Если URL нет, ничего не рендерим. Загрузка начнется только когда App передаст URL.
  if (!url) return null;

  return (
    <div className="w-full h-full bg-transparent" style={{ touchAction: 'pan-y' }}>
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 45, position: [10, 10, 10] }}>
        <Stage intensity={0.6} adjustCamera={false} shadows={false}>
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
              <OBJGrill url={url} isMobile={isMobile} engravingType={engravingType} textureUrl={textureUrl} color={color} onLoad={onLoad} />
          </Float>
        </Stage>
        <OrbitControls 
          makeDefault 
          autoRotate={!enableControls}
          autoRotateSpeed={0.5}
          enableZoom={false} 
          enablePan={false}
          enableRotate={enableControls}
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 1.8} 
        />
      </Canvas>
    </div>
  );
};
// --- КОНЕЦ ИЗМЕНЕНИЙ ---

export default Grill3D;