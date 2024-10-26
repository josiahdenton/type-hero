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

export enum Action {
    ADD = 'ADD',
    DELETE = 'DELETE',
    SUPER_DELETE = 'SUPER_DELETE',
}

export type UserAction = {
    action: Action;
    timestamp: number;
    character: string;
};

export type CursorUpdate = Partial<UserAction> & {
    positionOfAction?: CursorPosition;
    currentPosition: CursorPosition;
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
    const [cursorUpdate, setCursorUpdate] = useState<CursorUpdate>({
        currentPosition: { line: 0, letter: 0 },
    });
    const cursorPosRef = useRef<CursorPosition>(cursorUpdate.currentPosition);

    const [words, setWords] = useState<string[]>([]);
    const [userAction, setUserAction] = useState<UserAction>();
    const [lines, setLines] = useState<string[]>([]);

    // TODO: make cursor a combo of userAction + cursorPos --> contentChanged?

    const wordsRef = useRef<string[]>(words);
    const linesRef = useRef<string[]>([]);

    useEffect(() => {
        linesRef.current = lines;
    }, [lines]);

    useEffect(() => {
        wordsRef.current = words;
        if (words.length > 0) {
            setLines(
                Array.from({ length: ROWS }).map(() => {
                    return generateLine(words);
                })
            );
        }
    }, [words]);

    useEffect(() => {
        if (
            cursorUpdate.currentPosition.line ==
            linesRef.current.length - 1
        ) {
            setLines((lines) => [...lines, generateLine(words)]);
        }
    }, [cursorUpdate]);

    useEffect(() => {
        if (!userAction) {
            return;
        }
        const line = linesRef.current[cursorPosRef.current.line];

        switch (userAction.action) {
            case Action.ADD:
                // we should move to next line
                if (cursorPosRef.current.letter + 1 >= line.length) {
                    setCursorUpdate((prev) => {
                        const update = {
                            ...userAction,
                            positionOfAction: prev.currentPosition,
                            currentPosition: {
                                line: prev.currentPosition.line + 1,
                                letter: 0,
                            },
                        };
                        cursorPosRef.current = update.currentPosition;
                        return update;
                    });
                } else {
                    // move to next letter
                    setCursorUpdate((prev) => {
                        const update = {
                            ...userAction,
                            positionOfAction: prev.currentPosition,
                            currentPosition: {
                                line: prev.currentPosition.line,
                                letter: prev.currentPosition.letter + 1,
                            },
                        };
                        cursorPosRef.current = update.currentPosition;
                        return update;
                    });
                }
                break;
            case Action.DELETE:
                if (cursorPosRef.current.letter == 0) {
                    break;
                }
                setCursorUpdate((prev) => {
                    const update = {
                        ...userAction,
                        positionOfAction: prev.currentPosition,
                        currentPosition: {
                            line: prev.currentPosition.line,
                            letter: prev.currentPosition.letter - 1,
                        },
                    };
                    cursorPosRef.current = update.currentPosition;
                    return update;
                });
                break;
            case Action.SUPER_DELETE:
                // TODO: implement
                // useful
                // indexOf / lastIndexOf
                break;
        }
    }, [userAction]);

    return [cursorUpdate, lines, setUserAction, setWords] as const;
};
