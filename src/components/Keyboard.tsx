// QWERTY
// q w e r t   y u i o p
// a s d f g   h j k l ;
// z x c v b   n m , .
//     (space)

import { useEffect, useState } from 'react';
import Key from './Key';
import Spacer from './Spacer';

const qwertyLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    [' '],
];

// q w f p b j l u y ;
// a r s t g m n e i o
// z x c d v k h , .
//     (space)

const colemakLayout = [
    ['q', 'w', 'f', 'p', 'b', 'j', 'l', 'u', 'y', ';'],
    ['a', 'r', 's', 't', 'g', 'm', 'n', 'e', 'i', 'o'],
    ['z', 'x', 'c', 'd', 'v', 'k', 'h', ',', '.'],
    [' '],
];

export enum Layout {
    QWERTY,
    COLEMAK_DH,
}

const layoutByType = {
    [Layout.QWERTY]: qwertyLayout,
    [Layout.COLEMAK_DH]: colemakLayout,
};

interface KeyboardProps {
    layout: Layout;
    className?: string;
}

const Keyboard: React.FC<KeyboardProps> = ({ layout, className }) => {
    const [keyPressed, setKeyPressed] = useState<string>();
    const selectedLayout = layoutByType[layout];

    // ensure if user stops typing, the key will go away
    useEffect(() => {
        const timeout = setTimeout(() => {
            setKeyPressed('');
        }, 500);
        return () => clearTimeout(timeout);
    }, [keyPressed]);

    const handleKeyDown = (ev: KeyboardEvent) => {
        // I should just have a Record...?
        setKeyPressed(ev.key);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    return (
        <div className={'flex flex-col gap-2 ' + className}>
            {selectedLayout.map((row, i) => {
                return (
                    <div key={i} className="flex flex-row gap-2 justify-around">
                        {i != 3 ? <Spacer size={i} /> : null}
                        {row.map((key, j) => {
                            return (
                                <Key
                                    key={j}
                                    display={key}
                                    pressed={key == keyPressed}
                                />
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default Keyboard;
