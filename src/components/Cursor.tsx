interface CursorProps {
    waiting: boolean;
    className?: string;
    position: CursorPosition;
}

export type CursorPosition = {
    x: number;
    y: number;
};

const Cursor: React.FC<CursorProps> = ({ waiting, className, position }) => {
    return (
        <span
            style={{
                top: position.y,
                left: position.x,
            }}
            className={
                className +
                ' border-2 my-2 border-white bg-white ' +
                (waiting ? 'animate-blink' : '')
            }
        ></span>
    );
};

export default Cursor;
