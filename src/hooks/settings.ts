import { useEffect, useState } from 'react';

export enum SupportDeleteKey {
    CTRL,
    ALT,
}

const MIN_KEYBOARD_WIDTH = 510;

// el: HTMLDivElement
export const getMaxLetters = () => {
    //const bounds = el.getBoundingClientRect()
    const width = window.innerWidth;
    const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );

    // py-2 padding
    // everything seemed off by 5...?
    return Math.floor(width / (rootFontSize * 2.25)) + 5;
};

export const shouldShowKeyboard = () => {
    const width = window.innerWidth;
    return width >= MIN_KEYBOARD_WIDTH;
};

// TODO: check out other OS userAgent data examples
const getSupportDeleteKey = () => {
    const userAgent = window.navigator.userAgent;

    if (
        userAgent.includes('Mac') ||
        userAgent.includes('iPhone') ||
        userAgent.includes('iPad')
    ) {
        return SupportDeleteKey.ALT;
    }

    return SupportDeleteKey.CTRL;
};

export type UserSettings = {
    supportDeleteKey: SupportDeleteKey;
    maxLetters: number;
    showKeyboard: boolean;
};

export const shouldDeleteWord = (
    ev: KeyboardEvent,
    setting: UserSettings
): boolean => {
    return setting.supportDeleteKey === SupportDeleteKey.ALT
        ? ev.altKey
        : ev.ctrlKey;
};

export const useSettings = () => {
    const [settings, setSettings] = useState<UserSettings>({
        supportDeleteKey: getSupportDeleteKey(),
        maxLetters: getMaxLetters(),
        showKeyboard: shouldShowKeyboard(),
    });

    useEffect(() => {
        // fetch from localStorage
        const onWindowResize = () => {
            setSettings((settings) => ({
                ...settings,
                maxLetters: getMaxLetters(),
                showKeyboard: shouldShowKeyboard(),
            }));
        };

        window.addEventListener('resize', onWindowResize);

        // on cleanup, save settings to localStorage
        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

    return [settings, setSettings] as const;
};
