//import { useState } from "react";

import Keyboard, { Layout } from './components/Keyboard';
import WordBox from './components/WordBox';

function App() {
    return (
        <div className="flex flex-col px-8 pt-8 gap-10 overflow-hidden">
            <h1 className="text-3xl font-bold self-center text-slate-700">
                Keyboard Type Hero!
            </h1>
            <div className="flex flex-col justify-center gap-4 self-center py-16">
                <WordBox
                    className="self-center text-center text-4xl cursor-none"
                    content="the quick brown fox jumped over the red fence on his way to the grocery store."
                    active={true}
                />
                <div className="py-16 max-w-0"></div>

                <div className="flex flex-col w-full">
                    <Keyboard
                        className="self-center"
                        layout={Layout.QWERTY}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
