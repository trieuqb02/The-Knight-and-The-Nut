export enum ColliderGroup {
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    ENEMY = 1 << 2,
    GROUND = 1 << 3,
    BOSS   = 1 << 4,
    POWER_UP   = 1 << 5,
}