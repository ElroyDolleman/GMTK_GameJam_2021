class RandomUtil
{
    private constructor() { }

    public static randomInt(min:number, max:number):number {
        return Math.round(this.randomFloat(Math.ceil(min), Math.floor(max)));
    }
    public static randomFloat(min:number, max:number):number {
        return Math.random() * (max - min) + min;
    }
}