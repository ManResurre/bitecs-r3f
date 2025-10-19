import {Types, defineComponent} from "bitecs";

export const Vector3 = {x: Types.f32, y: Types.f32, z: Types.f32};
export const Vector2 = {x: Types.f32, y: Types.f32};

export const PositionComponent = defineComponent(Vector3);

export const SpeedComponent = defineComponent({
    maxSpeed: Types.f32,
    acceleration: Types.f32,
});

export const VelocityComponent = defineComponent(Vector3);

export const RotationComponent = defineComponent({y: Types.i8});

export const TileComponent = defineComponent({id: Types.ui8});

export const ColorComponent = defineComponent({team: Types.ui8});
export const MobComponent = defineComponent({
    name: [Types.ui8, 32]
});

export const SpawnComponent = defineComponent({
    delay: Types.ui16,
    cooldown: Types.f32,
    max: Types.ui8,
});

export const HealthComponent = defineComponent({
    value: Types.ui8,
});

export const SelectedCellComponent = defineComponent(Vector2);

export const CircleMovementComponent = defineComponent({
    centerX: Types.f32,    // центр окружности по X
    centerZ: Types.f32,    // центр окружности по Z
    radius: Types.f32,     // радиус окружности
    angle: Types.f32,      // текущий угол в радианах
    angularSpeed: Types.f32, // угловая скорость (радиан/секунду)
});
