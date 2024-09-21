interface SpacerProps {
    size: number;
}

const Spacer: React.FC<SpacerProps> = ({ size }) => {
    return new Array(size).fill(<div className="px-2"></div>);
};

export default Spacer;
