

class BasePlayerView {

    public player:BasePlayer;
    public sprite:Phaser.GameObjects.Sprite;
    public animator:Animator;
    readonly playerName:string;

    private readonly animationNames:Map<number, string> = new Map<number, string>([
        [PlayerStates.Idle, 'idle'],
        [PlayerStates.Walk, 'walk'],
        [PlayerStates.Jump, 'jump'],
        [PlayerStates.Fall, 'fall'],
        [PlayerStates.Crouch, 'crouch'],
        [PlayerStates.Sleep, 'sleep'],
    ]);
    private readonly textureKey:string = 'player_sheet';

    public constructor(playerName:string) {
        this.playerName = playerName;
    }

    public createAnimator(scene:Phaser.Scene, player:BasePlayer) {
        this.player = player;

        this.sprite = scene.add.sprite(0, 0, this.textureKey, this.playerName + '-idle_00.png');
        this.sprite.setOrigin(0.5, 1);

        this.animator = new Animator(scene, this.sprite, this.player)

        this.createStateAnimation(PlayerStates.Idle);
        this.createStateAnimation(PlayerStates.Walk);
        this.createStateAnimation(PlayerStates.Jump);
        this.createStateAnimation(PlayerStates.Fall);
        this.createStateAnimation(PlayerStates.Crouch);
        this.createStateAnimation(PlayerStates.Sleep);

        this.changeStateAnimation(player.getStateMachine().currentStateKey);

        this.player.getStateMachine().addStateChangedListener(this.changeStateAnimation, this);
    }

    public update() {
        if (this.player.speed.x > 0) {
            this.animator.facingDirection = 1;
        } else if (this.player.speed.x < 0) {
            this.animator.facingDirection = -1;
        }

        this.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.bottom);
        this.animator.update();
    }

    private createStateAnimation(state:PlayerStates) {
        let key = this.animationNames.get(state);
        console.log(this.playerName + key);
        this.animator.createAnimation(this.playerName + key, this.textureKey, this.playerName + '-' + key + '_', 4);
    }

    public changeStateAnimation(state:PlayerStates) {
        this.animator.changeAnimation(this.playerName + this.animationNames.get(state));
    }
}