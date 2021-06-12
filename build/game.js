class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene', active: true });
    }
    init() {
        this.levelLoader = new LevelLoader(this);
        TimeManager.initialize();
    }
    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }
    create() {
        InputManager.instance.initialize(this);
        this.levelLoader.init();
        this.currentLevel = this.levelLoader.create("playground");
    }
    update() {
        InputManager.instance.update();
        this.currentLevel.update();
    }
    draw() {
    }
}
/// <reference path="../definitions/phaser.d.ts"/>
/// <reference path="scenes/game_scene.ts"/>
var config = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    scaleMode: 3,
    pixelArt: true,
    backgroundColor: '#333333',
    parent: 'GMTK Game Jam 2021',
    title: "GMTK Game Jam 2021",
    version: "0.0.1",
    disableContextMenu: true,
    scene: [GameScene],
};
var game = new Phaser.Game(config);
class TimeManager {
    constructor() { }
    static initialize() {
        this.startTime = new Date();
        this.globalAnimationUpdateInterval = setInterval(this.globalAnimationUpdate.bind(this), 200);
    }
    static getTimeSinceStartup() {
        return Date.now() - this.startTime.getTime();
    }
    static globalAnimationUpdate() {
        this.animationFrame++;
        this.tileAnimations.forEach((anim) => {
            anim.setCurrentFrame(anim.currentAnim.frames[this.animationFrame % 4]);
        });
    }
}
TimeManager.tileAnimations = new Map();
TimeManager.animationFrame = 0;
class CollisionResult {
    constructor() {
        this.onTop = false;
        this.onLeft = false;
        this.onRight = false;
        this.onBottom = false;
        this.tiles = [];
        this.prevTop = 0;
        this.prevLeft = 0;
        this.prevRight = 0;
        this.prevBottom = 0;
        this.isDamaged = false;
    }
}
class CollisionManager {
    constructor(level) {
        this.currentLevel = level;
    }
    moveCollidable(collidable) {
        let result = new CollisionResult();
        let tiles = this.currentLevel.map.getTilesFromRect(collidable.nextHitbox, 2);
        result.tiles = tiles;
        result.prevTop = collidable.hitbox.top;
        result.prevLeft = collidable.hitbox.left;
        result.prevRight = collidable.hitbox.right;
        result.prevBottom = collidable.hitbox.bottom;
        collidable.moveX();
        for (let i = 0; i < tiles.length; i++) {
            if (!this.overlapsNonEmptyTile(tiles[i], collidable)) {
                continue;
            }
            if (tiles[i].isSolid || collidable.solidTileTypes.indexOf(tiles[i].tiletype) >= 0) {
                this.solveHorizontalCollision(tiles[i], collidable, result);
            }
        }
        collidable.moveY();
        for (let i = 0; i < tiles.length; i++) {
            if (!this.overlapsNonEmptyTile(tiles[i], collidable)) {
                continue;
            }
            if (tiles[i].isSemisolid) {
                if (this.isFallingThroughSemisolid(tiles[i], result.prevBottom, collidable.hitbox.bottom)) {
                    result.onBottom = true;
                    collidable.hitbox.y = tiles[i].hitbox.y - collidable.hitbox.height;
                }
            }
            else if (tiles[i].isSolid || collidable.solidTileTypes.indexOf(tiles[i].tiletype) >= 0) {
                this.solveVerticalCollision(tiles[i], collidable, result);
            }
        }
        collidable.onCollisionSolved(result);
        return result;
    }
    overlapsNonEmptyTile(tile, collidable) {
        return tile.tiletype != TileTypes.Empty && Phaser.Geom.Rectangle.Overlaps(tile.hitbox, collidable.hitbox);
    }
    solveHorizontalCollision(tile, collidable, result) {
        if (collidable.speed.x > 0) {
            result.onRight = true;
            collidable.hitbox.x = tile.hitbox.x - collidable.hitbox.width;
        }
        else if (collidable.speed.x < 0) {
            result.onLeft = true;
            collidable.hitbox.x = tile.hitbox.right;
        }
    }
    solveVerticalCollision(tile, collidable, result) {
        if (collidable.speed.y > 0) {
            result.onBottom = true;
            collidable.hitbox.y = tile.hitbox.y - collidable.hitbox.height;
        }
        else if (collidable.speed.y < 0) {
            result.onTop = true;
            collidable.hitbox.y = tile.hitbox.bottom;
        }
    }
    isFallingThroughSemisolid(semisolidTile, prevBottom, currentBottom) {
        return prevBottom <= semisolidTile.hitbox.top && currentBottom >= semisolidTile.hitbox.top;
    }
}
class CollisionUtil {
    constructor() { }
    static hitboxVerticallyAligned(topHitbox, bottomHitbox, margin = 0) {
        if (bottomHitbox.top == topHitbox.bottom) {
            return topHitbox.right > bottomHitbox.left && topHitbox.left < bottomHitbox.right;
        }
        return false;
    }
    static hitboxHorizontallyAligned(leftHitbox, rightHitbox, margin = 0) {
        if (leftHitbox.right == rightHitbox.left) {
            return leftHitbox.bottom > rightHitbox.top && leftHitbox.top < rightHitbox.bottom;
        }
        return false;
    }
    static hitboxesAligned(hitbox1, hitbox2) {
        return CollisionUtil.hitboxVerticallyAligned(hitbox1, hitbox2) ||
            CollisionUtil.hitboxVerticallyAligned(hitbox2, hitbox1) ||
            CollisionUtil.hitboxHorizontallyAligned(hitbox1, hitbox2) ||
            CollisionUtil.hitboxHorizontallyAligned(hitbox2, hitbox1);
    }
}
let TILE_WIDTH = 16;
let TILE_HEIGHT = 16;
class Entity {
    constructor(hitbox) {
        this._hitbox = hitbox;
        this.speed = new Phaser.Math.Vector2();
        this.solidTileTypes = [];
    }
    get hitbox() {
        return this._hitbox;
    }
    get nextHitbox() {
        return new Phaser.Geom.Rectangle(this.x + this.speed.x * TimeUtil.getElapsed(), this.y + this.speed.y * TimeUtil.getElapsed(), this.hitbox.width, this.hitbox.height);
    }
    get x() { return this._hitbox.x; }
    get y() { return this._hitbox.y; }
    set x(x) { this._hitbox.x = x; }
    set y(y) { this._hitbox.y = y; }
    get position() {
        return new Phaser.Math.Vector2(this.hitbox.x, this.hitbox.y);
    }
    moveX() {
        this._hitbox.x += this.speed.x * TimeUtil.getElapsed();
    }
    moveY() {
        this._hitbox.y += this.speed.y * TimeUtil.getElapsed();
    }
}
class Input {
    constructor(key) {
        this.key = key;
    }
    get heldDownFrames() {
        return this._heldDownFrames;
    }
    get isDown() {
        return this._heldDownFrames > 0;
    }
    get justDown() {
        return this._heldDownFrames == 1;
    }
    get justReleased() {
        return this.prevHeldDownFrames > 0 && this._heldDownFrames == 0;
    }
    update() {
        this.prevHeldDownFrames = this._heldDownFrames;
        if (this.key.isDown) {
            this._heldDownFrames++;
        }
        else {
            this._heldDownFrames = 0;
        }
    }
}
class InputManager {
    constructor() { }
    // private playerInputStates:PlayerInputsState[] = [];
    // private maxStoredInputs:number = 1*60 + 4;
    get defaultPlayerInputsState() {
        return {
            leftFrames: 0,
            rightFrames: 0,
            jumpFrames: 0,
            downFrames: 0
        };
    }
    static get instance() {
        if (!InputManager._instance) {
            InputManager._instance = new InputManager();
        }
        return InputManager._instance;
    }
    initialize(scene) {
        this.left = new Input(scene.input.keyboard.addKey('left'));
        this.right = new Input(scene.input.keyboard.addKey('right'));
        this.jump = new Input(scene.input.keyboard.addKey('up'));
        this.down = new Input(scene.input.keyboard.addKey('down'));
    }
    update() {
        this.left.update();
        this.right.update();
        this.jump.update();
        this.down.update();
        // this.playerInputStates.push(this.createPlayerState());
        // if (this.playerInputStates.length > this.maxStoredInputs) {
        //     this.playerInputStates.splice(0, 1);
        // }
        this.playerInputState = this.createPlayerState();
    }
    // public getPlayerInputState(/*framesBehind:number = 0*/):PlayerInputsState {
    //     // let index = this.playerInputStates.length - 1 - framesBehind;
    //     // if (index < 0) {
    //     //     return this.defaultPlayerInputsState;
    //     // }
    //     // return this.playerInputStates[index];
    // }
    createPlayerState() {
        return {
            leftFrames: this.left.heldDownFrames,
            rightFrames: this.right.heldDownFrames,
            jumpFrames: this.jump.heldDownFrames,
            downFrames: this.down.heldDownFrames
        };
    }
}
class Level {
    constructor(scene, map) {
        this.entities = [];
        this.collidables = [];
        this.map = map;
        this.scene = scene;
        this.collisionManager = new CollisionManager(this);
    }
    update() {
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
    addCollidable(collidable) {
        this.collidables.push(collidable);
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    destroy() {
    }
}
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
class LevelLoader {
    constructor(scene) {
        this.scene = scene;
    }
    preloadLevelJson() {
        this.scene.load.json('levels', 'assets/levels.json');
    }
    preloadSpritesheets() {
        this.scene.load.spritesheet('main_tileset', 'assets/tileset.png', { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT });
    }
    init() {
        this.jsonData = this.scene.cache.json.get('levels');
    }
    exists(name) {
        return this.jsonData[name] != undefined;
    }
    getName(num) {
        let levelNumString = num < 10 ? '0' + num : num.toString();
        return 'level' + levelNumString;
    }
    create(name) {
        let levelJson = this.jsonData[name];
        let tilesetJson = this.jsonData['tilesets_data'][levelJson['tileset_name']];
        TilesetManager.tilesetJson = tilesetJson;
        TilesetManager.tilesetName = levelJson['tileset_name'];
        let iceSpawn = levelJson['ice_spawn'];
        let fireSpawn = levelJson['fire_spawn'];
        let fireCharState = fireSpawn.sleep ? PlayerStates.Sleep : PlayerStates.Idle;
        let iceCharState = iceSpawn.sleep ? PlayerStates.Sleep : PlayerStates.Idle;
        let level = new Level(this.scene, this.createTilemap(levelJson, tilesetJson));
        let firePlayer = new FirePlayer(this.scene, new Phaser.Math.Vector2(fireSpawn.x, fireSpawn.y + 16), fireCharState);
        level.addEntity(firePlayer);
        level.addCollidable(firePlayer);
        let icePlayer = new IcePlayer(this.scene, new Phaser.Math.Vector2(iceSpawn.x, iceSpawn.y + 16), iceCharState);
        level.addEntity(icePlayer);
        level.addCollidable(icePlayer);
        icePlayer.getStateMachine().addStateChangedListener(PlayerStates.Sleep, firePlayer.wakeUp, firePlayer);
        firePlayer.getStateMachine().addStateChangedListener(PlayerStates.Sleep, icePlayer.wakeUp, icePlayer);
        return level;
    }
    createTilemap(levelJson, tilesetJson) {
        let gridCellsX = levelJson['gridCellsX'];
        let gridCellsY = levelJson['gridCellsY'];
        let tilesData = levelJson['tiles'];
        let tiles = [];
        for (let i = 0; i < tilesData.length; i++) {
            let tileId = tilesData[i];
            let rotation = 0;
            if (tileId >= FLIPPED_DIAGONALLY_FLAG) {
                rotation = this.getRotation(tileId);
                tileId &= ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);
            }
            let cellX = i % gridCellsX;
            let cellY = Math.floor(i / gridCellsX);
            let posX = cellX * TILE_WIDTH;
            let posY = cellY * TILE_HEIGHT;
            let sprite = null;
            if (tileId >= 0) {
                sprite = this.makeSprite(tileId, posX, posY, rotation, levelJson['tileset_name']);
            }
            let tileType = TilesetManager.getTileTypeFromID(tileId);
            let hitboxData = tilesetJson['customHitboxes'][tileId.toString()];
            let hitbox = this.getTileHitbox(hitboxData, posX, posY, rotation);
            tiles.push(new Tile(sprite, tileType, tileId, cellX, cellY, posX, posY, hitbox));
        }
        return new Tilemap(tiles, gridCellsX, gridCellsY, TILE_WIDTH, TILE_HEIGHT);
    }
    getLayers(levelJson) {
        return {
            default: levelJson['layers'][0],
            entities: levelJson['entities'][0]
        };
    }
    makeSprite(tileId, posX, posY, rotation, tilesetName) {
        let sprite = this.scene.add.sprite(posX + TILE_WIDTH / 2, posY + TILE_WIDTH / 2, tilesetName, tileId);
        sprite.setOrigin(0.5, 0.5);
        sprite.setRotation(rotation);
        return sprite;
    }
    getRotation(tileId) {
        let flippedH = (tileId & FLIPPED_HORIZONTALLY_FLAG) > 0;
        let flippedV = (tileId & FLIPPED_VERTICALLY_FLAG) > 0;
        let flippedD = (tileId & FLIPPED_DIAGONALLY_FLAG) > 0;
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
    getTileHitbox(hitboxData, posX, posY, rotation) {
        let width = TILE_WIDTH;
        let height = TILE_HEIGHT;
        let hitbox = new Phaser.Geom.Rectangle(posX, posY, width, height);
        if (!hitboxData)
            return hitbox;
        if (hitboxData['x'])
            hitbox.x += hitboxData['x'];
        if (hitboxData['y'])
            hitbox.y += hitboxData['y'];
        if (hitboxData['width'])
            hitbox.width = hitboxData['width'];
        if (hitboxData['height'])
            hitbox.height = hitboxData['height'];
        return this.rotateTileHitbox(hitbox, rotation);
    }
    rotateTileHitbox(hitbox, rotation) {
        if (rotation == 0)
            return hitbox;
        let offsetY = TILE_HEIGHT - hitbox.height;
        let degree = Phaser.Math.RadToDeg(rotation);
        switch (degree) {
            case -90:
            case 270:
                hitbox.x += offsetY;
                hitbox.width = TILE_HEIGHT - offsetY;
                hitbox.y -= offsetY;
                hitbox.height = TILE_HEIGHT;
                break;
            case 90:
            case -270:
                hitbox.width = TILE_HEIGHT - offsetY;
                hitbox.y -= offsetY;
                hitbox.height = TILE_HEIGHT;
                break;
            case 180:
            case -180:
                hitbox.y -= offsetY;
                break;
        }
        return hitbox;
    }
}
var TileTypes;
(function (TileTypes) {
    TileTypes[TileTypes["Empty"] = 0] = "Empty";
    TileTypes[TileTypes["Solid"] = 1] = "Solid";
    TileTypes[TileTypes["SemiSolid"] = 2] = "SemiSolid";
    TileTypes[TileTypes["Grass"] = 3] = "Grass";
    TileTypes[TileTypes["Ice"] = 4] = "Ice";
    TileTypes[TileTypes["Fire"] = 5] = "Fire";
    TileTypes[TileTypes["Water"] = 6] = "Water";
    TileTypes[TileTypes["Torch"] = 7] = "Torch";
    TileTypes[TileTypes["GoldTorch"] = 8] = "GoldTorch";
})(TileTypes || (TileTypes = {}));
const MappedTileTypes = new Map([
    [TileTypes.Ice, 9],
    [TileTypes.Grass, 23],
    [TileTypes.Fire, 25],
    [TileTypes.Water, 36],
]);
class Tile {
    //private debug:Phaser.GameObjects.Graphics;
    constructor(sprite, tiletype, tileId, cellX, cellY, posX, posY, hitbox) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.tileId = tileId;
        this.tiletype = tiletype;
        this.originalTiletype = tiletype;
        this.hitbox = hitbox;
        this.sprite = sprite;
        if (tileId > 0) {
            TilesetManager.startTileAnimation(this, tileId);
        }
        // if (this.sprite) {
        //     this.debug = elroy.add.graphics({ fillStyle: { color: 0xFF, alpha: 1 } });
        //     this.debug.fillRectShape(hitbox);
        // }
    }
    get id() { return this.cellX.toString() + this.cellY.toString(); }
    get isSemisolid() { return this.tiletype == TileTypes.SemiSolid || this.tiletype == TileTypes.Torch || this.tiletype == TileTypes.GoldTorch; }
    get isSolid() { return this.tiletype == TileTypes.Solid || this.tiletype == TileTypes.Ice; }
    get canStandOn() { return this.isSolid || this.isSemisolid; }
    makeEmpty() {
        this.tiletype = TileTypes.Empty;
        this.sprite.destroy();
    }
    changeTileId(newTileId) {
        this.sprite.setFrame(newTileId);
        this.tileId = newTileId;
    }
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
class Tilemap {
    constructor(tiles, gridCellsX, gridCellsY, tileWidth, tileHeight) {
        this.tiles = tiles;
        this.gridCellsX = gridCellsX;
        this.gridCellsY = gridCellsY;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }
    getTile(cellX, cellY) {
        return this.tiles[cellX + (cellY * this.gridCellsX)];
    }
    getTilesFromRect(rect, margin = 0) {
        return this.getTilesFromTo(this.toGridLocation(rect.x - margin, rect.y - margin), this.toGridLocation(rect.right + margin, rect.bottom + margin));
    }
    getTilesFromCircle(circle, margin = 0) {
        return this.getTilesFromTo(this.toGridLocation(circle.left - margin, circle.top - margin), this.toGridLocation(circle.right + margin, circle.bottom + margin));
    }
    getTilesFromTo(from, to) {
        let tiles = [];
        for (let x = from.x; x <= to.x; x++) {
            for (let y = from.y; y <= to.y; y++) {
                let tile = this.getTile(x, y);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }
    getTileNextTo(tile, x, y) {
        return this.getTile(tile.cellX + x, tile.cellY + y);
    }
    worldToTile(x, y) {
        return this.getTile(this.tocellXumn(x), this.tocellY(y));
    }
    tocellXumn(xPos) {
        return Math.floor(xPos / this.tileWidth);
    }
    tocellY(yPos) {
        return Math.floor(yPos / this.tileHeight);
    }
    toGridLocation(x, y) {
        return new Phaser.Geom.Point(this.tocellXumn(x), this.tocellY(y));
    }
    toWorldX(cellXumn) {
        return cellXumn * this.tileWidth;
    }
    toWorldY(cellY) {
        return cellY * this.tileHeight;
    }
    toWorldPosition(cellX, cellY) {
        return new Phaser.Geom.Point(this.toWorldX(cellX), this.toWorldY(cellY));
    }
    destroy() {
        while (this.tiles.length > 0) {
            this.tiles[0].destroy();
            this.tiles.splice(0, 1);
        }
    }
}
class TilesetManager {
    constructor() { }
    static getTileTypeFromID(tileId) {
        if (tileId < 0) {
            return TileTypes.Empty;
        }
        let tiletypes = this.tilesetJson['tiletypes'];
        if (tiletypes['solid'].indexOf(tileId) >= 0) {
            return TileTypes.Solid;
        }
        if (tiletypes['semisolid'].indexOf(tileId) >= 0) {
            return TileTypes.SemiSolid;
        }
        if (tiletypes['ice'].indexOf(tileId) >= 0) {
            return TileTypes.Ice;
        }
        if (tiletypes['water'].indexOf(tileId) >= 0) {
            return TileTypes.Water;
        }
        if (tiletypes['grass'].indexOf(tileId) >= 0) {
            return TileTypes.Grass;
        }
        if (tiletypes['fire'].indexOf(tileId) >= 0) {
            return TileTypes.Fire;
        }
        if (tiletypes['torch'].indexOf(tileId) >= 0) {
            return TileTypes.Torch;
        }
        if (tiletypes['goldtorch'].indexOf(tileId) >= 0) {
            return TileTypes.GoldTorch;
        }
        return TileTypes.Empty;
    }
    /**
     * Start a repeating tile animation
     * @param sprite
     * @param tileId
     * @returns
     */
    static startTileAnimation(tile, tileId) {
        if (this.tilesetJson['animations'][tileId] === undefined) {
            if (tile.sprite.anims.isPlaying) {
                tile.sprite.stop();
            }
            if (TimeManager.tileAnimations.has(tile.id)) {
                TimeManager.tileAnimations.delete(tile.id);
            }
            return;
        }
        let amountOfFrames = this.tilesetJson['animations'][tileId];
        let key = 'tile' + tileId;
        let frames = tile.sprite.anims.generateFrameNumbers(this.tilesetName, { start: tileId, end: tileId + amountOfFrames - 1 });
        tile.sprite.anims.create({
            key: key,
            frames: frames,
            frameRate: 0,
            repeat: -1
        });
        tile.sprite.play(key);
        TimeManager.tileAnimations.set(tile.id, tile.sprite.anims);
    }
    static changeTileType(tile, tileType) {
        tile.tiletype = tileType;
        let tileId = MappedTileTypes.get(tileType);
        tile.changeTileId(tileId);
        this.startTileAnimation(tile, tileId);
    }
    /**
     * Play single tile animation
     * @param sprite
     * @param tileId
     * @returns
     */
    static playAnimationOnTile(tile, frames, onDone) {
        if (tile.sprite.anims.isPlaying) {
            tile.sprite.stop();
            tile.sprite.anims.remove('tile' + tile.tileId);
        }
        let key = 'tile' + tile.tileId;
        tile.sprite.anims.create({
            key: key,
            frames: tile.sprite.anims.generateFrameNumbers(this.tilesetName, { start: tile.tileId, end: tile.tileId + frames - 1 }),
            frameRate: 10,
            repeat: 0
        });
        tile.sprite.play(key);
        tile.sprite.once('animationcomplete', onDone);
    }
}
/// <reference path="../entities/entity.ts"/>
var PlayerStates;
/// <reference path="../entities/entity.ts"/>
(function (PlayerStates) {
    PlayerStates[PlayerStates["Idle"] = 0] = "Idle";
    PlayerStates[PlayerStates["Walk"] = 1] = "Walk";
    PlayerStates[PlayerStates["Fall"] = 2] = "Fall";
    PlayerStates[PlayerStates["Jump"] = 3] = "Jump";
    PlayerStates[PlayerStates["Crouch"] = 4] = "Crouch";
    PlayerStates[PlayerStates["Sleep"] = 5] = "Sleep";
})(PlayerStates || (PlayerStates = {}));
class BasePlayer extends Entity {
    constructor(scene, spawnPosition, startingState, anim) {
        super(new Phaser.Geom.Rectangle(spawnPosition.x + 3, spawnPosition.y - 14, 10, 14));
        this.sprite = scene.add.sprite(0, 0, 'player_sheet', anim);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.x = spawnPosition.x;
        this.sprite.y = spawnPosition.y;
        this.stateMachine = new StateMachine(this);
        this.stateMachine.addState(PlayerStates.Idle, new PlayerIdleState());
        this.stateMachine.addState(PlayerStates.Walk, new PlayerWalkState());
        this.stateMachine.addState(PlayerStates.Fall, new PlayerFallState());
        this.stateMachine.addState(PlayerStates.Jump, new PlayerJumpState());
        this.stateMachine.addState(PlayerStates.Crouch, new PlayerCrouchState());
        this.stateMachine.addState(PlayerStates.Sleep, new PlayerSleepState());
        this.stateMachine.start(startingState);
    }
    update() {
        this.currentInputState = InputManager.instance.playerInputState;
        this.stateMachine.update();
    }
    wakeUp() {
        console.log("wakey wakey");
        if (this.stateMachine.currentStateKey == PlayerStates.Sleep) {
            this.stateMachine.changeState(PlayerStates.Idle);
        }
    }
    lateUpdate() {
        this.sprite.setPosition(this.hitbox.centerX, this.hitbox.bottom);
    }
    onCollisionSolved(result) {
        this.stateMachine.currentState.onCollisionSolved(result);
    }
    updateMovementControls(maxRunSpeed = PlayerStats.RunSpeed, runAcceleration = PlayerStats.RunAcceleration) {
        if (this.currentInputState.leftFrames > 0) {
            if (this.speed.x > -maxRunSpeed) {
                this.speed.x = Math.max(this.speed.x - runAcceleration, -maxRunSpeed);
            }
            else if (this.speed.x < -maxRunSpeed) {
                this.speed.x = Math.min(this.speed.x + runAcceleration, -maxRunSpeed);
            }
        }
        else if (this.currentInputState.rightFrames > 0) {
            if (this.speed.x < maxRunSpeed) {
                this.speed.x = Math.min(this.speed.x + runAcceleration, maxRunSpeed);
            }
            else if (this.speed.x > maxRunSpeed) {
                this.speed.x = Math.max(this.speed.x - runAcceleration, maxRunSpeed);
            }
        }
        else {
            this.decelerate(runAcceleration);
        }
    }
    decelerate(deceleration) {
        if (Math.abs(this.speed.x) < deceleration) {
            this.speed.x = 0;
        }
        else {
            this.speed.x -= deceleration * NumberUtil.sign(this.speed.x);
        }
    }
    getStateMachine() {
        return this.stateMachine;
    }
}
class FirePlayer extends BasePlayer {
    constructor(scene, spawnPosition, startingState) {
        super(scene, spawnPosition, startingState, 'firechar-walk_00.png');
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileTypes.Ice) {
                if (CollisionUtil.hitboxesAligned(result.tiles[i].hitbox, this.hitbox)) {
                    if (!result.tiles[i].sprite.anims.isPlaying) {
                        TilesetManager.playAnimationOnTile(result.tiles[i], 5, () => {
                            if (result.tiles[i].originalTiletype == TileTypes.Ice) {
                                result.tiles[i].makeEmpty();
                            }
                            else {
                                TilesetManager.changeTileType(result.tiles[i], result.tiles[i].originalTiletype);
                            }
                        });
                    }
                }
            }
            else if (result.tiles[i].tiletype == TileTypes.Grass) {
                if (Phaser.Geom.Rectangle.Overlaps(result.tiles[i].hitbox, this.hitbox)) {
                    TilesetManager.changeTileType(result.tiles[i], TileTypes.Fire);
                }
            }
        }
    }
}
class IcePlayer extends BasePlayer {
    constructor(scene, spawnPosition, startingState) {
        super(scene, spawnPosition, startingState, 'icechar-walk_00.png');
        this.solidTileTypes.push(TileTypes.Water);
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileTypes.Water) {
                if (CollisionUtil.hitboxVerticallyAligned(this.hitbox, result.tiles[i].hitbox)) {
                    TilesetManager.changeTileType(result.tiles[i], TileTypes.Ice);
                }
            }
        }
    }
}
var PlayerStats;
(function (PlayerStats) {
    PlayerStats.JumpPower = 16;
    PlayerStats.InitialJumpPower = 198;
    PlayerStats.RunAcceleration = 20;
    PlayerStats.RunSpeed = 110;
    PlayerStats.Gravity = 16;
    PlayerStats.MaxFallSpeed = 240;
})(PlayerStats || (PlayerStats = {}));
class PlayerAirborneState {
    constructor() { }
    enter() {
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
        if (result.onBottom) {
            this.onLand();
        }
        else if (result.onTop) {
            this.headbonk();
        }
    }
    updateGravity(gravity = PlayerStats.Gravity, maxFallSpeed = PlayerStats.MaxFallSpeed) {
        if (this.machine.owner.speed.y < maxFallSpeed) {
            this.machine.owner.speed.y = Math.min(this.machine.owner.speed.y + gravity, maxFallSpeed);
        }
    }
    onLand() {
        this.machine.owner.speed.y = 0;
        let state = this.machine.owner.speed.x == 0 ? PlayerStates.Idle : PlayerStates.Walk;
        this.machine.changeState(state);
    }
    headbonk() {
        this.machine.owner.speed.y = 0;
    }
}
class PlayerGroundedState {
    constructor() { }
    enter() {
    }
    update() {
        if (this.machine.owner.currentInputState.jumpFrames == 1) {
            this.machine.changeState(PlayerStates.Jump);
        }
        else if (this.machine.owner.currentInputState.downFrames == 1) {
            this.machine.changeState(PlayerStates.Crouch);
        }
    }
    leave() {
    }
    onCollisionSolved(result) {
        if (!this.hasGroundUnderneath(result.tiles)) {
            this.machine.changeState(PlayerStates.Fall);
        }
    }
    hasGroundUnderneath(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            if (!tiles[i].canStandOn) {
                continue;
            }
            if (this.isStandingOnTile(tiles[i])) {
                return true;
            }
        }
        return false;
    }
    isStandingOnTile(tile) {
        return CollisionUtil.hitboxVerticallyAligned(this.machine.owner.hitbox, tile.hitbox);
    }
}
/// <reference path="./player_grounded_state.ts"/>
class PlayerCrouchState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
        this.machine.owner.speed.x = 0;
    }
    update() {
        if (this.machine.owner.currentInputState.downFrames == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }
    }
    leave() {
    }
    onCollisionSolved(result) {
        if (this.hasTorchUnderneath(result.tiles)) {
            this.machine.changeState(PlayerStates.Sleep);
        }
    }
    hasTorchUnderneath(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i].tiletype != TileTypes.Torch && tiles[i].tiletype != TileTypes.GoldTorch) {
                continue;
            }
            if (this.isStandingOnTile(tiles[i])) {
                return true;
            }
        }
        return false;
    }
}
class PlayerFallState extends PlayerAirborneState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
        this.updateGravity();
    }
    leave() {
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
    }
}
class PlayerIdleState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x != 0) {
            this.machine.changeState(PlayerStates.Walk);
        }
        super.update();
    }
    leave() {
    }
}
class PlayerJumpState extends PlayerAirborneState {
    constructor() {
        super();
    }
    //private startJumpHeldDownFrames:number;
    get jumpHeldDownFrames() { return this.machine.owner.currentInputState.jumpFrames /* - this.startJumpHeldDownFrames*/; }
    enter() {
        this.isHoldingJump = true;
        this.machine.owner.speed.y -= PlayerStats.InitialJumpPower;
        //this.startJumpHeldDownFrames = this.machine.owner.currentInputState.jumpFrames;
    }
    update() {
        //TODO: Change air accel?
        this.machine.owner.updateMovementControls(PlayerStats.RunSpeed);
        if (this.isHoldingJump && this.jumpHeldDownFrames > 1 && this.jumpHeldDownFrames < 12) {
            this.machine.owner.speed.y -= PlayerStats.JumpPower;
        }
        else if (this.machine.owner.currentInputState.jumpFrames == 0) {
            this.isHoldingJump = false;
        }
        this.updateGravity();
        if (this.machine.owner.speed.y >= 0) {
            this.machine.changeState(PlayerStates.Fall);
        }
    }
    leave() {
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
    }
}
class PlayerSleepState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
    }
}
class PlayerWalkState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }
        super.update();
    }
    leave() {
    }
}
class StateMachine {
    constructor(owner) {
        this.currentStateKey = -1;
        this.onStateChanged = new Phaser.Events.EventEmitter();
        this.owner = owner;
        this.states = new Map();
    }
    get currentState() { return this.states.get(this.currentStateKey); }
    start(firstState) {
        this.currentStateKey = firstState;
    }
    update() {
        this.currentState.update();
    }
    addState(key, state) {
        state.machine = this;
        this.states.set(key, state);
    }
    changeState(key) {
        this.currentState.leave();
        this.currentStateKey = key;
        this.currentState.enter();
        this.onStateChanged.emit(key.toString());
    }
    addStateChangedListener(stateKey, event, context) {
        this.onStateChanged.addListener(stateKey.toString(), event, context);
    }
}
var NumberUtil;
(function (NumberUtil) {
    /**
     * Returns an integer that indicates the sign of a number.
     */
    function sign(value) {
        return value == 0 ? 0 : value > 0 ? 1 : -1;
    }
    NumberUtil.sign = sign;
    function lerp(start, stop, amount) {
        if (amount > 1) {
            amount = 1;
        }
        else if (amount < 0) {
            amount = 0;
        }
        return start + (stop - start) * amount;
    }
    NumberUtil.lerp = lerp;
})(NumberUtil || (NumberUtil = {}));
class TimeUtil {
    constructor() {
    }
    static getElapsed() {
        return this.currentElapsedMS / 1000;
    }
    static getElapsedMS() {
        return this.currentElapsedMS;
    }
}
TimeUtil.currentElapsedMS = (1 / 60) * 1000;
//# sourceMappingURL=game.js.map