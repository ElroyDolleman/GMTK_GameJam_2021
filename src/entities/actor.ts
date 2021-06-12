abstract class Entity {

    private _hitbox:Phaser.Geom.Rectangle;
    public get hitbox():Phaser.Geom.Rectangle {
        return this._hitbox;
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
    }

    abstract update():void;

    //abstract onCollisionSolved(result:CollisionResult):void
}