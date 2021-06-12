/// <reference path="../entities/entity.ts"/>

enum PlayerStates {
    Idle,
    Walk
}

class BasePlayer extends Entity
{
    protected stateMachine:StateMachine<BasePlayer>;

    private sprite:Phaser.GameObjects.Sprite;
    private currentInputState: PlayerInputsState;
    private inputFramesBehind:number;

    constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, inputFramesBehind:number, anim:string) {
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

    update():void {
        this.currentInputState = InputManager.instance.getPlayerInputState(this.inputFramesBehind);
        this.stateMachine.update();
    }

    lateUpdate():void {
        this.sprite.setPosition(this.hitbox.centerX, this.hitbox.bottom);
    }

    onCollisionSolved(result: CollisionResult):void {

    }

    updateMovementControls(maxRunSpeed: number = 120, runAcceleration: number = 20) {
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

    public decelerate(deceleration: number) {
        if (Math.abs(this.speed.x) < deceleration) {
            this.speed.x = 0;
        }
        else {
            this.speed.x -= deceleration * NumberUtil.sign(this.speed.x);
        }
    }
}