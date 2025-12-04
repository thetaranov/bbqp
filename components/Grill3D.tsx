import React, { Suspense, ReactNode, useLayoutEffect, useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Environment, Center, Html, Decal } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { Loader2, RotateCw } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      primitive: any;
      mesh: any;
      boxGeometry: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
    }
  }
}

THREE.Cache.enabled = true;

// Direct Transparent Pixel
const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback: (reset: () => void) => ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Model Loading Error:", error);
  }

  reset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.reset);
    }
    return this.props.children;
  }
}

interface Grill3DProps {
  url?: string | null;
  enableControls?: boolean;
  isVisible?: boolean;
  textureUrl?: string | null;
  engravingType?: 'none' | 'standard' | 'custom';
  color?: 'black' | 'stainless';
  onLoad?: () => void;
}

const CINEMATIC_SHOTS = [
    { name: "Classic ISO", pos: new THREE.Vector3(15, 8, 15), look: new THREE.Vector3(0, 0, 0) },
    { name: "Macro Top", pos: new THREE.Vector3(0, 25, 1), look: new THREE.Vector3(0, 0, 0) },
    { name: "Hero Low", pos: new THREE.Vector3(-12, -2, 12), look: new THREE.Vector3(0, 5, 0) },
    { name: "Side Profile", pos: new THREE.Vector3(25, 2, 0), look: new THREE.Vector3(0, 1, 0) }
];

const CinematicController = ({ controlsRef, enableControls }: { controlsRef: React.RefObject<any>, enableControls: boolean }) => {
    const { camera, gl } = useThree();
    const [shotIndex, setShotIndex] = useState(0);
    const lastInteraction = useRef(Date.now());
    const isIdle = useRef(true);
    const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
      if (!enableControls) return;
        const resetTimer = () => {
            lastInteraction.current = Date.now();
            if (isIdle.current) {
                isIdle.current = false;
                if (controlsRef.current) controlsRef.current.enabled = true;
            }
        };
        const canvasEl = gl.domElement;
        const events = ['pointerdown', 'wheel', 'touchstart'];
        events.forEach(ev => canvasEl.addEventListener(ev, resetTimer));
        return () => events.forEach(ev => canvasEl.removeEventListener(ev, resetTimer));
    }, [gl.domElement, enableControls]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isIdle.current && enableControls) setShotIndex(prev => (prev + 1) % CINEMATIC_SHOTS.length);
        }, 10000); 
        return () => clearInterval(interval);
    }, [enableControls]);

    useFrame((state, delta) => {
        if (!enableControls) {
          if (controlsRef.current) controlsRef.current.update();
          return;
        }

        if (!isIdle.current && Date.now() - lastInteraction.current > 30000) {
            isIdle.current = true;
        }

        if (isIdle.current && controlsRef.current) {
            if (controlsRef.current.enabled) controlsRef.current.enabled = false;
            const targetShot = CINEMATIC_SHOTS[shotIndex];
            const damp = 1 - Math.exp(-0.5 * delta); 
            state.camera.position.lerp(targetShot.pos, damp);
            currentLookAt.current.lerp(targetShot.look, damp);
            state.camera.lookAt(currentLookAt.current);
            controlsRef.current.target.copy(currentLookAt.current);
        } else if (controlsRef.current && !isIdle.current) {
             controlsRef.current.update();
        }
    });
    return null;
};

const CameraLayoutAdjuster = ({ isMobile }: { isMobile: boolean }) => {
    const { camera, size } = useThree();
    useEffect(() => {
        if (!isMobile) {
            const offset = size.width * 0.20; 
            camera.setViewOffset(size.width, size.height, offset, 0, size.width, size.height);
        } else {
            camera.clearViewOffset();
        }
        return () => camera.clearViewOffset();
    }, [camera, size, isMobile]);
    return null;
}

