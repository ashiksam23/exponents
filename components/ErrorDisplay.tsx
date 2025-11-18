import React from 'react';

interface ErrorDisplayProps {
    message: string;
    onStartOver: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onStartOver }) => {
    return (
        <div className="page-container">
            <div className="error-display">
                <div className="error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 9v2m0 4h.01"></path>
                        <path d="M2.998 8.524L12 2l9.002 6.524v6.952L12 22l-9.002-6.524V8.524z"></path>
                    </svg>
                </div>
                <div className="error-content">
                    <h3>An Error Occurred</h3>
                    <p>{message}</p>
                    <button onClick={onStartOver} className="button button-secondary">Start Over</button>
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;
