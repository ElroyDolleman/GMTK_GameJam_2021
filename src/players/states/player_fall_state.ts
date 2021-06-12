class PlayerFallState extends PlayerAirborneState
{
    constructor() {
        super();
    }

    public enter():void {
        
    }
    public update():void {
        this.machine.owner.updateMovementControls();
        this.updateGravity();
    }
    public leave():void {
        
    }

    public onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);
    }
}