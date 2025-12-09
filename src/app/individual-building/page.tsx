"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { OrbitControls as ThreeOrbitControls } from "three-stdlib";
import TWeatherForcasting from "@/components/TWeatherForcasting";

// Cache model ahead of time (important for modal re-open)
useGLTF.preload("/models/sample.glb");


type ThreeContext = {
    camera: THREE.Camera;
    gl: THREE.WebGLRenderer;
    controls: ThreeOrbitControls;
};

interface ModelProps {
    url: string;
    onSelect: (obj: THREE.Object3D | null) => void;
}

function Model({ url, onSelect }: ModelProps) {
    const { scene } = useGLTF(url);
    const [hovered, setHovered] = useState<THREE.Object3D | null>(null);
    const [selected, setSelected] = useState<THREE.Object3D | null>(null);
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const { camera, gl, controls } = useThree<ThreeContext>();

    const originalMaterials = useRef<Map<string, THREE.Material>>(new Map());

    // 🔹 Normalize orientation + center + scale model
    useEffect(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // Move model to origin
        scene.position.sub(center);

        // Scale uniformly so the largest dimension fits into unit space
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 10 / maxDim; // adjust multiplier for zoom preference
        scene.scale.setScalar(scaleFactor);

        // Reset rotation and tilt slightly
        scene.rotation.set(0, Math.PI / 8, 0);
        scene.up.set(0, 1, 0);
    }, [scene]);

    // 🔹 Store original materials
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    originalMaterials.current.set(mesh.uuid, mesh.material as THREE.Material);
                }
            }
        });
    }, [scene]);

    // 🔹 Mouse move + click handling
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const rect = gl.domElement.getBoundingClientRect();
            mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const handleClick = () => {
            if (hovered) {
                // Restore previously selected material
                if (selected && originalMaterials.current.has(selected.uuid)) {
                    (selected as THREE.Mesh).material =
                        originalMaterials.current.get(selected.uuid)!;
                }

                // Mark new selected
                setSelected(hovered);
                onSelect(hovered);

                // Apply permanent color
                if ((hovered as THREE.Mesh).isMesh) {
                    (hovered as THREE.Mesh).material = new THREE.MeshBasicMaterial({
                        color: "red",
                    });
                }

                // Get bounding box of object
                const box = new THREE.Box3().setFromObject(hovered);
                const size = new THREE.Vector3();
                box.getSize(size);
                const center = new THREE.Vector3();
                box.getCenter(center);

                const maxDim = Math.max(size.x, size.y, size.z);
                const zoomDist = maxDim * 2.5;

                gsap.to(camera.position, {
                    duration: 1.2,
                    x: center.x + zoomDist,
                    y: center.y + zoomDist,
                    z: center.z + zoomDist,
                    onUpdate: () => {
                        controls.target.copy(center);
                        controls.update();
                    },
                });
            }
        };

        gl.domElement.addEventListener("mousemove", handleMouseMove);
        gl.domElement.addEventListener("click", handleClick);
        return () => {
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
            gl.domElement.removeEventListener("click", handleClick);
        };
    }, [gl, hovered, camera, controls, onSelect, selected]);

    // 🔹 Raycasting highlight (hover only, not overriding selected)
    useFrame(() => {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const first = intersects[0].object;

            if (hovered !== first && first !== selected) {
                if (hovered && hovered !== selected && originalMaterials.current.has(hovered.uuid)) {
                    (hovered as THREE.Mesh).material =
                        originalMaterials.current.get(hovered.uuid)!;
                }

                setHovered(first);
                if (originalMaterials.current.has(first.uuid)) {
                    (first as THREE.Mesh).material = new THREE.MeshBasicMaterial({
                        color: "#373737",
                    });
                }
            }
        } else {
            if (hovered && hovered !== selected && originalMaterials.current.has(hovered.uuid)) {
                (hovered as THREE.Mesh).material =
                    originalMaterials.current.get(hovered.uuid)!;
            }
            setHovered(null);
        }
    });

    return <primitive object={scene} />;
}

export default function ModelViewer() {
    const [selected, setSelected] = useState<THREE.Object3D | null>(null);

    return (
        <div className="w-full h-screen relative">
            <TWeatherForcasting />
            {selected && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-md text-sm max-w-xs z-10">
                    <h3 className="font-bold mb-2">Object Info</h3>
                    <p><strong>Name:</strong> {selected.name}</p>
                    <p><strong>UUID:</strong> {selected.uuid}</p>
                    <p><strong>Type:</strong> {selected.type}</p>
                    <p><strong>ID:</strong> {selected.id}</p>
                    <p>
                        <strong>Position:</strong>{" "}
                        {selected.position.x.toFixed(2)}, {selected.position.y.toFixed(2)}, {selected.position.z.toFixed(2)}
                    </p>
                </div>
            )}

            <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <Model url="/models/sample.glb" onSelect={setSelected} />
                <OrbitControls makeDefault enableZoom />
            </Canvas>
        </div>
    );
}
