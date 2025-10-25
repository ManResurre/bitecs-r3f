import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const AdvancedRainMaterial = () => {
    const materialRef = useRef(null);
    const dropPositionsRef = useRef([]);
    const lastUpdateRef = useRef(0);

    // Создаем текстуру для капель
    const createDropTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Рисуем каплю
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(150, 180, 220, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        return new THREE.CanvasTexture(canvas);
    };

    const dropTexture = useMemo(() => createDropTexture(), []);

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        dropTexture: { value: dropTexture },
        dropPositions: { value: new Float32Array(100 * 3) }, // Макс 100 капель
        dropCount: { value: 0 }
    }), [dropTexture]);

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float time;
        uniform sampler2D dropTexture;
        uniform vec3 dropPositions[100];
        uniform int dropCount;
        
        varying vec2 vUv;
        
        void main() {
            vec3 dryColor = vec3(0.9, 0.9, 0.9);
            vec3 wetColor = vec3(0.3, 0.4, 0.5);
            vec3 finalColor = dryColor;
            
            float wetness = 0.0;
            
            // Обрабатываем все активные капли
            for (int i = 0; i < 100; i++) {
                if (i >= dropCount) break;
                
                vec3 drop = dropPositions[i];
                vec2 dropUV = vec2(drop.x, drop.y);
                float dropSize = drop.z;
                
                // Рассчитываем расстояние до капли
                float dist = distance(vUv, dropUV);
                
                if (dist < dropSize) {
                    // Текстура капли
                    vec2 texCoord = vec2(
                        (vUv.x - dropUV.x) / (dropSize * 2.0) + 0.5,
                        (vUv.y - dropUV.y) / (dropSize * 2.0) + 0.5
                    );
                    
                    if (texCoord.x >= 0.0 && texCoord.x <= 1.0 && 
                        texCoord.y >= 0.0 && texCoord.y <= 1.0) {
                        vec4 dropColor = texture2D(dropTexture, texCoord);
                        wetness += dropColor.a;
                    }
                }
            }
            
            wetness = clamp(wetness, 0.0, 1.0);
            finalColor = mix(dryColor, wetColor, wetness);
            
            // Блеск от воды
            finalColor += wetness * 0.2;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // Функция для добавления капли
    const addDrop = (x, y, size = 0.02) => {
        if (dropPositionsRef.current.length < 100) {
            dropPositionsRef.current.push([x, y, size]);
            if (materialRef.current) {
                // Обновляем uniforms
                const array = new Float32Array(100 * 3);
                dropPositionsRef.current.forEach((pos, i) => {
                    array[i * 3] = pos[0];
                    array[i * 3 + 1] = pos[1];
                    array[i * 3 + 2] = pos[2];
                });
                materialRef.current.uniforms.dropPositions.value = array;
                materialRef.current.uniforms.dropCount.value = dropPositionsRef.current.length;
            }
        }
    };

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.getElapsedTime();

            // Добавляем случайные капли для демонстрации
            const currentTime = state.clock.getElapsedTime();
            if (currentTime - lastUpdateRef.current > 0.1) {
                if (Math.random() < 0.3) {
                    addDrop(Math.random(), Math.random(), 0.01 + Math.random() * 0.02);
                }
                lastUpdateRef.current = currentTime;
            }

            // Постепенно удаляем старые капли
            if (dropPositionsRef.current.length > 0 && Math.random() < 0.05) {
                dropPositionsRef.current.shift();
                materialRef.current.uniforms.dropCount.value = dropPositionsRef.current.length;
            }
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
        />
    );
};