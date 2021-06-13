class IcePlayer extends BasePlayer
{
    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, startingState:PlayerStates) {
        super(scene, spawnPosition, startingState, new BasePlayerView('icechar', 0x8be1eb));

        this.solidTileTypes.push(TileTypes.Water);

        this.damageTileTypes.push(TileTypes.Fire);
    }

    onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);

        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileTypes.Water) {
                if (CollisionUtil.hitboxVerticallyAligned(this.hitbox, result.tiles[i].hitbox)) {

                    TilesetManager.changeTileType(result.tiles[i], TileTypes.Ice);
                }
            }
        }

        let firePlayerState = GameScene.instance.firePlayer.getStateMachine().currentStateKey;
        if (firePlayerState != PlayerStates.Sleep && firePlayerState != PlayerStates.Dead && 
            this.stateMachine.currentStateKey != PlayerStates.Sleep && this.stateMachine.currentStateKey != PlayerStates.Dead) {
            if (Phaser.Geom.Rectangle.Overlaps(GameScene.instance.firePlayer.hitbox, this.hitbox)) {
                this.die();
            }
        }
    }
}