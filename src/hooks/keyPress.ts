import { useEffect } from 'react';

const useKeyPress = (ignore: string[]) => {
    const [keyPress, setKeyPress] = useState<string>('');

    const handleUserInput = (ev: KeyboardEvent) => {
        if (['Shift', 'Control', 'Meta'].includes(event.key)) {
            return;
    };

    useEffect(() => {
        window.addEventListener('keydown', handleUserInput);
        return () => {
            window.removeEventListener('keydown', handleUserInput);
        };
    }, []);

    return [keyPress] as const;
};
