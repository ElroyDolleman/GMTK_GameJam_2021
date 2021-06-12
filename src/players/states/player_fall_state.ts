class PlayerFallState extends PlayerAirborneState
{
    constructor() {
        super();
    }

    public enter(): void {
        
    }
    public update(): void {
        this.machine.owner.updateMovementControls();
        this.updateGravity();
    }
    public leave(): void {
        
    }

    onCollisionSolved(result: CollisionResult): void {

    }
}