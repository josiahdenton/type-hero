import { useEffect, useRef, useState } from 'react';
import Cursor, { CursorPosition } from './Cursor';
import Letter, { LetterState } from './Letter';

interface WordBoxProps {
    content: string;
    active: boolean;
    className?: string;
}

type GameStats = {
    correct: number;
    incorrect: number;
};

const getRandom = (): number => {
    return Math.floor(Math.random() * 1000);
};

const getLetterPosition = (position: number): CursorPosition | undefined => {
    let letter = document.getElementById('letter-' + position);
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
const MAX_WORDS_PER_SECTION = 10;

const WordBox: React.FC<WordBoxProps> = ({ active, className }) => {
    const [cursorPos, setCursorPos] = useState<number>(0);

    const [gameReady, setGameReady] = useState<boolean>(false);
    const [gameStarted, setGameStarted] = useState<boolean>(false); // FIXME: move this to instead be a game state
    const [gameCompleted, setGameCompleted] = useState<boolean>(false);
    const [gameStats, setGameStats] = useState<GameStats>({
        correct: 0,
        incorrect: 0,
    });

    const [completedWords, setCompletedWords] = useState<number>(0);
    const [gameTime, setGameTime] = useState<number>(Date.now());
    const [contentState, setContentState] = useState<Array<LetterState>>([]);
    const [content, setContent] = useState<string>('');
    const [nextSectionPos, setNextSectionPos] = useState<number>(getRandom());

    const [ticker, setTicker] = useState<number>(PLAY_TIME);

    const [cursorWindowPosition, setCursorWindowPosition] =
        useState<CursorPosition>({ x: 0, y: 0 });

    const loadContent = (section: number) => {
        fetch('/thousand.json')
            .then((resp) => resp.json())
            .then((words) => {
                setContent(
                    words.common
                        .slice(section, section + MAX_WORDS_PER_SECTION)
                        .join(' ')
                );
                setGameReady(true);
            })
            .catch((err) => console.error(err));
    };

    const nextWordSection = () => {
        setCursorPos(0);
        setContentState([]);
        loadContent(nextSectionPos);
        setNextSectionPos(getRandom());
    };

    useEffect(() => {
        if (ticker == 0 || !gameStarted) {
            return;
        }
        const timeout = setTimeout(() => {
            setTicker(ticker - 1);
        }, 1 * SECOND);
        return () => clearTimeout(timeout);
    }, [gameStarted, ticker]);

    useEffect(() => {
        loadContent(nextSectionPos);
        setNextSectionPos(getRandom());
        window.addEventListener('keydown', handleUserInput);
        const timeout = setTimeout(() => {
            setGameCompleted(true);
        }, 30 * SECOND);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('keydown', handleUserInput);
        };
    }, []);

    useEffect(() => {
        if (cursorPos == content.length && gameReady) {
            nextWordSection();
        }
    }, [cursorPos]);

    useEffect(() => {
        setContentState(new Array(content.length).fill(LetterState.READY));
    }, [content]);

    useEffect(() => {
        const pos = getLetterPosition(cursorPos);
        if (pos) {
            setCursorWindowPosition(pos);
        }
    }, [cursorPos, content]);

    const contentRef = useRef(content);
    const cursorPosRef = useRef(cursorPos);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);
    useEffect(() => {
        cursorPosRef.current = cursorPos;
    }, [cursorPos]);

    const handleUserInput = (event: KeyboardEvent) => {
        setGameStarted(true);
        console.log(event);
        // ignore these
        if (['Shift', 'Control', 'Meta'].includes(event.key)) {
            return;
        }

        const content = contentRef.current;
        const cursorPos = cursorPosRef.current;

        if (event.key == content[cursorPos]) {
            if (content[cursorPos] == ' ') {
                // FIXME: I don't think this happens when we move to a new section
                setCompletedWords((count) => count + 1);
            }
            // what I have written
            setContentState((state) =>
                state.map((prevLetterState, i) =>
                    i == cursorPos ? LetterState.MATCHED : prevLetterState
                )
            );

            setCursorPos((pos) => pos + 1);
        } else if (event.key == 'Backspace') {
            if (event.altKey) {
                // go back a word...
                // this would require creating a WordStore,  getWordRange(index)
                // underlying store is something like
                // (x, y) --> Word
                // stored in array, fast lookup with O(log n) search
            } else {
                // delete single
                setContentState((state) =>
                    state.map((prevLetterState, i) =>
                        i == cursorPos - 1 ? LetterState.READY : prevLetterState
                    )
                );
                setCursorPos((pos) => pos - 1);
            }
        } else {
            console.log('huh?', cursorPos, content);
            setContentState((state) =>
                state.map((prevLetterState, i) =>
                    i == cursorPos ? LetterState.NO_MATCH : prevLetterState
                )
            );
            setCursorPos((pos) => pos + 1);
        }
    };

    return (
        <div tabIndex={0} className={'max-w-4xl ' + className}>
            <Cursor
                position={cursorWindowPosition}
                waiting={!gameStarted}
                className={'h-7 absolute transition-left ease-linear'}
            />
            {content.split('').map((character, i) => {
                return (
                    <Letter
                        id={'letter-' + i}
                        key={i}
                        letter={character}
                        state={contentState[i]}
                    />
                );
            })}
        </div>
    );

    //<div>{completedWords}</div>
};

export default WordBox;
