import {useFrame} from "@react-three/fiber";
import {useRef, useState} from "react";
import {Points} from "@react-three/drei";
import {useWorld} from "../hooks/useWorld";
import {particleQuery} from "../../logic/queries";
import {ParticleComponent, PositionComponent} from "../../logic/components";
import * as THREE from "three";

const vertexShader = `
  attribute float size;
  attribute float velocity;
  varying float vVelocity;
  
  void main() {
    vVelocity = velocity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Уменьшаем базовый размер и зависимость от расстояния
    gl_PointSize = size * (100.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
varying float vVelocity;
uniform float time;

void main() {
    vec2 uv = gl_PointCoord;
    uv.y = 1.0 - uv.y; // Инвертируем Y
    
    // Основная капля - вертикальная линия с заострением внизу
    float line = 1.0 - smoothstep(0.0, 0.15, abs(uv.x - 0.5));
    
    // Градиент по высоте (ярче вверху)
    float gradient = 1.0 - smoothstep(0.0, 1.0, uv.y);
    line *= gradient;
    
    // Головка капли (круглая вверху)
    vec2 headPos = vec2(0.5, 0.9 - vVelocity * 0.3);
    float head = 1.0 - smoothstep(0.0, 0.08, distance(uv, headPos));
    
    // Хвост капли (сужается к низу)
    float tail = smoothstep(0.5, 0.0, uv.y) * (1.0 - smoothstep(0.0, 0.2, abs(uv.x - 0.5)));
    
    // Комбинируем все части
    float alpha = line * 0.7 + head + tail * 0.5;
    
    // Добавляем мерцание как в Shadertoy
    float flicker = sin(uv.y * 30.0 + time * 5.0) * 0.05 + 0.95;
    alpha *= flicker;
    
    if (alpha < 0.2) discard;
    
    // Цветовая схема для ночного дождя - бело-голубые тона
    vec3 baseColor = vec3(0.7, 0.8, 0.9);   // Светлый голубовато-белый
    vec3 highlight = vec3(0.9, 0.95, 1.0);  // Почти чистый белый
    
    // Градиент цвета от верха к низу
    vec3 color = mix(baseColor, highlight, uv.y);
    
    // Уменьшаем общую яркость для ночной атмосферы
    color *= 0.7;
    
    gl_FragColor = vec4(color, alpha * 0.5);
}
`;

export function Particles() {
    const world = useWorld();
    const prevCountRef = useRef(0);
    const [update, forceUpdate] = useState(false);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const startTimeRef = useRef(Date.now());

    // Используем useRef для изменяемых данных
    const particlesDataRef = useRef({
        positions: new Float32Array(0),
        colors: new Float32Array(0),
        sizes: new Float32Array(0),
        velocities: new Float32Array(0)
    });

    useFrame((state) => {
        // Обновляем время в шейдере
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = (Date.now() - startTimeRef.current) * 0.001;
        }

        // Оптимизация: обновляем не каждый кадр, а примерно 30 раз в секунду
        if (state.clock.getElapsedTime() % 0.033 > 0.016) {
            return;
        }

        const particles = particleQuery(world);
        const count = particles.length;

        if (count === 0) {
            if (prevCountRef.current !== 0) {
                // Создаем новые массивы вместо мутации
                particlesDataRef.current = {
                    positions: new Float32Array(0),
                    colors: new Float32Array(0),
                    sizes: new Float32Array(0),
                    velocities: new Float32Array(0)
                };
                prevCountRef.current = 0;
                forceUpdate(!update);
            }
            return;
        }

        let needsUpdate = false;

        // Пересоздаем массивы только если количество изменилось
        if (count !== prevCountRef.current) {
            particlesDataRef.current = {
                positions: new Float32Array(count * 3),
                colors: new Float32Array(count * 3),
                sizes: new Float32Array(count),
                velocities: new Float32Array(count)
            };
            prevCountRef.current = count;
            needsUpdate = true;
        }

        // Заполняем массивы данными
        for (let index = 0; index < count; index++) {
            const eid = particles[index];
            const i = index * 3;

            const newX = PositionComponent.x[eid];
            const newY = PositionComponent.y[eid];
            const newZ = PositionComponent.z[eid];
            const newR = ParticleComponent.colorR[eid] || 0.7;
            const newG = ParticleComponent.colorG[eid] || 0.85;
            const newB = ParticleComponent.colorB[eid] || 1.0;

            // Проверяем, изменились ли данные
            if (particlesDataRef.current.positions[i] !== newX ||
                particlesDataRef.current.positions[i + 1] !== newY ||
                particlesDataRef.current.positions[i + 2] !== newZ ||
                particlesDataRef.current.colors[i] !== newR ||
                particlesDataRef.current.colors[i + 1] !== newG ||
                particlesDataRef.current.colors[i + 2] !== newB) {
                needsUpdate = true;
            }

            particlesDataRef.current.positions[i] = newX;
            particlesDataRef.current.positions[i + 1] = newY;
            particlesDataRef.current.positions[i + 2] = newZ;
            particlesDataRef.current.colors[i] = newR;
            particlesDataRef.current.colors[i + 1] = newG;
            particlesDataRef.current.colors[i + 2] = newB;

            // Уменьшаем размер и добавляем вариативность
            particlesDataRef.current.sizes[index] = 0.5 + Math.random() * 1.5; // Уменьшенный размер
            particlesDataRef.current.velocities[index] = 0.4 + Math.random() * 0.6;
        }

        // Обновляем только если данные изменились
        if (needsUpdate) {
            forceUpdate(!update);
        }
    });

    const particles = particleQuery(world);

    if (particles.length === 0) {
        return null;
    }

    const {positions, colors, sizes, velocities} = particlesDataRef.current;

    return (
        <Points
            positions={positions}
            colors={colors}
            sizes={sizes}
            limit={1000}
            range={1000}
        >
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    time: {value: 0}
                }}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending} // Меняем на NormalBlending для более естественного вида
            />
        </Points>
    );
}