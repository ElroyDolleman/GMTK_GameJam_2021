class FirePlayer extends BasePlayer
{
    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, inputFramesBehind:number) {
        super(scene, spawnPosition, inputFramesBehind, 'firechar-walk_00.png');
    }

    onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);

        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileType.Ice) {
                if (CollisionUtil.hitboxesAligned(result.tiles[i].hitbox, this.hitbox)) {

                    if (!result.tiles[i].sprite.anims.isPlaying) {
                        TilesetManager.playAnimationOnTile(result.tiles[i], 5, () => {
                            result.tiles[i].makeEmpty();
                        });
                    }
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