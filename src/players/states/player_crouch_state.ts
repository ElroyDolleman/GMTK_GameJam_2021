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
        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype != TileTypes.Torch && result.tiles[i].tiletype != TileTypes.GoldTorch) {
                continue;
            }
            if (this.isStandingOnTile(result.tiles[i])) {

                if (result.tiles[i].tiletype == TileTypes.GoldTorch) {
                    this.machine.owner.isAtGoal = true;
                }

                AudioManager.sounds.torch.play({ volume:0.3 });

                this.machine.changeState(PlayerStates.Sleep);
                break;
            }
        }
    }
}