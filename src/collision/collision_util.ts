class CollisionUtil {
    private constructor() {}

    public static hitboxVerticallyAligned(topHitbox:Phaser.Geom.Rectangle, bottomHitbox:Phaser.Geom.Rectangle, margin:number = 0):boolean {
        if (bottomHitbox.top == topHitbox.bottom) {
            return topHitbox.right > bottomHitbox.left && topHitbox.left < bottomHitbox.right;
        }
        return false;
    }

    public static hitboxHorizontallyAligned(leftHitbox:Phaser.Geom.Rectangle, rightHitbox:Phaser.Geom.Rectangle, margin:number = 0):boolean {
        if (leftHitbox.right == rightHitbox.left) {
            return leftHitbox.bottom > rightHitbox.top && leftHitbox.top < rightHitbox.bottom;
        }
        return false;
    }

    public static hitboxesAligned(hitbox1:Phaser.Geom.Rectangle, hitbox2:Phaser.Geom.Rectangle) {
        return CollisionUtil.hitboxVerticallyAligned(hitbox1, hitbox2) ||
                CollisionUtil.hitboxVerticallyAligned(hitbox2, hitbox1) ||
                CollisionUtil.hitboxHorizontallyAligned(hitbox1, hitbox2) ||
                CollisionUtil.hitboxHorizontallyAligned(hitbox2, hitbox1);
    }
}