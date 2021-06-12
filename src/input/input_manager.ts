class InputManager
{
    private left:Input;
    private right:Input;
    private jump:Input;

    private playerInputStates:PlayerInputsState[] = [];
    private maxStoredInputs:number = 5*60 + 5;

    public get defaultPlayerInputsState():PlayerInputsState { 
        return {
            leftFrames:0,
            rightFrames:0,
            jumpFrames:0
        };
    }

    private static _instance:InputManager;
    public static get instance():InputManager {
        if (!InputManager._instance) {
            InputManager._instance = new InputManager();
        }
        return InputManager._instance;
    }
    private constructor() {}

    public initialize(scene: Phaser.Scene) {
        this.left = new Input(scene.input.keyboard.addKey('left'));
        this.right = new Input(scene.input.keyboard.addKey('right'));
        this.jump = new Input(scene.input.keyboard.addKey('up'));

        // setTimeout(() => {
        //     console.log(this.playerInputStates);
        //     debugger;
        // }, 6000);
    }

    public update() {

        this.left.update();
        this.right.update();
        this.jump.update();

        this.playerInputStates.push(this.createPlayerState());

        if (this.playerInputStates.length > this.maxStoredInputs) {
            this.playerInputStates.splice(0, 1);
        }
    }

    public getPlayerInputState(framesBehind:number = 0):PlayerInputsState {
        let index = this.playerInputStates.length - 1 - framesBehind;
        if (index < 0) {
            return this.defaultPlayerInputsState;
        }
        return this.playerInputStates[index];
    }

    private createPlayerState():PlayerInputsState {
        return {
            leftFrames:this.left.heldDownFrames,
            rightFrames:this.right.heldDownFrames,
            jumpFrames:this.jump.heldDownFrames
        }
    }
}