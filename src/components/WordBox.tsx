import { useEffect, useRef, useState } from 'react';
import Cursor, { Point } from './Cursor';
import { Action, CursorPosition, useTypingGame } from '../hooks/game';
import { shouldDeleteWord, useSettings } from '../hooks/settings';
import Line from './Line';

interface WordBoxProps {
    content: string;
    onGameStateChange: (gameState: GameState) => void;
    className?: string;
}

export enum GameState {
    READY = 0,
    STARTED = 1,
    ENDED = 2,
}

const PREVENT_DEFAULT = [' '];

const totalCorrect = (scores: (boolean | undefined)[][]): number => {
    return scores.reduce((prev, curr) => {
        return (
            prev +
            curr.reduce((prev, curr) => (curr === true ? prev + 1 : prev), 0)
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

const WordBox: React.FC<WordBoxProps> = ({ className, onGameStateChange }) => {
    const [gameState, setGameState] = useState<GameState>();
    const [scores, cursorPos, lines, setUserAction, setWords] = useTypingGame();
    const cursorPosRef = useRef(cursorPos);
    const [cursorLocation, setCursorLocation] = useState<Point>({ x: 0, y: 0 });
    const scoresRef = useRef(scores);
    const [wpm, setWPM] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(PLAY_TIME);
    const [settings, _] = useSettings();

    const inputRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (timeRemaining === 0) {
            // run through scores and find the tally, it should be
            // (characters_typed_correctly / 30 sec * (60 sec / 1 min) / 5)
            const correct = totalCorrect(scores);
            setWPM(((correct / PLAY_TIME) * 60) / 5);
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
                setWords(words.common);
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
        if (gameState === GameState.STARTED) {
            const interval = setInterval(() => {
                setTimeRemaining((time) => time - 1);
            }, 1 * SECOND);

            const timeout = setTimeout(() => {
                setGameState(GameState.ENDED);
                clearInterval(interval);
            }, 30 * SECOND);
            onGameStateChange(gameState);
            return () => {
                clearTimeout(timeout);
            };
        }

        if (gameState === GameState.ENDED) {
            onGameStateChange(gameState);
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
                action: shouldDeleteWord(event, settings) ? Action.SUPER_DELETE : Action.DELETE,
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
    }

    // TODO: plan this is what drives how many words to use
    // - window.innerWidth
    // - window.innerHeight
    // also should add window.addEventListener('resize', ...)  

    return (
        <div tabIndex={0} className={className} ref={inputRef} onClick={onUserClick}>
            <Cursor
                point={cursorLocation}
                waiting={gameState !== GameState.STARTED}
                className={'h-7 absolute transition-left ease-linear'}
            />
            {lines.slice(-3).map((line, i) => (
                <Line
                    key={i}
                    line={line}
                    linePos={i + lines.length - 3}
                    lineScore={scores[i + lines.length - 3]}
                ></Line>
            ))}
            <br />
            <br />
            {timeRemaining > 0 ? (
                <div className="text-slate-500">{timeRemaining}</div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className="text-slate-500 border border-gray-700 rounded-lg p-4 shadow self-center">
                        {wpm} WPM
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordBox;
