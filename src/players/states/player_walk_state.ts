class PlayerWalkState extends PlayerGroundedState
{
    private particleTimer:number = 0;

    constructor() {
        super();
    }

    public enter(): void {
        this.particleTimer = 0;
    }

    public update(): void {

        this.particleTimer++;
        if (this.particleTimer == 12) {
            this.particleTimer = 0;
            this.machine.owner.view.playWalkParticles();
        }

        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }

        super.update();
    }
    public leave(): void {
        
    }
}