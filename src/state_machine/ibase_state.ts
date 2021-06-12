interface IBaseState<T>
{
    parent:T;
    machine:StateMachine<T>;

    enter(): void;
    update(): void;
    leave(): void;

    //onCollisionSolved(result:CollisionResult);
}