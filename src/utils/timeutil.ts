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

    static getTimeDifferenceMSMM(firstDate:Date, secondDate:Date) {
        var millisecondsDifference = Math.floor(this.getMillisecondsDifference(firstDate, secondDate));
        var secondsDifference = Math.floor(this.getSecondsDifference(firstDate, secondDate));
        var minutesDifference = Math.floor(this.getMinutesDifference(firstDate, secondDate));

        millisecondsDifference -= secondsDifference * 1000;
        secondsDifference -= minutesDifference * 60;
        
        return {
            minutes: minutesDifference,
            seconds: secondsDifference,
            milliseconds: millisecondsDifference
        };
    }
    static getSecondsDifference(firstDate:Date, secondDate:Date) {
        return (secondDate.getTime() / 1000) - (firstDate.getTime() / 1000);
    }
    static getMillisecondsDifference(firstDate:Date, secondDate:Date) {
        return secondDate.getTime() - firstDate.getTime();
    }
    static getMinutesDifference(firstDate:Date, secondDate:Date) {
        return this.getSecondsDifference(firstDate, secondDate) / 60;
    }
}