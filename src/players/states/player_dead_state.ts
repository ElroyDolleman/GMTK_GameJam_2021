class PlayerDeadState implements IBaseState<BasePlayer>
{
    public machine: StateMachine<BasePlayer>;

    constructor() {

    }

    public enter(): void {
        AudioManager.sounds.dead.play({volume: 0.1});
    }

    public update(): void {

    }

    public leave(): void {

    }

    public onCollisionSolved(result: CollisionResult): void {

    }
}