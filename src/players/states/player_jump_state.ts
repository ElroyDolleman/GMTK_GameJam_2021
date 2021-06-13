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
        this.machine.owner.speed.y -= PlayerStats.InitialJumpPower;

        this.machine.owner.view.playJumpParticles();
    }
    public update():void {
        //TODO: Change air accel?
        this.machine.owner.updateMovementControls();

        if (this.isHoldingJump && this.jumpHeldDownFrames > 1 && this.jumpHeldDownFrames < 12) {
            this.machine.owner.speed.y -= PlayerStats.JumpPower;
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