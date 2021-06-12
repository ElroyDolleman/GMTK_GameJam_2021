class StateMachine<T>
{
    public get currentState():IBaseState<T> { return this.states.get(this.currentStateKey); }

    private states:Map<number, IBaseState<T>>;
    private currentStateKey:number = -1;

    public owner:T;

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
        console.log("changeState", key);
        this.currentState.leave();
        this.currentStateKey = key;
        this.currentState.enter();
    }
}