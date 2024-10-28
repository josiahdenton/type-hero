import { useEffect, useState } from 'react';

export enum SupportDeleteKey {
    CTRL,
    ALT,
}

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
    });

    useEffect(() => {
        // fetch from localStorage

        // on cleanup, save settings to localStorage
        return () => {};
    }, []);

    return [settings, setSettings] as const;
};
