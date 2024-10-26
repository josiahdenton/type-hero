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
                ' w-[0.15rem] my-1 h-9 border-white bg-white ' +
                (waiting ? 'animate-blink' : '')
            }
        ></span>
    );
};

export default Cursor;
