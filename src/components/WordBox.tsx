import { useEffect, useRef, useState } from 'react';
import Cursor, { Point } from './Cursor';
import { CursorAction, CursorPosition, useSlide } from '../hooks/slide';
import Line from './Line';
import { useScore } from '../hooks/scoring';

interface WordBoxProps {
    content: string;
    active: boolean;
    className?: string;
}

enum GameState {
    READY = 0,
    STARTED = 1,
    ENDED = 2,
}

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

const WordBox: React.FC<WordBoxProps> = ({ className }) => {
    const [gameState, setGameState] = useState<GameState>();
    const [cursorPos, lines, moveCursor, setWords] = useSlide();
    const cursorPosRef = useRef(cursorPos);
    const [cursorLocation, setCursorLocation] = useState<Point>({ x: 0, y: 0 });
    const [scores, setLines, setKeyEvent] = useScore();
    const scoresRef = useRef(scores);
    const [wpm, setWPM] = useState<number>(0);
    //const [timeRemaining, setTimeRemaining] = useState<number>(PLAY_TIME);

    useEffect(() => {
        if (gameState === GameState.ENDED) {
            // run through scores and find the tally, it should be
            // (characters_typed_correctly / 30 sec * (60 sec / 1 min) / 5)
            const correct = totalCorrect(scores);
            setWPM(((correct / PLAY_TIME) * 60) / 5);
        }
    }, [gameState]);

    useEffect(() => {
        scoresRef.current = scores;
        console.log(scores);
    }, [scores]);

    useEffect(() => {
        cursorPosRef.current = cursorPos;
    }, [cursorPos]);

    useEffect(() => {
        setLines(lines);
    }, [lines]);

    useEffect(() => {
        let location = translateCursorToLocation(cursorPos);
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
        window.addEventListener('keydown', handleUserInput);
        return () => {
            window.removeEventListener('keydown', handleUserInput);
        };
    }, []);

    useEffect(() => {
        if (gameState === GameState.STARTED) {
            const timeout = setTimeout(() => {
                setGameState(GameState.ENDED);
            }, 30 * SECOND);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [gameState]);

    // FIXME: I should have moveCursor listened to...
    const handleUserInput = (event: KeyboardEvent) => {
        setGameState(GameState.STARTED);
        if (['Shift', 'Control', 'Meta'].includes(event.key)) {
            return;
        }

        if (event.key === 'Backspace') {
            // this moves the cursor
            moveCursor(
                event.ctrlKey
                    ? { action: CursorAction.SUPER_DELETE }
                    : { action: CursorAction.DELETE }
            );
        } else {
            // move cursor forward
            moveCursor({ action: CursorAction.FORWARD });
            setKeyEvent({
                timestamp: Date.now(),
                character: event.key,
                pos: cursorPosRef.current,
                isDelete: false,
            });
        }
    };

    return (
        <div tabIndex={0} className={'max-w-4xl ' + className}>
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
            <div className="text-slate-700"> Total Score: {wpm}</div>
        </div>
    );
};

export default WordBox;
