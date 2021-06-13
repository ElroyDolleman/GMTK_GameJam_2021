class AudioManager {

    static sounds:any;
    static readonly defaultConfig:any = {
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: false,
        delay: 0
    }

    private constructor() {};

    static preload(scene:Phaser.Scene) {
        scene.load.audio('jump', 'audio/jump.wav');
        scene.load.audio('fire', 'audio/fire.wav');
        scene.load.audio('ice', 'audio/ice.wav');
        scene.load.audio('dead', 'audio/dead.wav');
        scene.load.audio('background_music', 'audio/6_Town_2_Master.ogg');
    }

    static createAllSounds(scene:Phaser.Scene) {
        this.sounds = {
            jump: scene.sound.add('jump', this.defaultConfig),
            fire: scene.sound.add('fire', this.defaultConfig),
            freeze: scene.sound.add('ice', this.defaultConfig),
            dead: scene.sound.add('dead', this.defaultConfig),
        };
        // let test:Phaser.Sound.BaseSound;
        // test.play()
    }

    static playMusic(scene:Phaser.Scene) {
        
        if (!scene.sound.locked) {
            this.startMusic(scene);
        }
        else {
            scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                this.startMusic(scene);
            })
        }
    }

    private static startMusic(scene:Phaser.Scene) {
        let music = scene.sound.add('background_music', {
            mute: false,
            volume: 0.2,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        music.play();
    }
}