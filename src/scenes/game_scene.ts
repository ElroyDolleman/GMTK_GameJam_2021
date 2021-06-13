class GameScene extends Phaser.Scene
{
    private screenTransition:ScreenTransition;
    private levelLoader:LevelLoader;
    private currentLevel:Level;

    public icePlayer:IcePlayer;
    public firePlayer:FirePlayer;
    public startingPlayers:BasePlayer[];

    private isGameOver:boolean = false;
    private currentLevelNumber:number = 4;
    private readonly maxLevelNumber:number = 5;

    constructor() {
        super({ key: 'GameScene', active: true});
    }

    init() {
        this.levelLoader = new LevelLoader(this);
        TimeManager.initialize();
    }

    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.load.atlas('particles_sheet', 'assets/particles_sheet.png', 'assets/particles_sheet.json');

        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }

    create() {
        InputManager.instance.initialize(this);
        this.levelLoader.init();

        this.screenTransition = new ScreenTransition(this);

        this.startLevel(this.currentLevelNumber);
    }

    update() {
        InputManager.instance.update();

        this.currentLevel.update();
    }

    startLevel(levelNum?:number) {
        if (ParticleManager) {
            ParticleManager.destroy();
        }
        ParticleManager = this.add.particles('particles_sheet');
        ParticleManager.setDepth(1);

        if (this.currentLevel) {
            this.currentLevel.destroy();
        }

        this.isGameOver = false;
        this.startingPlayers = [];

        if (levelNum != undefined) {
            this.currentLevelNumber = Math.min(levelNum, this.maxLevelNumber);
        }
        this.currentLevel = this.levelLoader.create("level_" + this.currentLevelNumber);

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
                if (this.icePlayer.isAtGoal && this.firePlayer.isAtGoal) {
                    this.gameOver(true);
                }
                else {
                    this.icePlayer.wakeUp();
                }
            break;
            case PlayerStates.Dead:
                this.gameOver(false);
            break;
        }
    }

    icePlayerStateChanged(state:PlayerStates) {
        switch(state)  {
            case PlayerStates.Sleep:
                if (this.icePlayer.isAtGoal && this.firePlayer.isAtGoal) {
                    this.gameOver(true);
                }
                else {
                    this.firePlayer.wakeUp();
                }
            break;
            case PlayerStates.Dead:
                this.gameOver(false);
            break;
        }
    }

    gameOver(won:boolean) {
        if (!this.isGameOver) {
            this.isGameOver = true;

            this.screenTransition.onLevelClose(() => { this.startLevel(won ? this.currentLevelNumber+1 : this.currentLevelNumber) }, this);
        }
    }

    draw() {

    }
}