interface LetterProps {
    letter: string;
    id: string;
    state: LetterState;
}

export enum LetterState {
    READY,
    MATCHED,
    NO_MATCH,
}

const Letter: React.FC<LetterProps> = ({ letter, state, id }) => {
    let styling = 'font-bold px-[0.05rem] ';
    switch (state) {
        case LetterState.READY:
            styling += 'text-pink-500';
            break;
        case LetterState.MATCHED:
            styling += 'text-gray-700';
            break;
        case LetterState.NO_MATCH:
            styling += 'text-rose-800';
            break;
    }

    return (
        <span id={id} className={styling}>
            {letter}
        </span>
    );
};

export default Letter;
