class CollisionUtil {
    private constructor() {}

    public static hitboxVerticallyAligned(topHitbox:Phaser.Geom.Rectangle, bottomHitbox:Phaser.Geom.Rectangle):boolean {
        if (bottomHitbox.top == topHitbox.bottom) {
            return topHitbox.right > bottomHitbox.left && topHitbox.left < bottomHitbox.right;
        }
        return false;
    }
}