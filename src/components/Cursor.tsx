interface CursorProps {
    waiting: boolean;
    className?: string;
    point: Point;
}

export type Point = {
    x: number;
    y: number;
};

const Cursor: React.FC<CursorProps> = ({ waiting, className, point: position }) => {
    return (
        <span
            style={{
                top: position.y,
                left: position.x,
            }}
            className={
                className +
                ' border-2 my-2 h-7 border-white bg-white ' +
                (waiting ? 'animate-blink' : '')
            }
        ></span>
    );
};

export default Cursor;