const OBJGrill: React.FC<{ url: string; engravingType: 'none' | 'standard' | 'custom'; textureUrl: string | null; color: 'black' | 'stainless'; onLoad?: () => void }> = ({ url, engravingType, textureUrl, color, onLoad }) => {
  const obj = useLoader(OBJLoader, url);
  const activeTextureUrl = engravingType === 'custom' ? (textureUrl || TRANSPARENT_PIXEL) : TRANSPARENT_PIXEL;
  const texture = useLoader(THREE.TextureLoader, activeTextureUrl);
  const scene = useMemo(() => obj.clone(), [obj]);
  const [modelDims, setModelDims] = useState<{ width: number, height: number, depth: number } | null>(null);

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
      if (child.isMesh) {
        child.castShadow = false; 
        child.receiveShadow = false;
        child.material = material;
      }
    });
  }, [scene, color]);

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
    <group onContextMenu={(e) => e.stopPropagation()}>
        <Center 
            onCentered={({ width, height, depth }) => {
                setModelDims(prev => {
                    if (prev && Math.abs(prev.width - width) < 0.001) return prev;
                    return { width, height, depth };
                });
            }}
        >
            <primitive object={scene} scale={0.4} />
        </Center>

        {modelDims && decalConfig && showDecal && (
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[modelDims.width, modelDims.height, modelDims.depth]} />
                <meshBasicMaterial visible={false} /> 
                {texture && (
                    <>
                    {decalConfig.isFrontBackWide ? (
                        <>
                            <Decal position={[0, 0, decalConfig.zOffset]} rotation={[0, 0, 0]} scale={[decalConfig.size, decalConfig.size, 1]}>
                                <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} />
                            </Decal>
                            <Decal position={[0, 0, -decalConfig.zOffset]} rotation={[0, Math.PI, 0]} scale={[decalConfig.size, decalConfig.size, 1]}>
                                <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} />
                            </Decal>
                        </>
                    ) : (
                        <>
                            <Decal position={[decalConfig.xOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[decalConfig.size, decalConfig.size, 1]}>
                                <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} />
                            </Decal>
                            <Decal position={[-decalConfig.xOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[decalConfig.size, decalConfig.size, 1]}>
                                <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} depthTest={true} depthWrite={false} roughness={0.4} />
                            </Decal>
                        </>
                    )}
                    </>
                )}
            </mesh>
        )}
    </group>
  );
};

const LoadingPlaceholder = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10">
       <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-2" />
       <span className="text-xs font-bold text-gray-200 whitespace-nowrap">Загрузка модели...</span>
    </div>
  </Html>
);

const ErrorPlaceholder: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <Html center>
    <div className="flex flex-col items-center bg-red-900/80 backdrop-blur-md p-6 rounded-xl border border-red-500/20 shadow-2xl z-50 pointer-events-auto">
       <div className="text-red-200 text-xs font-bold whitespace-nowrap mb-4">Ошибка загрузки модели</div>
       <button onClick={(e) => { e.stopPropagation(); onRetry(); }} className="flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-lg cursor-pointer"><RotateCw size={14} /> Повторить загрузку</button>
    </div>
  </Html>
);

// --- НАЧАЛО ИЗМЕНЕНИЙ: Обновленный компонент Grill3D ---
const Grill3D: React.FC<Grill3DProps> = ({ url, enableControls = true, isVisible = true, textureUrl = null, engravingType = 'none', color = 'stainless', onLoad }) => {
  const [retryKey, setRetryKey] = useState(0);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full bg-transparent relative touch-none" onContextMenu={(e) => e.preventDefault()}>
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 45, position: [10, 10, 10] }}>
        <Suspense fallback={null}>
            <Environment preset="forest" background={true} blur={0.05} />
        </Suspense>

        {url && isVisible && (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ErrorBoundary 
              key={`${url}-${retryKey}`}
              fallback={(reset) => <ErrorPlaceholder onRetry={() => {
                  try { THREE.Cache.clear(); } catch(e) { console.warn(e); }
                  setRetryKey(prev => prev + 1);
                  reset();
              }} />}
            >
              <CameraLayoutAdjuster isMobile={!enableControls} />
              <Stage intensity={0.6} adjustCamera={false} shadows={false}>
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                    <OBJGrill url={url!} engravingType={engravingType} textureUrl={textureUrl} color={color} onLoad={onLoad} />
                </Float>
              </Stage>
              <CinematicController controlsRef={controlsRef} enableControls={enableControls} />
            </ErrorBoundary>
          </Suspense>
        )}

        <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          autoRotate={!enableControls} // Включаем авто-вращение на мобильных
          autoRotateSpeed={0.5}
          enableZoom={false} 
          enablePan={false} 
          enableRotate={enableControls} // Отключаем ручное вращение на мобильных
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 1.8} 
        />
      </Canvas>
    </div>
  );
};
// --- КОНЕЦ ИЗМЕНЕНИЙ ---

export default Grill3D;