/* eslint-disable no-unused-vars */

// In questo documento devono stare le interfacce
// di tutti i modelli di dati che vengono utilizzati nell'applicazione
// questi modelli sono nel front end.

export interface AuthStore {
    username: string;
    jwt?: string;
}

// esempi:
/**
export interface GameStore {
    playerId: string;
    gameId: string;
    status: GameStatus;
    ownBoard: Array<Array<CellType>>;
    enemyBoard: Array<Array<CellType>>;
};

export interface MessageStore {
    info: string;
    error: string;
    warning: string;
    success: string;
    type: ErrorType;
}

export enum ErrorType {
    NoError,
    GameNotFound,
    GameAlreadyExists,
    GameAlreadyStarted,
    GameAlreadyFinished,
    GameAlreadyJoined,
    GameAlreadyCreated,
}

Significa che nello store avrò a disposizione per tutte le applicazioni
un oggetto di tipo GameStore che contiene le informazioni di un gioco
 */
