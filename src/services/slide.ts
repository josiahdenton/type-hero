// TODO: implement a sliding window on the content we're using for type hero
// we would useRef<Slide>();

/**
 * WordEditor treats words like simple text.
 * Tracks cursor positions along words and easily
 * allows multi-word deleting.
 * */
export class Slide {
    /**
     * a section is a group of words
     * */
    private _section: Array<Array<string>>;

    private _activeSection: number;

    /**
     * all words that will be used in a game
     * */
    private _words: Array<string>;

    /**
     * this active section's content window, or a combined view of the words in play
     * will get reset if we move to a new section
     * */
    private _content: string;

    /**
     * where the user is in the content
     * */
    private _cursorPos: number;

    /**
     * max words to show in a content window
     * */
    private _maxWords: number;

    constructor(maxWords: number) {
        this._maxWords = maxWords;
    }

    get cursor(): number {
        return this._cursorPos;
    }

    get cursorValue(): string {
        return this._content[this._cursorPos];
    }

    get content(): string {
        return this.content;
    }

    public setWords(words: Array<string>) {
        this.words = words;
    }

    /**
     * deletes everything up to the start of the current word.
     * use for "ctrl/option + delete"
     * */
    public backWord() {
        // find where I am in the current word, then go back that many from the cursor
    }
}
