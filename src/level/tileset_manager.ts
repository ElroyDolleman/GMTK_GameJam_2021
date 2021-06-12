class TilesetManager {

    private constructor() {}

    public static tilesetJson:any;
    public static tilesetName:string;

    public static getTileTypeFromID(tileId:number):TileTypes {
        if (tileId < 0) {
            return TileTypes.Empty;
        }

        let tiletypes = this.tilesetJson['tiletypes'];

        if (tiletypes['solid'].indexOf(tileId) >= 0) {
            return TileTypes.Solid;
        }
        if (tiletypes['semisolid'].indexOf(tileId) >= 0) {
            return TileTypes.SemiSolid;
        }
        if (tiletypes['ice'].indexOf(tileId) >= 0) {
            return TileTypes.Ice;
        }
        if (tiletypes['water'].indexOf(tileId) >= 0) {
            return TileTypes.Water;
        }
        if (tiletypes['grass'].indexOf(tileId) >= 0) {
            return TileTypes.Grass;
        }
        if (tiletypes['fire'].indexOf(tileId) >= 0) {
            return TileTypes.Fire;
        }
        if (tiletypes['torch'].indexOf(tileId) >= 0) {
            return TileTypes.Torch;
        }
        if (tiletypes['goldtorch'].indexOf(tileId) >= 0) {
            return TileTypes.GoldTorch;
        }

        return TileTypes.Empty;
    }

    /**
     * Start a repeating tile animation
     * @param sprite 
     * @param tileId 
     * @returns 
     */
    public static startTileAnimation(tile:Tile, tileId:number):void {
        if (this.tilesetJson['animations'][tileId] === undefined) {
            if (tile.sprite.anims.isPlaying) {
                tile.sprite.stop();
            }
            if (TimeManager.tileAnimations.has(tile.id)) {
                TimeManager.tileAnimations.delete(tile.id);
            }
            return;
        }

        let amountOfFrames:number = this.tilesetJson['animations'][tileId];

        let key = 'tile' + tileId;
        let frames = tile.sprite.anims.generateFrameNumbers(this.tilesetName, { start: tileId, end: tileId + amountOfFrames-1 });
        tile.sprite.anims.create({
            key: key,
            frames: frames,
            frameRate: 0,
            repeat: -1
        });
        tile.sprite.play(key);

        TimeManager.tileAnimations.set(tile.id, tile.sprite.anims);
    }

    public static changeTileType(tile:Tile, tileType:TileTypes) {
        tile.tiletype = tileType;

        let tileId:number = MappedTileTypes.get(tileType);
        tile.changeTileId(tileId);

        this.startTileAnimation(tile, tileId);
    }

    /**
     * Play single tile animation
     * @param sprite 
     * @param tileId 
     * @returns 
     */
    public static playAnimationOnTile(tile:Tile, frames:number, onDone:Function) {

        if (tile.sprite.anims.isPlaying) {
            tile.sprite.stop();
            tile.sprite.anims.remove('tile' + tile.tileId);
        }

        let key = 'tile' + tile.tileId;
        tile.sprite.anims.create({
            key: key,
            frames: tile.sprite.anims.generateFrameNumbers(this.tilesetName, { start: tile.tileId, end: tile.tileId + frames-1 }),
            frameRate: 10,
            repeat: 0
        });
        tile.sprite.play(key);
        tile.sprite.once('animationcomplete', onDone);
    }
}