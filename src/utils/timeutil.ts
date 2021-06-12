class TimeUtil
{
    private constructor() {

    }

    static currentElapsedMS:number = (1 / 60) * 1000;

    static getElapsed():number {
        return this.currentElapsedMS / 1000;
    }

    static getElapsedMS():number {
        return this.currentElapsedMS;
    }
}