import { useState } from 'react';
import Keyboard, { Layout } from './components/Keyboard';
import WordBox, { GameState } from './components/WordBox';

function App() {
    const [running, setRunning] = useState<boolean>(false);

    return (
        <div
            className={
                'flex flex-col px-8 pt-8 gap-10 overflow-hidden' +
                (running ? ' cursor-none' : '')
            }
        >
            <h1 className="text-3xl font-bold self-center text-slate-500">
                Keyboard Type Hero!
            </h1>
            <div className="flex flex-col justify-center gap-4 self-center py-16">
                <WordBox
                    className="self-center text-center text-4xl"
                    content="the quick brown fox jumped over the red fence on his way to the grocery store."
                    onGameStateChange={(ev) => {
                        if (ev === GameState.STARTED) {
                            console.log('STARTED');
                            setRunning(true);
                        } else if (ev === GameState.ENDED) {
                            console.log('ENDED');
                            setRunning(false);
                        }
                    }}
                />

                <br />
                <br />

                <div className="flex flex-col w-full">
                    <Keyboard className="self-center" layout={Layout.QWERTY} />
                </div>
            </div>
        </div>
    );
}

export default App;
