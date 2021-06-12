class IcePlayer extends BasePlayer
{
    public constructor(scene:Phaser.Scene, spawnPosition:Phaser.Math.Vector2, inputFramesBehind:number) {
        super(scene, new Phaser.Math.Vector2(64, 288-16), 1*60, 'icechar-walk_00.png');
        this.inputFramesBehind = inputFramesBehind;
    }

    
}