//import { useState } from "react";

import Keyboard, { Layout } from './components/Keyboard';
import WordBox from './components/WordBox';

function App() {
    return (
        <div className="flex flex-col p-8 gap-10">
            <h1 className="text-3xl font-bold self-center text-slate-700">
                Keyboard Type Hero!
            </h1>
            <div className="flex flex-col justify-between self-center py-16">
                <WordBox
                    className="self-center text-center text-4xl cursor-none"
                    content="the quick brown fox jumped over the red fence on his way to the grocery store."
                    active={true}
                />
                <div className="py-16 max-w-0"></div>

                <div className="flex flex-col w-full">
                    <Keyboard
                        className="self-center"
                        layout={Layout.COLEMAK_DH}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
