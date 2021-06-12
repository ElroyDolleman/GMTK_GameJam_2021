class GameScene extends Phaser.Scene
{
    private levelLoader:LevelLoader;
    private currentLevel:Level;

    constructor() {
        super({ key: 'GameScene', active: true});
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