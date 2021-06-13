class FirePlayer extends BasePlayer
{
    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, startingState:PlayerStates) {
        super(scene, spawnPosition, startingState, new BasePlayerView('firechar', 0xFF0000));

        //this.damageTileTypes.push(TileTypes.Water);
    }

    onCollisionSolved(result: CollisionResult):void {
        super.onCollisionSolved(result);

        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileTypes.Ice) {
                if (CollisionUtil.hitboxesAligned(result.tiles[i].hitbox, this.hitbox)) {

                    if (!result.tiles[i].sprite.anims.isPlaying) {
                        AudioManager.sounds.melt.play({ volume:0.2 });
                        TilesetManager.playAnimationOnTile(result.tiles[i], 5, () => {

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

                    AudioManager.sounds.fire.play({volume: 0.2});
                }
            }
            else if (result.tiles[i].tiletype == TileTypes.Water && this.stateMachine.currentStateKey != PlayerStates.Dead) {
                if (Phaser.Geom.Rectangle.Overlaps(result.tiles[i].hitbox, this.hitbox)) {
                    this.die();
                }
            }
        }
    }
}