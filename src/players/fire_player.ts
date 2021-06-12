class FirePlayer extends BasePlayer
{
    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, inputFramesBehind:number) {
        super(scene, new Phaser.Math.Vector2(64, 288-16), 1*60, 'firechar-walk_00.png');
        this.inputFramesBehind = inputFramesBehind;
    }

    onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);

        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileType.Ice) {
                if (CollisionUtil.hitboxesAligned(result.tiles[i].hitbox, this.hitbox)) {
                    //TODO: Melt slowly
                    result.tiles[i].makeEmpty();
                }
            }
            else if (result.tiles[i].tiletype == TileType.Grass) {
                if (Phaser.Geom.Rectangle.Overlaps(result.tiles[i].hitbox, this.hitbox)) {

                    TilesetManager.changeTileType(result.tiles[i], TileType.Fire);
                }
            }
        }
    }
}