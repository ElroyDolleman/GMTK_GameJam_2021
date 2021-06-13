interface ICollidable
{
    solidTileTypes:TileTypes[];
    damageTileTypes:TileTypes[];

    hitbox:Phaser.Geom.Rectangle;
    nextHitbox:Phaser.Geom.Rectangle;
    speed:Phaser.Math.Vector2;

    moveX():void;
    moveY():void;
    onCollisionSolved(result:CollisionResult):void;
}