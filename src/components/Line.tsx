import Letter, { LetterState } from './Letter';

interface LineProps {
    line: string;
    linePos: number;
    lineScore: (boolean | undefined)[];
}
// I'll have to take a score? which would be line[i] -> state, index map (e.g. array)?
// will have to be [i][j] -> LetterState
// need to get passed a letter score...
// I'll keep appending

/*
 * to ensure lines work correctly..
 * I need a way to track them...
 * how will my scoring react hook work
 *
 * returns --> scores
 * */

const Line: React.FC<LineProps> = ({ line, linePos, lineScore }) => {
    return (
        <div>
            {line.split('').map((character, i) => {
                return (
                    <Letter
                        id={`line-${linePos}-letter-${i}`}
                        key={i}
                        letter={character}
                        state={
                            lineScore && lineScore[i] !== undefined
                                ? lineScore[i]
                                    ? LetterState.MATCHED
                                    : LetterState.NO_MATCH
                                : LetterState.READY
                        }
                    />
                );
            })}
        </div>
    );
};

export default Line;
