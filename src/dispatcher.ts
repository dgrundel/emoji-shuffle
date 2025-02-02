
export enum GameEvent {
    NewGame = 'game-events:new-game',
    Moved = 'game-events:moved',
    Won = 'game-events:won',
}

export enum MoveType {
    Move,
    Undo,
    Reset,
}

export class Dispatcher {
    target: EventTarget;

    constructor(target: EventTarget) {
        this.target = target;
    }

    newGame() {
        this.target.dispatchEvent(new CustomEvent(GameEvent.NewGame));
    }

    onNewGame(fn: () => any) {
        this.target.addEventListener(GameEvent.NewGame, fn);
    }

    moved(moveType: MoveType) {
        this.target.dispatchEvent(new CustomEvent(GameEvent.Moved, {
            detail: { moveType }
        }));
    }

    onMoved(fn: (moveType: MoveType) => any) {
        this.target.addEventListener(GameEvent.Moved, e => {
            const moveType = (e as any).detail.moveType as MoveType;
            if (typeof moveType === 'undefined') {
                console.error('Missing MoveType, got: ', moveType, e);
            }
            fn(moveType);
        });
    }

    won() {
        this.target.dispatchEvent(new CustomEvent(GameEvent.Won));
    }

    onWon(fn: () => any) {
        this.target.addEventListener(GameEvent.Won, fn);
    }
}