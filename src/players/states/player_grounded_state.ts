class PlayerGroundedState implements IBaseState<BasePlayer>
{
    public machine: StateMachine<BasePlayer>;

    constructor() {}

    public enter(): void {
        
    }
    public update(): void {
        this.machine.owner.updateMovementControls();
    }
    public leave(): void {
        
    }
}