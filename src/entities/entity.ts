abstract class Entity implements ICollidable {

    public speed:Phaser.Math.Vector2;
    public solidTileTypes:TileTypes[];
    public damageTileTypes:TileTypes[];

    private _hitbox:Phaser.Geom.Rectangle;
    public get hitbox():Phaser.Geom.Rectangle {
        return this._hitbox;
    }
    public get nextHitbox():Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(
            this.x + this.speed.x * TimeUtil.getElapsed(),
            this.y + this.speed.y * TimeUtil.getElapsed(),
            this.hitbox.width,
            this.hitbox.height
        );
    }

    public get x():number { return this._hitbox.x; }
    public get y():number { return this._hitbox.y; }

    public set x(x:number) { this._hitbox.x = x; }
    public set y(y:number) { this._hitbox.y = y; }

    public get position():Phaser.Math.Vector2 { 
        return new Phaser.Math.Vector2(this.hitbox.x, this.hitbox.y);
    }

    constructor(hitbox:Phaser.Geom.Rectangle) {
        this._hitbox = hitbox;
        this.speed = new Phaser.Math.Vector2();

        this.solidTileTypes = [];
        this.damageTileTypes = [];
    }

    abstract update():void;
    abstract lateUpdate():void;

    public moveX() {
        this._hitbox.x += this.speed.x * TimeUtil.getElapsed();
    }
    public moveY() {
        this._hitbox.y += this.speed.y * TimeUtil.getElapsed();
    }

    abstract destroy():void;

    abstract onCollisionSolved(result:CollisionResult):void
}