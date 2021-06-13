class PlayerAirborneState implements IBaseState<BasePlayer>
{
    public machine: StateMachine<BasePlayer>;

    constructor() {}

    public enter(): void {
        
    }
    public update(): void {
        
    }
    public leave(): void {
        
    }

    public onCollisionSolved(result: CollisionResult) {
        if (result.onBottom) {
            this.onLand();
        }
        else if (result.onTop) {
            this.headbonk();
        }
    }

    protected updateGravity(gravity: number = PlayerStats.Gravity, maxFallSpeed: number = PlayerStats.MaxFallSpeed) {
        if (this.machine.owner.speed.y < maxFallSpeed) {
            this.machine.owner.speed.y = Math.min(this.machine.owner.speed.y + gravity, maxFallSpeed);
        }
    }

    protected onLand() {
        this.machine.owner.speed.y = 0;

        let state:PlayerStates = this.machine.owner.speed.x == 0 ? PlayerStates.Idle : PlayerStates.Walk;
        this.machine.changeState(state);

        this.machine.owner.view.playLandParticles();
        this.machine.owner.view.animator.squish(1.1, 0.6, 200);
    }

    protected headbonk() {
        this.machine.owner.speed.y = 0;
    }
}