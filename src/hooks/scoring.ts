import { useEffect, useRef, useState } from 'react';
import { CursorPosition } from './slide';

type KeyEvent = {
    timestamp: number;
    character: string;
    pos: CursorPosition;
    isDelete: boolean;
};

// NOTE: =====================================================
// track words completed for WPM
// calulation follows from this explanation
// https://www.typing.com/blog/what-is-words-per-minute/#:~:text=The%20Basics%20of%20WPM,Accurately%20Measuring%20Typing%20Ability
// =====================================================

export const useScore = () => {
    const [keyEvent, setKeyEvent] = useState<KeyEvent>();
    // undefined --> LetterState.READY, false --> LetterState.NO_MATCH, true --> LetterState.MATCHED
    const [lines, setLines] = useState<string[]>();
    const [scores, setScores] = useState<(boolean | undefined)[][]>([]); // initial state of lines will be set to 3 ROWS
    const scoresRef = useRef(scores);
    // useEffect off lines, everytime we append a line, we add a line
    const linesRef = useRef(lines);

    useEffect(() => {
        if (lines && scoresRef.current.length < lines.length) {
            const newLines = lines.slice(scoresRef.current.length);
            console.log(lines);
            setScores((scores) => [
                ...scores,
                ...newLines.map((newLine) =>
                    Array.from({ length: newLine.length }, () => undefined)
                ),
            ]);
        }
    }, [lines]);

    useEffect(() => {
        if (keyEvent?.isDelete) {
            console.log('unsupported');
            return;
        }

        if (keyEvent && linesRef.current) {
            const letter =
                linesRef.current[keyEvent.pos.line][keyEvent.pos.letter];
            setScores((scores) =>
                scores.map((line, linePos) => {
                    if (linePos === keyEvent.pos.line) {
                        line[keyEvent.pos.letter] =
                            letter == keyEvent.character;
                    }
                    return line;
                })
            );
        }
    }, [keyEvent]);

    useEffect(() => {
        linesRef.current = lines;
    }, [lines]);

    useEffect(() => {
        scoresRef.current = scores;
    }, [scores]);

    return [scores, setLines, setKeyEvent] as const;
};
