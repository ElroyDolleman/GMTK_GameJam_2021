class GameScene extends Phaser.Scene
{
    private screenTransition:ScreenTransition;
    private levelLoader:LevelLoader;
    private currentLevel:Level;

    public icePlayer:IcePlayer;
    public firePlayer:FirePlayer;
    public startingPlayers: BasePlayer[];

    private isGameOver: boolean = false;

    constructor() {
        super({ key: 'GameScene', active: true});
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

        this.screenTransition = new ScreenTransition(this);

        this.reloadLevel();
    }

    update() {
        InputManager.instance.update();

        this.currentLevel.update();
    }

    reloadLevel() {
        if (this.currentLevel) {
            this.currentLevel.destroy();
        }

        this.isGameOver = false;
        this.startingPlayers = [];

        this.currentLevel = this.levelLoader.create("playground");

        this.icePlayer.getStateMachine().addStateChangedListener(this.icePlayerStateChanged, this);
        this.firePlayer.getStateMachine().addStateChangedListener(this.firePlayerStateChanged, this);

        this.screenTransition.onLevelEnter(() => {
            this.startingPlayers.forEach((player:BasePlayer) => {
                player.wakeUp();
            });
        }, this);
    }

    firePlayerStateChanged(state:PlayerStates) {
        switch(state)  {
            case PlayerStates.Sleep:
                this.icePlayer.wakeUp();
            break;
            case PlayerStates.Dead:
                this.gameOver();
            break;
        }
    }

    icePlayerStateChanged(state:PlayerStates) {
        switch(state)  {
            case PlayerStates.Sleep:
                this.firePlayer.wakeUp();
            break;
            case PlayerStates.Dead:
                this.gameOver();
            break;
        }
    }

    gameOver() {
        if (!this.isGameOver) {
            this.isGameOver = true;

            this.screenTransition.onLevelClose(this.reloadLevel, this);
        }
    }

    draw() {

    }
}