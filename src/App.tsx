import Keyboard, { Layout } from './components/Keyboard';
import Game from './components/Game';
import { useSettings } from './hooks/settings';

function App() {
    const [settings, _] = useSettings();

    return (
        <div className={'flex flex-col px-8 pt-8 gap-10 overflow-hidden'}>
            <h1 className="text-3xl font-bold self-center text-slate-500">
                Keyboard Type Hero!
            </h1>
            <div className="flex flex-col justify-center gap-4 self-center py-16">
                <Game
                    className="self-center text-center text-4xl outline-none"
                    content="the quick brown fox jumped over the red fence on his way to the grocery store."
                    settings={settings}
                />

                <br />
                <br />

                {settings.showKeyboard && (
                    <div className="flex flex-col w-full">
                        <Keyboard
                            className="self-center"
                            layout={Layout.QWERTY}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
