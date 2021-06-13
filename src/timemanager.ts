class TimeManager
{
    private constructor() {}

    static startTime:Date;
    static endTime:Date;

    static tileAnimations:Map<string, Phaser.Animations.AnimationState> = new Map();

    private static globalAnimationUpdateInterval:number;

    public static animationFrame:number = 0;

    static initialize() {
        this.startTime = new Date();

        this.globalAnimationUpdateInterval = setInterval(this.globalAnimationUpdate.bind(this), 200);
    }

    static getTimeSinceStartup():number {
        return Date.now() - this.startTime.getTime();
    }

    private static globalAnimationUpdate() {
        this.animationFrame++;

        this.tileAnimations.forEach((anim) => {
            anim.setCurrentFrame(anim.currentAnim.frames[this.animationFrame % 4]);
        });
    }
}