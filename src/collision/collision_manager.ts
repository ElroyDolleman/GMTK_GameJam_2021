class CollisionResult {
    onTop:boolean = false;
    onLeft:boolean = false;
    onRight:boolean = false;
    onBottom:boolean = false;
    tiles:Tile[] = [];
}

class CollisionManager {

    private currentLevel:Level;
    constructor(level:Level) {
        this.currentLevel = level;
    }

    public moveCollidable(collidable:ICollidable):any {
        let result:CollisionResult = new CollisionResult();
        let tiles = this.currentLevel.map.getTilesFromRect(collidable.nextHitbox, 2);

        result.tiles = tiles;

        collidable.moveX();
        for (let i = 0; i < tiles.length; i++) {

            if (!this.overlapsNonEmptyTile(tiles[i], collidable)) {
                continue;
            }

            if (tiles[i].isSolid) {
                this.solveHorizontalCollision(tiles[i], collidable, result);
            }
        }

        collidable.moveY();
        for (let i = 0; i < tiles.length; i++) {

            if (!this.overlapsNonEmptyTile(tiles[i], collidable)) {
                continue;
            }

            else if (tiles[i].isSolid) {
                this.solveVerticalCollision(tiles[i], collidable, result);
            }
        }

        collidable.onCollisionSolved(result);
        return result;
    }

    private overlapsNonEmptyTile(tile:Tile, collidable:ICollidable) {
        return tile.tiletype != TileType.Empty && Phaser.Geom.Rectangle.Overlaps(tile.hitbox, collidable.hitbox);
    }

    private solveHorizontalCollision(tile:Tile, collidable:ICollidable, result:CollisionResult) {
        if (collidable.speed.x > 0) {
            result.onRight = true;
            collidable.hitbox.x = tile.hitbox.x - collidable.hitbox.width;
        }
        else if (collidable.speed.x < 0) {
            result.onLeft = true;
            collidable.hitbox.x = tile.hitbox.right;
        }
    }

    private solveVerticalCollision(tile:Tile, collidable:ICollidable, result:CollisionResult) {
        if (collidable.speed.y > 0) {
            result.onBottom = true;
            collidable.hitbox.y = tile.hitbox.y - collidable.hitbox.height;
        }
        else if (collidable.speed.y < 0) {
            result.onTop = true;
            collidable.hitbox.y = tile.hitbox.bottom;
        }
    }
}