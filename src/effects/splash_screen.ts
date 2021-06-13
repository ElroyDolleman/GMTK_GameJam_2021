class SplashScreen {

    constructor(scene:Phaser.Scene, onDone:Function, context:any) {

        let gtmkSprite:Phaser.GameObjects.Sprite = scene.add.sprite(320/2, 320/2, 'splash_sheet');
        let gmtkAnimation:Animator = new Animator(scene, gtmkSprite, null);
        gmtkAnimation.createAnimation('splash', 'splash_sheet', 'gmtk-intro_', 65, 30, 0);
        gtmkSprite.play('splash');
        gtmkSprite.once('animationcomplete', () => {

            gmtkAnimation.destroy();
            onDone.call(context);
        });

        gtmkSprite.setDepth(12);
    }
}