class Input {

    public get heldDownFrames():number {
        return this._heldDownFrames;
    }
    public get isDown():boolean {
        return this._heldDownFrames > 0;
    }
    public get justDown():boolean {
        return this._heldDownFrames == 1;
    }
    public get justReleased():boolean {
        return this.prevHeldDownFrames > 0 && this._heldDownFrames == 0;
    }

    private key:Phaser.Input.Keyboard.Key;
    private _heldDownFrames:number;
    private prevHeldDownFrames:number;

    constructor(key:Phaser.Input.Keyboard.Key) {
        this.key = key;
    }

    public update() {
        this.prevHeldDownFrames = this._heldDownFrames;

        if (this.key.isDown) {
            this._heldDownFrames++;
        }
        else {
            this._heldDownFrames = 0;
        }
    }
}