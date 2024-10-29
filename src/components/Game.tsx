import { useEffect, useRef, useState } from 'react';
import Cursor, { Point } from './Cursor';
import { Action, CursorPosition, useTypingGame } from '../hooks/game';
import { shouldDeleteWord, UserSettings } from '../hooks/settings';
import Line from './Line';
import Result from './Result';

interface WordBoxProps {
    content: string;
    className?: string;
    settings: UserSettings;
}

export enum GameState {
    READY = 0,
    STARTED = 1,
    ENDED = 2,
}

const PREVENT_DEFAULT = [' '];

const GAME_WINDOW = 3;

const gameCursorWindow = (cursorLinePos: number): [number, number] => {
    return cursorLinePos - 1 > 0
        ? [cursorLinePos - 1, cursorLinePos - 1 + GAME_WINDOW]
        : [0, GAME_WINDOW];
};

const scoreTotal = (
    scores: (boolean | undefined)[][],
    forCorrect: boolean
): number => {
    return scores.reduce((prev, curr) => {
        return (
            prev +
            curr.reduce(
                (prev, curr) => (curr === forCorrect ? prev + 1 : prev),
                0
            )
        );
    }, 0);
};

const translateCursorToLocation = (
    cursor: CursorPosition
): Point | undefined => {
    let letter = document.getElementById(
        `line-${cursor.line}-letter-${cursor.letter}`
    );
    let rect = letter?.getBoundingClientRect();
    if (rect) {
        return {
            x: rect?.right - rect.width,
            y: rect?.top,
        };
    }

    return undefined;
};

const SECOND = 1000;
const PLAY_TIME = 30;

const Game: React.FC<WordBoxProps> = ({ className, settings }) => {
    const [gameState, setGameState] = useState<GameState>();
    const [scores, cursorPos, lines, setUserAction, setWords] =
        useTypingGame(settings);
    const scoresRef = useRef(scores);

    const cursorPosRef = useRef(cursorPos);
    const [cursorLocation, setCursorLocation] = useState<Point>({ x: 0, y: 0 });

    const [wpm, setWPM] = useState<number>(0);
    const [accuracy, setAccuracy] = useState<string>('?');
    const [timeRemaining, setTimeRemaining] = useState<number>(PLAY_TIME);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (timeRemaining === 0) {
            // run through scores and find the tally, it should be
            // (characters_typed_correctly / 30 sec * (60 sec / 1 min) / 5)
            const correct = scoreTotal(scoresRef.current, true);
            const incorrect = scoreTotal(scoresRef.current, false);
            setWPM(((correct / PLAY_TIME) * 60) / 5);
            setAccuracy(
                ((correct / (incorrect + correct)) * 100).toFixed(2) + '%'
            );
        }
    }, [timeRemaining]);

    useEffect(() => {
        scoresRef.current = scores;
    }, [scores]);

    useEffect(() => {
        cursorPosRef.current = cursorPos;
        if (
            cursorPos.action === Action.ADD &&
            cursorPos.currentPosition.line === 0 &&
            cursorPos.currentPosition.letter === 1
        ) {
            setGameState(GameState.STARTED);
        } else if (
            cursorPos.action === Action.DELETE &&
            cursorPos.currentPosition.line === 0 &&
            cursorPos.currentPosition.letter === 0
        ) {
            setTimeRemaining(PLAY_TIME);
            setGameState(GameState.READY);
        }
    }, [cursorPos]);

    useEffect(() => {
        let location = translateCursorToLocation(cursorPos.currentPosition);
        if (location) {
            setCursorLocation(location);
        }
    }, [cursorPos, lines]);

    const loadContent = () => {
        fetch('thousand.json')
            .then((resp) => resp.json())
            .then((words: { common: string[] }) => {
                setWords([...words.common]);
                setGameState(GameState.READY);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        loadContent();
        window.addEventListener('keydown', onUserKeyDown);
        return () => {
            window.removeEventListener('keydown', onUserKeyDown);
        };
    }, []);

    useEffect(() => {
        if (gameState === GameState.READY) {
            setTimeRemaining(30);
            setWPM(0);
        } else if (gameState === GameState.STARTED) {
            const interval = setInterval(() => {
                setTimeRemaining((time) => time - 1);
            }, 1 * SECOND);

            const timeout = setTimeout(() => {
                setGameState(GameState.ENDED);
                clearInterval(interval);
                setTimeRemaining(0);
            }, 30 * SECOND);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [gameState]);

    const onUserKeyDown = (event: KeyboardEvent) => {
        if (['Shift', 'Control', 'Meta', 'Alt'].includes(event.key)) {
            return;
        }
        console.log(event);

        if (event.key === 'Backspace') {
            // this moves the cursor
            setUserAction({
                action: shouldDeleteWord(event, settings)
                    ? Action.SUPER_DELETE
                    : Action.DELETE,
                timestamp: Date.now(),
                character: event.key,
                //pos: cursorPosRef.current,
            });
        } else {
            // move cursor forward
            setUserAction({
                action: Action.ADD,
                timestamp: Date.now(),
                character: event.key,
                //pos: cursorPosRef.current,
            });
        }

        // TODO: remove once I fix the sizing of the window
        if (PREVENT_DEFAULT.includes(event.key)) {
            event.preventDefault();
        }
    };

    const onUserClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                type="text"
                className="opacity-0 absolute pointer-events-none"
            />
            <div tabIndex={0} className={className} onClick={onUserClick}>
                {timeRemaining > 0 ? (
                    <>
                        <Cursor
                            point={cursorLocation}
                            waiting={gameState !== GameState.STARTED}
                            className={
                                'h-7 absolute transition-left ease-linear'
                            }
                        />
                        {lines
                            .map((line, i) => [line, i] as const)
                            .slice(
                                ...gameCursorWindow(
                                    cursorPos.currentPosition.line
                                )
                            )
                            .map(([line, i]) => (
                                <Line
                                    key={i}
                                    line={line}
                                    linePos={i}
                                    lineScore={scores[i]}
                                ></Line>
                            ))}
                        <br />
                        <br />
                        <div className="text-slate-500">{timeRemaining}</div>
                    </>
                ) : (
                    <Result
                        accuracy={accuracy}
                        wpm={wpm}
                        onRestart={() => loadContent()}
                    />
                )}
            </div>
        </>
    );
};

export default Game;
