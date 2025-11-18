import React from 'react';

interface LoadingSpinnerProps {
    text: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
    return (
        <div className="page-container centered">
            <div className="spinner-large" role="status">
                <span className="sr-only">Loading...</span>
            </div>
            <p className="loading-text">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
