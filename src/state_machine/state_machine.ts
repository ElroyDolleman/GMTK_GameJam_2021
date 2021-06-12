class StateMachine<T>
{
    public get currentState():IBaseState<T> { return this.states.get(this.currentStateKey); }

    private states:Map<number, IBaseState<T>>;
    public currentStateKey:number = -1;

    public owner:T;

    protected onStateChanged: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();

    constructor(owner:T) {
        this.owner = owner;
        this.states = new Map();
    }

    public start(firstState:number) {
        this.currentStateKey = firstState;
    }

    public update() {
        this.currentState.update();
    }

    public addState(key:number, state:IBaseState<T>) {
        state.machine = this;
        this.states.set(key, state);
    }

    public changeState(key:number) {
        this.currentState.leave();
        this.currentStateKey = key;
        this.currentState.enter();

        this.onStateChanged.emit(key.toString());
    }

    public addStateChangedListener(stateKey:number, event:Function, context?:any) {
        this.onStateChanged.addListener(stateKey.toString(), event, context);
    }
}