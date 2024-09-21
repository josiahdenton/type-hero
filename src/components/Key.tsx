import { useEffect, useState } from 'react';

interface KeyProps {
    display: string;
    pressed: boolean;
}

const Key: React.FC<KeyProps> = ({ display, pressed }) => {
    const [keyDown, setKeyDown] = useState<boolean>(false);

    useEffect(() => {
        if (pressed) {
            setKeyDown(true);
            const timeout = setTimeout(() => {
                setKeyDown(false);
            }, 50);
            return () => {
                // if a new key is pushed before the timeout, make sure we reset the state of the key
                setKeyDown(false);
                clearTimeout(timeout);
            };
        }
    }, [pressed]);

    if (display == ' ') {
        return (
            <div
                className={
                    keyDown
                        ? 'border border-gray-500 text-slate-700 rounded-lg p-4 min-w-32 scale-90'
                        : 'border border-gray-700 text-slate-700 rounded-lg p-4 min-w-32 shadow'
                }
            ></div>
        );
    }

    return (
        <div
            className={
                keyDown
                    ? 'border border-gray-500 text-slate-700 rounded-lg px-4 py-2 scale-90'
                    : 'border border-gray-700 text-slate-700 rounded-lg px-4 py-2 shadow'
            }
        >
            {display}
        </div>
    );
};

export default Key;
