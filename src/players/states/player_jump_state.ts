class PlayerJumpState extends PlayerAirborneState
{
    private isHoldingJump:boolean;
    //private startJumpHeldDownFrames:number;

    private get jumpHeldDownFrames(): number { return this.machine.owner.currentInputState.jumpFrames/* - this.startJumpHeldDownFrames*/; }

    constructor() {
        super();
    }

    public enter():void {
        this.isHoldingJump = true;
        //this.startJumpHeldDownFrames = this.machine.owner.currentInputState.jumpFrames;
    }
    public update():void {
        this.machine.owner.updateMovementControls(120, 40);

        if (this.isHoldingJump && this.jumpHeldDownFrames > 0 && this.jumpHeldDownFrames < 7) {
            this.machine.owner.speed.y -= 24;
        }
        else if (this.machine.owner.currentInputState.jumpFrames == 0) {
            this.isHoldingJump = false;
        }

        this.updateGravity();

        if (this.machine.owner.speed.y >= 0) {
            this.machine.changeState(PlayerStates.Fall);
        }
    }
    public leave():void {
        
    }

    public onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);
    }
}