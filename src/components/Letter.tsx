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
    let styling = 'font-bold px-[0.10rem] ';
    let content = letter;

    switch (state) {
        case LetterState.READY:
            styling += 'text-pink-500';
            break;
        case LetterState.MATCHED:
            styling += 'text-gray-700';
            break;
        case LetterState.NO_MATCH:
            if (letter === ' ') {
                content = '·';
            }
                styling += 'text-rose-800';
            break;
    }

    return (
        <span id={id} className={styling}>
            {content}
        </span>
    );
};

export default Letter;
