// TODO: implement a sliding window on the content we're using for type hero
// we would useRef<Slide>();

import { useEffect, useRef, useState } from 'react';
import { UserSettings } from './settings';

/**
 * WordEditor treats words like simple text.
 * Tracks cursor positions along words and easily
 * allows multi-word deleting.
 * */

const ROWS = 3;
const STARTING_POSITION: CursorUpdate = {
    currentPosition: { line: 0, letter: 0 },
};

type Scores = (boolean | undefined)[][];

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

const generateLine = (words: string[], maxLetters: number): string => {
    let line = '';
    while (true) {
        // idk if we should make this better... probably...
        const word = words[Math.floor(Math.random() * words.length)];
        if ((line + word).length >= maxLetters) {
            break;
        }
        line += word + ' ';
    }
    return line;
};

// TODO: have this return [cursorPos, content, moveCursor, setWords]
export const useTypingGame = (settings: UserSettings) => {
    const [cursorUpdate, setCursorUpdate] =
        useState<CursorUpdate>(STARTING_POSITION);
    const cursorPosRef = useRef<CursorPosition>(cursorUpdate.currentPosition);

    const [words, setWords] = useState<string[]>([]);
    const [userAction, setUserAction] = useState<UserAction>();
    const [lines, setLines] = useState<string[]>([]);

    const linesRef = useRef<string[]>([]);

    const [scores, setScores] = useState<(boolean | undefined)[][]>([]);
    const scoresRef = useRef(scores);
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
        linesRef.current = lines;
    }, [lines]);

    // if we get new words, restart the whole game
    useEffect(() => {
        setLines([]);
        setScores([]);
        setCursorUpdate(STARTING_POSITION);
        cursorPosRef.current = STARTING_POSITION.currentPosition;
        if (words.length > 0) {
            setLines(
                Array.from({ length: ROWS }).map(() => {
                    return generateLine(words, settings.maxLetters);
                })
            );
        }
    }, [words]);

    useEffect(() => {
        if (cursorUpdate.currentPosition.line == linesRef.current.length - 1) {
            setLines((lines) => [
                ...lines,
                generateLine(words, settings.maxLetters),
            ]);
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
                        onCursorUpdate(update, linesRef.current, setScores);

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
                        onCursorUpdate(update, linesRef.current, setScores);

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
                    onCursorUpdate(update, linesRef.current, setScores);

                    return update;
                });
                break;
            case Action.SUPER_DELETE:
                setCursorUpdate((prev) => {
                    const update = {
                        ...userAction,
                        positionOfAction: prev.currentPosition,
                        currentPosition: moveToStartOfWord(
                            prev.currentPosition,
                            line
                        ),
                    };
                    cursorPosRef.current = update.currentPosition;
                    onCursorUpdate(update, linesRef.current, setScores);

                    return update;
                });
                break;
        }
    }, [userAction]);

    return [scores, cursorUpdate, lines, setUserAction, setWords] as const;
};

const moveToStartOfWord = (
    cursorPos: CursorPosition,
    line: string
): CursorPosition => {
    cursorPos.letter;
    if (cursorPos.letter === 0) {
        return cursorPos;
    }

    let pos = cursorPos.letter - 1;
    // this moves to the left until we hit whitespace
    while (line[pos] !== ' ' && pos > 0) {
        pos--;
    }

    // add 1 so we're sitting at the start of the word.
    // special case, if it's the first word in a line we go to the start
    // of the line.
    return { line: cursorPos.line, letter: pos > 0 ? pos + 1 : 0 };
};

const onCursorUpdate = (
    cursorUpdate: CursorUpdate,
    lines: string[],
    setScores: React.Dispatch<React.SetStateAction<Scores>>
) => {
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
        setScores((scores) =>
            scores.map((line, linePos) => {
                if (
                    linePos === currentPosition.line &&
                    cursorUpdate.positionOfAction
                ) {
                    for (
                        let i = cursorUpdate.currentPosition.letter;
                        i < cursorUpdate.positionOfAction.letter;
                        i++
                    ) {
                        line[i] = undefined;
                    }
                }
                return line;
            })
        );
    } else if (cursorUpdate.action === Action.ADD) {
        const letter = lines[positionOfAction.line][positionOfAction.letter];
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
};
