interface ResultProps {
    wpm: number;
    accuracy: string;
    onRestart: () => void;
}

const Result: React.FC<ResultProps> = ({ accuracy, wpm, onRestart }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="text-pink-500 rounded-lg shadow self-center">
                {wpm}
                <div className="text-slate-500">wpm</div>
            </div>
            <div className="text-pink-500 rounded-lg shadow self-center">
                {accuracy}
                <div className="text-slate-500">accurate</div>
            </div>
            <button
                className="text-slate-500 border border-pink-500 rounded-lg p-2 shadow self-center mt-2"
                onClick={onRestart}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-pink-500"
                >
                    <path
                        d="M12 2V6C7.58 6 4 9.58 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14H18C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14C6 10.69 8.69 8 12 8V12L17 7L12 2Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
        </div>
    );
};

export default Result;
