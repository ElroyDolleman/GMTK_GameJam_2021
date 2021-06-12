/// <reference path="../entities/entity.ts"/>

enum PlayerStates {
    Idle,
    Walk,
    Fall,
    Jump,
    Crouch,
    Sleep
}

class BasePlayer extends Entity
{
    public currentInputState:PlayerInputsState;

    protected stateMachine:StateMachine<BasePlayer>;

    protected inputFramesBehind:number;

    private sprite:Phaser.GameObjects.Sprite;

    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, startingState:PlayerStates, anim:string) {
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

    update():void {
        this.currentInputState = InputManager.instance.playerInputState;
        this.stateMachine.update();
    }

    wakeUp():void {
        console.log("wakey wakey");
        if (this.stateMachine.currentStateKey == PlayerStates.Sleep) {
            this.stateMachine.changeState(PlayerStates.Idle);
        }
    }

    lateUpdate():void {
        this.sprite.setPosition(this.hitbox.centerX, this.hitbox.bottom);
    }

    onCollisionSolved(result: CollisionResult):void {
        this.stateMachine.currentState.onCollisionSolved(result);
    }

    updateMovementControls(maxRunSpeed: number = PlayerStats.RunSpeed, runAcceleration: number = PlayerStats.RunAcceleration) {
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

    public getStateMachine():StateMachine<BasePlayer> {
        return this.stateMachine;
    }
}