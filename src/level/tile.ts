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

    public particleEmitter:Phaser.GameObjects.Particles.ParticleEmitter;

    //private debug:Phaser.GameObjects.Graphics;

    constructor(sprite:Phaser.GameObjects.Sprite, tiletype:TileTypes, tileId:number, cellX:number, cellY:number, posX:number, posY:number, hitbox:Phaser.Geom.Rectangle) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.hitbox = hitbox;
        this.sprite = sprite;

        this.originalTiletype = tiletype;
        this.changeTileId(tileId, tiletype);

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

    public changeTileId(newTileId:number, tiletype:TileTypes) {
        if (tiletype != TileTypes.Empty) {
            this.sprite.setFrame(newTileId);
        }

        this.tileId = newTileId;
        this.tiletype = tiletype;

        if (this.particleEmitter) {
            ParticleManager.removeEmitter(this.particleEmitter);
            this.particleEmitter = null;
        }

        switch(tiletype) {
            case TileTypes.Fire:
                this.particleEmitter = ParticleManager.createEmitter({
                    x: this.hitbox.centerX,
                    y: this.hitbox.top,
                    lifespan: { min: 260, max: 310 },
                    speed: { min: 8, max: 12},
                    angle: { min: 270-10, max: 270+10},
                    scale: { start: 1, end: 0, ease: 'Power3' },
                    frequency: 48,
                    emitZone: { source: new Phaser.Geom.Rectangle(-2, -3, 4, -1) },
                    frame: 'flame-particle_00.png',
                });
                this.particleEmitter.setTint(0xFF0000);
                break;
            case TileTypes.GoldTorch:
                this.particleEmitter = ParticleManager.createEmitter({
                    x: this.hitbox.centerX,
                    y: this.hitbox.top,
                    lifespan: { min: 300, max: 400 },
                    speed: { min: 32, max: 48 },
                    angle: { min: 270-28, max: 270+28 },
                    scale: { start: 0.1, end: 1, ease: 'Cubic' },
                    alpha: { start: 1, end: 0.12, ease: 'Quint' },
                    frequency: 32,
                    emitZone: { source: new Phaser.Geom.Rectangle(-6, 0, 12, 1) },
                    frame: 'sparkle_00.png',
                });
                this.particleEmitter.setTint(0xf7ec8a);
                break;
            break
        }
    }

    public destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}