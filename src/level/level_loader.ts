const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG   = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG   = 0x20000000;

class LevelLoader {

    private jsonData:any;

    public readonly scene:Phaser.Scene;
    constructor(scene:Phaser.Scene) { 
        this.scene = scene;
    }

    public preloadLevelJson():void {
        this.scene.load.json('levels', 'assets/levels.json');
    }
    public preloadSpritesheets():void {
        this.scene.load.spritesheet('main_tileset', 'assets/tileset.png', { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT });
    }
    public init() {
        this.jsonData = this.scene.cache.json.get('levels');
    }

    public exists(name:string):boolean {
        return this.jsonData[name] != undefined;
    }
    public getName(num:number):string {
        let levelNumString = num < 10 ? '0' + num : num.toString();
        return 'level' + levelNumString;
    }

    public create(name:string):Level {
        let levelJson = this.jsonData[name];
        let tilesetJson = this.jsonData['tilesets_data'][levelJson['tileset_name']];

        let level = new Level(
            this.scene,
            this.createTilemap(levelJson, tilesetJson),
        );
        level.addEntity(new BasePlayer(this.scene, new Phaser.Math.Vector2(100, 100)));

        return level;
    }

    private createTilemap(levelJson:any, tilesetJson:any) {

        let gridCellsX:number = levelJson['gridCellsX'];
        let gridCellsY:number = levelJson['gridCellsY'];

        let tilesData:Array<number> = levelJson['tiles'];

        let tiles:Tile[] = [];

        for (let i = 0; i < tilesData.length; i++) {
            let tileId:number = tilesData[i];

            let rotation:number = 0;
            if (tileId >= FLIPPED_DIAGONALLY_FLAG) {
                rotation = this.getRotation(tileId);
                tileId &= ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);
            }

            let cellX:number = i % gridCellsX;
            let cellY:number = Math.floor(i / gridCellsX);

            let posX:number = cellX * TILE_WIDTH;
            let posY:number = cellY * TILE_HEIGHT;

            let sprite = this.makeSprite(tileId, posX, posY, rotation, levelJson['tileset_name']);
            let tileType = this.getTileType(tilesetJson, tileId);

            let hitbox = new Phaser.Geom.Rectangle(posX, posY, TILE_WIDTH, TILE_HEIGHT);

            tiles.push(new Tile(sprite, tileType, cellX, cellY, posX, posY, hitbox));
        }
        return new Tilemap(tiles, gridCellsX, gridCellsY, TILE_WIDTH, TILE_HEIGHT);
    }

    private getLayers(levelJson:any) {
        return {
            default: levelJson['layers'][0],
            entities: levelJson['entities'][0]
        }
    }

    private makeSprite(tileId:number, posX:number, posY:number, rotation:number, tilesetName:string):Phaser.GameObjects.Sprite {
        if (tileId < 0) {
            return null;
        }
        let sprite = this.scene.add.sprite(posX + TILE_WIDTH / 2, posY + TILE_WIDTH / 2, tilesetName, tileId);
        sprite.setOrigin(0.5, 0.5);
        sprite.setRotation(rotation);
        return sprite;
    }

    private getTileType(tilesetJson:any, tileId:number):TileType {
        if (tileId < 0) {
            return TileType.Empty;
        }

        let tiletypes = tilesetJson['tiletypes'];
        if (tiletypes['solid'].indexOf(tileId) >= 0) {
            return TileType.Solid;
        }

        return TileType.Empty;
    }

    private getRotation(tileId:number):number {
        let flippedH: boolean = (tileId & FLIPPED_HORIZONTALLY_FLAG) > 0;
        let flippedV: boolean = (tileId & FLIPPED_VERTICALLY_FLAG) > 0;
        let flippedD: boolean = (tileId & FLIPPED_DIAGONALLY_FLAG) > 0;

        if (!flippedH && flippedV && flippedD) {
            return 1.5 * Math.PI; //270
        }
        else if (!flippedH && !flippedV && flippedD) {
            return 0.5 * Math.PI; // 90
        }
        else if (flippedV && !flippedD) {
            return Math.PI;
        }
        console.error("the tileId is stored as if it has been rotated/flipped, but the code does not recognize it");
        return 0;
    }
}