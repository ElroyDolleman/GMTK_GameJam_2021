module NumberUtil
{
    /**
     * Returns an integer that indicates the sign of a number.
     */
    export function sign(value: number)
    {
        return value == 0 ? 0 : value > 0 ? 1 : -1;
    }
}