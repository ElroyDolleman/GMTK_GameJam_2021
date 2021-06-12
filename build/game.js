class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene', active: true });
    }
    init() {
        this.levelLoader = new LevelLoader(this);
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
    backgroundColor: '#52323a',
    parent: 'GMTK Game Jam 2021',
    title: "GMTK Game Jam 2021",
    version: "0.0.1",
    disableContextMenu: true,
    scene: [GameScene],
};
var game = new Phaser.Game(config);
class CollisionResult {
    constructor() {
        this.onTop = false;
        this.onLeft = false;
        this.onRight = false;
        this.onBottom = false;
        this.tiles = [];
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
    overlapsNonEmptyTile(tile, collidable) {
        return tile.tiletype != TileType.Empty && Phaser.Geom.Rectangle.Overlaps(tile.hitbox, collidable.hitbox);
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
}
let TILE_WIDTH = 16;
let TILE_HEIGHT = 16;
class Entity {
    constructor(hitbox) {
        this._hitbox = hitbox;
        this.speed = new Phaser.Math.Vector2();
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
class CollidableEntity {
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
    constructor() {
        this.playerInputStates = [];
        this.maxStoredInputs = 1 * 60 + 4;
    }
    get defaultPlayerInputsState() {
        return {
            leftFrames: 0,
            rightFrames: 0,
            jumpFrames: 0
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
    }
    update() {
        this.left.update();
        this.right.update();
        this.jump.update();
        this.playerInputStates.push(this.createPlayerState());
        if (this.playerInputStates.length > this.maxStoredInputs) {
            this.playerInputStates.splice(0, 1);
        }
    }
    getPlayerInputState(framesBehind = 0) {
        let index = this.playerInputStates.length - 1 - framesBehind;
        if (index < 0) {
            return this.defaultPlayerInputsState;
        }
        return this.playerInputStates[index];
    }
    createPlayerState() {
        return {
            leftFrames: this.left.heldDownFrames,
            rightFrames: this.right.heldDownFrames,
            jumpFrames: this.jump.heldDownFrames
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
        let level = new Level(this.scene, this.createTilemap(levelJson, tilesetJson));
        let player2 = new BasePlayer(this.scene, new Phaser.Math.Vector2(64, 288), 1 * 60, 'firechar-walk_00.png');
        level.addEntity(player2);
        level.addCollidable(player2);
        let player = new BasePlayer(this.scene, new Phaser.Math.Vector2(64, 288), 0, 'icechar-walk_00.png');
        level.addEntity(player);
        level.addCollidable(player);
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
            let sprite = this.makeSprite(tileId, posX, posY, rotation, levelJson['tileset_name']);
            let tileType = this.getTileType(tilesetJson, tileId);
            let hitbox = new Phaser.Geom.Rectangle(posX, posY, TILE_WIDTH, TILE_HEIGHT);
            tiles.push(new Tile(sprite, tileType, cellX, cellY, posX, posY, hitbox));
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
        if (tileId < 0) {
            return null;
        }
        let sprite = this.scene.add.sprite(posX + TILE_WIDTH / 2, posY + TILE_WIDTH / 2, tilesetName, tileId);
        sprite.setOrigin(0.5, 0.5);
        sprite.setRotation(rotation);
        return sprite;
    }
    getTileType(tilesetJson, tileId) {
        if (tileId < 0) {
            return TileType.Empty;
        }
        let tiletypes = tilesetJson['tiletypes'];
        if (tiletypes['solid'].indexOf(tileId) >= 0) {
            return TileType.Solid;
        }
        return TileType.Empty;
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
}
var TileType;
(function (TileType) {
    TileType[TileType["Empty"] = 0] = "Empty";
    TileType[TileType["Solid"] = 1] = "Solid";
})(TileType || (TileType = {}));
class Tile {
    //private debug:Phaser.GameObjects.Graphics;
    constructor(sprite, tiletype, cellX, cellY, posX, posY, hitbox) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.tiletype = tiletype;
        this.hitbox = hitbox;
        this.sprite = sprite;
        // if (this.sprite) {
        //     this.debug = elroy.add.graphics({ fillStyle: { color: 0xFF, alpha: 1 } });
        //     this.debug.fillRectShape(hitbox);
        // }
    }
    get isSolid() { return this.tiletype == TileType.Solid; }
    makeEmpty() {
        this.tiletype = TileType.Empty;
        this.sprite.destroy();
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
/// <reference path="../entities/entity.ts"/>
var PlayerStates;
/// <reference path="../entities/entity.ts"/>
(function (PlayerStates) {
    PlayerStates[PlayerStates["Idle"] = 0] = "Idle";
    PlayerStates[PlayerStates["Walk"] = 1] = "Walk";
})(PlayerStates || (PlayerStates = {}));
class BasePlayer extends Entity {
    constructor(scene, spawnPosition, inputFramesBehind, anim) {
        super(new Phaser.Geom.Rectangle(spawnPosition.x, spawnPosition.y - 16, 16, 16));
        this.inputFramesBehind = inputFramesBehind;
        this.sprite = scene.add.sprite(0, 0, 'player_sheet', anim);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.x = spawnPosition.x;
        this.sprite.y = spawnPosition.y;
        this.stateMachine = new StateMachine(this);
        this.stateMachine.addState(PlayerStates.Idle, new PlayerIdleState());
        this.stateMachine.addState(PlayerStates.Walk, new PlayerWalkState());
        this.stateMachine.start(PlayerStates.Idle);
    }
    update() {
        this.currentInputState = InputManager.instance.getPlayerInputState(this.inputFramesBehind);
        this.stateMachine.update();
    }
    lateUpdate() {
        this.sprite.setPosition(this.hitbox.centerX, this.hitbox.bottom);
    }
    onCollisionSolved(result) {
    }
    updateMovementControls(maxRunSpeed = 120, runAcceleration = 20) {
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
}
class PlayerGroundedState {
    constructor() { }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
    }
    leave() {
    }
}
class PlayerIdleState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        super.update();
    }
    leave() {
    }
}
class PlayerWalkState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        super.update();
    }
    leave() {
    }
}
class StateMachine {
    constructor(owner) {
        this.currentStateKey = -1;
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