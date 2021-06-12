/// <reference path="./player_grounded_state.ts"/>

class PlayerCrouchState extends PlayerGroundedState
{
    constructor() {
        super();
    }

    public enter(): void {
        this.machine.owner.speed.x = 0;
    }

    public update(): void {
        if (this.machine.owner.currentInputState.downFrames == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }
    }

    public leave(): void {

    }

    public onCollisionSolved(result: CollisionResult): void {
        if (this.hasTorchUnderneath(result.tiles)) {
            this.machine.changeState(PlayerStates.Sleep);
        }
    }

    private hasTorchUnderneath(tiles: Tile[]):boolean {
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i].tiletype != TileTypes.Torch && tiles[i].tiletype != TileTypes.GoldTorch) {
                continue;
            }
            if (this.isStandingOnTile(tiles[i])) {
                return true;
            }
        }
        return false;
    }
}