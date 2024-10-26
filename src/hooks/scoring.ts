import { useEffect, useRef, useState } from 'react';
import { Action, CursorUpdate } from './slide';

// NOTE:
// track words completed for WPM
// calulation follows from this explanation
// https://www.typing.com/blog/what-is-words-per-minute/#:~:text=The%20Basics%20of%20WPM,Accurately%20Measuring%20Typing%20Ability

export const useScore = (cursorUpdate?: CursorUpdate) => {
    const [lines, setLines] = useState<string[]>();
    // undefined --> LetterState.READY, false --> LetterState.NO_MATCH, true --> LetterState.MATCHED
    const [scores, setScores] = useState<(boolean | undefined)[][]>([]);
    const scoresRef = useRef(scores);
    const linesRef = useRef(lines);

    // match scores Array length to lines.
    useEffect(() => {
        if (lines && scoresRef.current.length < lines.length) {
            const newLines = lines.slice(scoresRef.current.length);
            setScores((scores) => [
                ...scores,
                ...newLines.map((newLine) =>
                    Array.from({ length: newLine.length }, () => undefined)
                ),
            ]);
        }
    }, [lines]);

    useEffect(() => {
        console.log(cursorUpdate);
        if (!cursorUpdate || !cursorUpdate.positionOfAction) {
            return;
        }
        const positionOfAction = cursorUpdate.positionOfAction;
        const currentPosition = cursorUpdate.currentPosition; 

        if (cursorUpdate.action === Action.DELETE) {
            setScores((scores) =>
                scores.map((line, linePos) => {
                    if (linePos === currentPosition.line) {
                        line[currentPosition.letter] = undefined;
                    }
                    return line;
                })
            );
            return;
        } else if (cursorUpdate.action === Action.SUPER_DELETE) {
            console.log('unsupported');
        } else if (cursorUpdate.action === Action.ADD && linesRef.current) {
            const letter =
                linesRef.current[positionOfAction.line][
                    positionOfAction.letter
                ];
            setScores((scores) =>
                scores.map((line, linePos) => {
                    if (linePos === positionOfAction.line) {
                        line[positionOfAction.letter] =
                            letter == cursorUpdate.character;
                    }
                    return line;
                })
            );
        }
    }, [cursorUpdate]);

    useEffect(() => {
        linesRef.current = lines;
    }, [lines]);

    useEffect(() => {
        scoresRef.current = scores;
        console.log(scores);
    }, [scores]);

    return [scores, setLines] as const;
};
