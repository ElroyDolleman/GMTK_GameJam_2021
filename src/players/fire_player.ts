class FirePlayer extends BasePlayer
{
    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2) {
        super(scene, spawnPosition, 'firechar-walk_00.png');
    }

    onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);

        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileTypes.Ice) {
                if (CollisionUtil.hitboxesAligned(result.tiles[i].hitbox, this.hitbox)) {

                    if (!result.tiles[i].sprite.anims.isPlaying) {
                        console.log(Date.now());
                        TilesetManager.playAnimationOnTile(result.tiles[i], 5, () => {
                            console.log(Date.now());
                            if (result.tiles[i].originalTiletype == TileTypes.Ice) {
                                result.tiles[i].makeEmpty();
                            }
                            else {
                                TilesetManager.changeTileType(result.tiles[i], result.tiles[i].originalTiletype);
                            }
                        });
                    }
                }
            }
            else if (result.tiles[i].tiletype == TileTypes.Grass) {
                if (Phaser.Geom.Rectangle.Overlaps(result.tiles[i].hitbox, this.hitbox)) {

                    TilesetManager.changeTileType(result.tiles[i], TileTypes.Fire);
                }
            }
        }
    }
}