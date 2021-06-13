

class BasePlayerView {

    public player:BasePlayer;
    public sprite:Phaser.GameObjects.Sprite;
    public animator:Animator;

    readonly playerName:string;
    readonly color:number;

    public dustEmitter:Phaser.GameObjects.Particles.ParticleEmitter;
    public flameEmitter:Phaser.GameObjects.Particles.ParticleEmitter;
    private flamePosOffset:number = 0;

    private keyDownAnimator:Animator;

    private readonly animationNames:Map<number, string> = new Map<number, string>([
        [PlayerStates.Idle, 'idle'],
        [PlayerStates.Walk, 'walk'],
        [PlayerStates.Jump, 'jump'],
        [PlayerStates.Fall, 'fall'],
        [PlayerStates.Crouch, 'crouch'],
        [PlayerStates.Sleep, 'sleep'],
        [PlayerStates.Dead, 'dead'],
    ]);
    private readonly textureKey:string = 'player_sheet';

    public constructor(playerName:string, color:number) {
        this.playerName = playerName;
        this.color = color;
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
        this.createStateAnimation(PlayerStates.Dead, 5, 10, 0);

        // Win animation
        let key = 'goal';
        this.animator.createAnimation(this.playerName + key, this.textureKey, this.playerName + '-' + key + '_', 4);

        this.changeStateAnimation(player.getStateMachine().currentStateKey);

        this.player.getStateMachine().addStateChangedListener(this.changeStateAnimation, this);

        let keyDownSprite = scene.add.sprite(0, 0, 'tutorial_sheet', 'key-down_00.png');
        keyDownSprite.setAlpha(0);

        this.keyDownAnimator = new Animator(scene, keyDownSprite, null);
        this.keyDownAnimator.createAnimation('keydown', 'tutorial_sheet', 'key-down_', 2, 4, -1);
    }

    public createParticlesSystems(scene:Phaser.Scene) {
        let dustFrameNames = scene.anims.generateFrameNames('particles_sheet', { 
            prefix: 'dust_',
            suffix: '.png',
            end: 4,
            zeroPad: 2
        });
        let dustFrames:string[] = [];
        dustFrameNames.forEach((e) => { dustFrames.push(e.frame.toString()); });

        this.dustEmitter = ParticleManager.createEmitter({
            x: 0,
            y: 0,
            lifespan: { min: 300, max: 340 },
            speed: { min: 4, max: 6 },
            angle: 270,
            frequency: -1,
            emitZone: { source: new Phaser.Geom.Rectangle(-2, -2, 4, 0) },
            frame: dustFrames,
        });
        this.dustEmitter.setTint(this.color);

        this.flameEmitter = ParticleManager.createEmitter({
            x: this.player.hitbox.centerX,
            y: this.player.hitbox.top,
            lifespan: { min: 260, max: 310 },
            speed: { min: 7, max: 12},
            angle: { min: 270-10, max: 270+10},
            scale: { start: 1, end: 0, ease: 'Power3' },
            frequency: 48,
            emitZone: { source: new Phaser.Geom.Rectangle(-2, 0, 4, -3) },
            frame: 'flame-particle_00.png',
        });
        this.flameEmitter.setTint(this.color);
    }

    public playLandParticles() {
        this.dustEmitter.explode(7, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }
    public playJumpParticles() {
        this.dustEmitter.explode(5, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }
    public playWalkParticles() {
        this.dustEmitter.explode(2, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }

    public update() {
        if (this.player.speed.x > 0) {
            this.animator.facingDirection = 1;
        } else if (this.player.speed.x < 0) {
            this.animator.facingDirection = -1;
        }

        this.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.bottom);
        this.flameEmitter.setPosition(this.player.hitbox.centerX, this.player.hitbox.top + this.flamePosOffset);

        this.animator.update();

        if (this.keyDownAnimator.sprite.anims.isPlaying) {
            this.keyDownAnimator.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.top - 16);
        }
    }

    public playKeyDownTutorial() {
        if (!this.keyDownAnimator.sprite.anims.isPlaying) {
            this.keyDownAnimator.sprite.play('keydown');
            this.keyDownAnimator.sprite.setAlpha(1);
        }
    }
    public stopKeyDownTutorial() {
        if (this.keyDownAnimator.sprite.anims.isPlaying) {
            this.keyDownAnimator.sprite.stop();
            this.keyDownAnimator.sprite.setAlpha(0);
        }
    }

    private createStateAnimation(state:PlayerStates, length:number = 4, frameRate?:number, repeat?:number) {
        let key = this.animationNames.get(state);
        this.animator.createAnimation(this.playerName + key, this.textureKey, this.playerName + '-' + key + '_', length, frameRate, repeat);
    }

    public changeStateAnimation(state:PlayerStates) {

        switch(state)  {
            case PlayerStates.Sleep:
                this.sprite.alpha = 0.75;
            case PlayerStates.Sleep:
            case PlayerStates.Crouch:
                this.flamePosOffset = 2;
            break;
            case PlayerStates.Dead:
                this.flameEmitter.setVisible(false);
            break;
            default: this.flamePosOffset = 0; break;
        }

        if (state != PlayerStates.Sleep) {
            this.sprite.alpha = 1;
        }

        if (state == PlayerStates.Sleep && this.player.isAtGoal) {
            this.animator.changeAnimation(this.playerName + 'goal');
        }
        else {
            this.animator.changeAnimation(this.playerName + this.animationNames.get(state));
        }
    }

    public destroy() {
        this.animator.destroy();
    }
}