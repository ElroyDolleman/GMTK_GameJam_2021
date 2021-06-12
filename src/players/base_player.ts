/// <reference path="../entities/entity.ts"/>

enum PlayerStates {
    Idle,
    Walk,
    Fall,
    Jump
}

class BasePlayer extends Entity
{
    public currentInputState: PlayerInputsState;

    protected stateMachine:StateMachine<BasePlayer>;

    protected inputFramesBehind:number;

    private sprite:Phaser.GameObjects.Sprite;

    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, inputFramesBehind:number, anim:string) {
        super(new Phaser.Geom.Rectangle(spawnPosition.x + 3, spawnPosition.y - 14, 10, 14));
        this.inputFramesBehind = inputFramesBehind;

        this.sprite = scene.add.sprite(0, 0, 'player_sheet', anim);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.x = spawnPosition.x;
        this.sprite.y = spawnPosition.y;

        this.stateMachine = new StateMachine(this);
        this.stateMachine.addState(PlayerStates.Idle, new PlayerIdleState());
        this.stateMachine.addState(PlayerStates.Walk, new PlayerWalkState());
        this.stateMachine.addState(PlayerStates.Fall, new PlayerFallState());
        this.stateMachine.addState(PlayerStates.Jump, new PlayerJumpState());

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
        this.stateMachine.currentState.onCollisionSolved(result);
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