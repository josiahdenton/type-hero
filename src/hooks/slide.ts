// TODO: implement a sliding window on the content we're using for type hero
// we would useRef<Slide>();

import { useEffect, useRef, useState } from 'react';

/**
 * WordEditor treats words like simple text.
 * Tracks cursor positions along words and easily
 * allows multi-word deleting.
 * */

const MAX_WORDS_PER_LINE = 7;
const ROWS = 3;

export enum CursorAction {
    FORWARD,
    DELETE,
    SUPER_DELETE,
}

export type CursorMovement = {
    action: CursorAction;
};

export type CursorPosition = {
    letter: number;
    line: number;
};

const generateLine = (words: string[]): string => {
    let line = '';
    // FIXME: make this instead generate words that fit within a letter range
    for (let i = 0; i < MAX_WORDS_PER_LINE; i++) {
        line += words[Math.floor(Math.random() * words.length)];
        if (i < MAX_WORDS_PER_LINE - 1) {
            line += ' ';
        }
    }
    return line + ' ';
};

// TODO: have this return [cursorPos, content, moveCursor, setWords]
export const useSlide = () => {
    // words list is used
    const [cursorPos, setCursorPos] = useState<CursorPosition>({
        letter: 0,
        line: 0,
    });
    const cursorPosRef = useRef<CursorPosition>(cursorPos);

    const [words, setWords] = useState<string[]>([]);
    const [cursorMovement, setCursorMovement] = useState<CursorMovement>();
    const [lines, setLines] = useState<string[]>([]);

    const wordsRef = useRef<string[]>(words);
    const linesRef = useRef<string[]>([]);

    useEffect(() => {
        linesRef.current = lines;
    }, [lines]);

    useEffect(() => {
        cursorPosRef.current = cursorPos;
    }, [cursorPos]);

    useEffect(() => {
        wordsRef.current = words;
    }, [words]);

    useEffect(() => {
        if (words.length > 0) {
            setLines(
                Array.from({ length: ROWS }).map(() => {
                    return generateLine(words);
                })
            );
        }
    }, [words]);

    useEffect(() => {
        // I need to change my cursor position
        // I need references to the lines though... in order to understand where I'm going
        const line = linesRef.current[cursorPosRef.current.line];
        //console.log('current line: ', line, line?.length, cursorPosRef.current);
        let movement = cursorMovement?.action;
        switch (movement) {
            case CursorAction.FORWARD:
                // we should move to next line
                if (cursorPosRef.current.letter + 1 >= line.length) {
                    setCursorPos((prev) => ({
                        line: prev.line + 1,
                        letter: 0,
                    }));
                    // if we hit the last line, we should append another line
                    if (
                        cursorPosRef.current.line + 1 ==
                        linesRef.current.length - 1
                    ) {
                        setLines((lines) => [...lines, generateLine(words)]);
                    }
                } else {
                    // move to next letter
                    setCursorPos((prev) => ({
                        line: prev.line,
                        letter: prev.letter + 1,
                    }));
                }
                break;
            case CursorAction.DELETE:
                if (cursorPosRef.current.letter == 0) {
                    break;
                }

                setCursorPos((prev) => ({
                    line: prev.line,
                    letter: prev.letter - 1,
                }));
                break;
            case CursorAction.SUPER_DELETE:
                // TODO: implement
                // useful
                // indexOf / lastIndexOf
                break;
        }
    }, [cursorMovement]);

    return [cursorPos, lines, setCursorMovement, setWords] as const;
};
