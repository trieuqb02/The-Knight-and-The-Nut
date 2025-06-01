export interface IShieldable {
    setShield(enable: boolean): void;
    shieldEffect: { active: boolean };
}
