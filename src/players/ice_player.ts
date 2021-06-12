class IcePlayer extends BasePlayer
{
    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, inputFramesBehind:number) {
        super(scene, spawnPosition, inputFramesBehind, 'icechar-walk_00.png');

        this.solidTileTypes.push(TileType.Water);
    }

    onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);

        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileType.Water) {
                if (CollisionUtil.hitboxVerticallyAligned(this.hitbox, result.tiles[i].hitbox)) {

                    TilesetManager.changeTileType(result.tiles[i], TileType.Ice);
                }
            }
        }
    }
}