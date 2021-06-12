enum TileTypes {
    Empty,
    Solid,
    SemiSolid,
    Grass,
    Ice,
    Fire,
    Water,
    Torch,
    GoldTorch,
}

const MappedTileTypes = new Map<number, number>([
    [TileTypes.Ice, 9],
    [TileTypes.Grass, 23],
    [TileTypes.Fire, 25],
    [TileTypes.Water, 36],
]);

class Tile
{
    public get id():string { return this.cellX.toString() + this.cellY.toString(); }

    public readonly cellX:number;
    public readonly cellY:number;
    public readonly originalTiletype:number;

    public sprite:Phaser.GameObjects.Sprite;
    public hitbox:Phaser.Geom.Rectangle;
    public position:Phaser.Geom.Point;
    public tiletype:TileTypes;
    public tileId:number;

    public get isSemisolid():boolean { return this.tiletype == TileTypes.SemiSolid || this.tiletype == TileTypes.Torch || this.tiletype == TileTypes.GoldTorch; }
    public get isSolid():boolean { return this.tiletype == TileTypes.Solid || this.tiletype == TileTypes.Ice; }
    public get canStandOn():boolean { return this.isSolid || this.isSemisolid; }

    //private debug:Phaser.GameObjects.Graphics;

    constructor(sprite:Phaser.GameObjects.Sprite, tiletype:TileTypes, tileId:number, cellX:number, cellY:number, posX:number, posY:number, hitbox:Phaser.Geom.Rectangle) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.tileId = tileId;

        this.tiletype = tiletype;
        this.originalTiletype = tiletype;
        this.hitbox = hitbox;
        this.sprite = sprite;

        if (tileId > 0) {
            TilesetManager.startTileAnimation(this, tileId);
        }

        // if (this.sprite) {
        //     this.debug = elroy.add.graphics({ fillStyle: { color: 0xFF, alpha: 1 } });
        //     this.debug.fillRectShape(hitbox);
        // }
    }

    public makeEmpty() {
        this.tiletype = TileTypes.Empty;
        this.sprite.destroy();
    }

    public changeTileId(newTileId:number) {
        this.sprite.setFrame(newTileId);
        this.tileId = newTileId;
    }

    public destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}