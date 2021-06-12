class PlayerWalkState extends PlayerGroundedState
{
    constructor() {
        super();
    }

    public enter(): void {

    }
    public update(): void {

        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }

        super.update();
    }
    public leave(): void {
        
    }
}