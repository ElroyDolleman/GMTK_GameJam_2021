class Level
{
    public scene:Phaser.Scene;
    public map:Tilemap;

    constructor(scene:Phaser.Scene, map:Tilemap) {
        this.map = map;
        this.scene = scene;
    }

    public update() {

    }

    public destroy() {

    }
}