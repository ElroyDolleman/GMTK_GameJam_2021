class PlayerGroundedState implements IBaseState<BasePlayer>
{
    public machine: StateMachine<BasePlayer>;

    constructor() {}

    public enter(): void {
        
    }

    public update(): void {
        if (this.machine.owner.currentInputState.jumpFrames == 1) {
            this.machine.changeState(PlayerStates.Jump);
        }
    }

    public leave(): void {
        
    }

    public onCollisionSolved(result: CollisionResult): void {
        if (!this.hasGroundUnderneath(result.tiles)) {
            this.machine.changeState(PlayerStates.Fall);
        }
    }

    protected hasGroundUnderneath(tiles: Tile[]):boolean {
        for (let i = 0; i < tiles.length; i++) {
            if (!tiles[i].canStandOn) {
                continue;
            }
            if (this.isStandingOnTile(tiles[i])) {
                return true;
            }
        }
        return false;
    }

    protected isStandingOnTile(tile: Tile):boolean {
        return CollisionUtil.hitboxVerticallyAligned(this.machine.owner.hitbox, tile.hitbox);
    }
}