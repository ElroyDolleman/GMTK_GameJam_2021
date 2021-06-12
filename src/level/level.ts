class Level
{
    public scene:Phaser.Scene;
    public map:Tilemap;
    public entities:Entity[] = [];

    constructor(scene:Phaser.Scene, map:Tilemap) {
        this.map = map;
        this.scene = scene;
    }

    public update() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
    }

    public addEntity(entity:Entity) {
        this.entities.push(entity);
    }

    public destroy() {

    }
}