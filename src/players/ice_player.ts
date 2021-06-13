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
    }
}