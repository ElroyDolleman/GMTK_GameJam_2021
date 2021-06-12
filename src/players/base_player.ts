/// <reference path="../entities/actor.ts"/>

enum PlayerStates {
    Idle,
    Walk
}

class BasePlayer extends Entity
{
    protected stateMachine:StateMachine<BasePlayer>;

    private sprite:Phaser.GameObjects.Sprite;

    constructor(scene:Phaser.Scene, spawnPosition: Phaser.Math.Vector2) {
        super(new Phaser.Geom.Rectangle(spawnPosition.x, spawnPosition.y - 16, 16, 16));

        this.sprite = scene.add.sprite(0, 0, 'player_sheet', 'icechar-walk_00.png');
        this.sprite.setOrigin(0.5, 1);
        this.sprite.x = spawnPosition.x;
        this.sprite.y = spawnPosition.y;

        this.stateMachine = new StateMachine();
        this.stateMachine.addState(PlayerStates.Idle, new PlayerIdleState());

        this.stateMachine.start(PlayerStates.Idle);
    }

    update():void {

    }
}