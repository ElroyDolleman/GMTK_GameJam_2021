/// <reference path="../entities/entity.ts"/>

enum PlayerStates {
    Idle,
    Walk,
    Fall,
    Jump,
    Crouch,
    Sleep,
    Dead,
}

class BasePlayer extends Entity
{
    protected stateMachine:StateMachine<BasePlayer>;
    public view:BasePlayerView;

    public currentInputState:PlayerInputsState;

    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, startingState:PlayerStates, view:BasePlayerView) {
        super(new Phaser.Geom.Rectangle(spawnPosition.x + 3, spawnPosition.y - 14, 10, 14));

        this.stateMachine = new StateMachine(this);
        this.stateMachine.addState(PlayerStates.Idle, new PlayerIdleState());
        this.stateMachine.addState(PlayerStates.Walk, new PlayerWalkState());
        this.stateMachine.addState(PlayerStates.Fall, new PlayerFallState());
        this.stateMachine.addState(PlayerStates.Jump, new PlayerJumpState());
        this.stateMachine.addState(PlayerStates.Crouch, new PlayerCrouchState());
        this.stateMachine.addState(PlayerStates.Sleep, new PlayerSleepState());
        this.stateMachine.addState(PlayerStates.Dead, new PlayerDeadState());

        this.stateMachine.start(startingState);

        this.view = view;
        this.view.createAnimator(scene, this);
        this.view.animator.updateSpritePosition();
    }

    update():void {
        this.currentInputState = InputManager.instance.playerInputState;
        this.stateMachine.update();
    }

    wakeUp():void {
        if (this.stateMachine.currentStateKey == PlayerStates.Sleep) {
            this.stateMachine.changeState(PlayerStates.Idle);
        }
    }

    lateUpdate():void {
        this.view.update();
    }

    onCollisionSolved(result: CollisionResult):void {
        if (result.isDamaged && this.stateMachine.currentStateKey != PlayerStates.Dead) {
            this.speed.x = 0;
            this.stateMachine.changeState(PlayerStates.Dead);
        }

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

    public destroy():void {
        this.stateMachine.destroy();
        this.view.destroy();
    }
}