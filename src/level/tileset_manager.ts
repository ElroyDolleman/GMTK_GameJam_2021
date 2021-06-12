class TilesetManager {

    private constructor() {}

    public static tilesetJson:any;
    public static tilesetName:string;

    public static getTileTypeFromID(tileId:number):TileType {
        if (tileId < 0) {
            return TileType.Empty;
        }

        let tiletypes = this.tilesetJson['tiletypes'];

        if (tiletypes['solid'].indexOf(tileId) >= 0) {
            return TileType.Solid;
        }
        if (tiletypes['ice'].indexOf(tileId) >= 0) {
            return TileType.Ice;
        }
        if (tiletypes['water'].indexOf(tileId) >= 0) {
            return TileType.Water;
        }
        if (tiletypes['grass'].indexOf(tileId) >= 0) {
            return TileType.Grass;
        }
        if (tiletypes['fire'].indexOf(tileId) >= 0) {
            return TileType.Fire;
        }

        return TileType.Empty;
    }

    public static startTileAnimation(sprite:Phaser.GameObjects.Sprite, tileId:number):void {
        if (this.tilesetJson['animations'][tileId] === undefined) {
            return;
        }

        let amountOfFrames:number = this.tilesetJson['animations'][tileId];

        let key = 'tile';
        let frames = sprite.anims.generateFrameNumbers(this.tilesetName, { start: tileId, end: tileId + amountOfFrames-1 });
        sprite.anims.create({
            key: 'tile',
            frames: frames,
            frameRate: 10,
            repeat: -1
        });
        sprite.play(key);
    }

    public static changeTileType(tile:Tile, tileType:TileType) {
        tile.tiletype = tileType;
        let tileId:number = MappedTileTypes.get(tileType);
        this.startTileAnimation(tile.sprite, tileId);
    }

    public static playAnimationOnTile(tile:Tile, frames:number, onDone:Function) {

        let key = 'tile';
        tile.sprite.anims.create({
            key: 'tile',
            frames: tile.sprite.anims.generateFrameNumbers(this.tilesetName, { start: tile.tileId, end: tile.tileId + frames-1 }),
            frameRate: 10,
        });
        tile.sprite.play(key);
        tile.sprite.on('animationcomplete', onDone);
    }
}