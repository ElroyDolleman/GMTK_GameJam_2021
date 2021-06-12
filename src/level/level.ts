class Level
{
    public scene:Phaser.Scene;
    public map:Tilemap;
    public collisionManager:CollisionManager;

    public entities:Entity[] = [];
    public collidables:ICollidable[] = [];

    constructor(scene:Phaser.Scene, map:Tilemap) {
        this.map = map;
        this.scene = scene;
        this.collisionManager = new CollisionManager(this);
    }

    public update() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
        for (let i = 0; i < this.collidables.length; i++) {
            this.collisionManager.moveCollidable(this.collidables[i]);
        }
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].lateUpdate();
        }
    }

    public addCollidable(collidable:ICollidable) {
        this.collidables.push(collidable);
    }
    public addEntity(entity:Entity) {
        this.entities.push(entity);
    }

    public destroy() {

    }
}