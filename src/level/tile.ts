enum TileType {
    Empty,
    Solid,
    Grass,
    Ice,
    Fire,
    Water,
}

const MappedTileTypes = new Map<number, number>([
    [TileType.Ice, 9],
    [TileType.Grass, 23],
    [TileType.Fire, 24],
    [TileType.Water, 34],
]);

class Tile
{
    public readonly cellX:number;
    public readonly cellY:number;

    public sprite:Phaser.GameObjects.Sprite;
    public hitbox:Phaser.Geom.Rectangle;
    public position:Phaser.Geom.Point;
    public tiletype:TileType;
    public tileId:number;

    public get isSolid():boolean { return this.tiletype == TileType.Solid || this.tiletype == TileType.Ice; }
    public get canStandOn():boolean { return this.isSolid; }

    //private debug:Phaser.GameObjects.Graphics;

    constructor(sprite:Phaser.GameObjects.Sprite, tiletype:TileType, tileId:number, cellX:number, cellY:number, posX:number, posY:number, hitbox:Phaser.Geom.Rectangle) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.tileId = tileId;

        this.tiletype = tiletype;
        this.hitbox = hitbox;
        this.sprite = sprite;

        // if (this.sprite) {
        //     this.debug = elroy.add.graphics({ fillStyle: { color: 0xFF, alpha: 1 } });
        //     this.debug.fillRectShape(hitbox);
        // }
    }

    public makeEmpty() {
        this.tiletype = TileType.Empty;
        this.sprite.destroy();
    }

    public destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}