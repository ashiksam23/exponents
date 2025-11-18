import React, { useState } from 'react';

interface AccessPageProps {
    onLogin: (email: string, password: string) => boolean;
}

const AccessPage: React.FC<AccessPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            const success = onLogin(email, password);
            if (!success) {
                setError('Invalid email or password. Please try again.');
            }
            setIsLoading(false);
        }, 300);
    };

    return (
        <div className="page-container access-page">
            <div className="page-header centered">
                <h2>Sign In to ExponentOS</h2>
                <p>Enter your credentials to access the generator.</p>
            </div>
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label htmlFor="email" className="form-label">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 4h16v16H4z M4 6l8 6 8-6"></path>
                        </svg>
                        <span>Email Address</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`form-input ${error ? 'input-error' : ''}`}
                        placeholder="user@exponent.os"
                        aria-invalid={!!error}
                        autoFocus
                    />
                </div>

                <div className="form-group">
                     <label htmlFor="password" className="form-label">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14.5 3L21 9.5 14.5 16 8 9.5 14.5 3z"></path>
                            <path d="M11 13L3 21"></path>
                            <path d="M6 18h3v3"></path>
                        </svg>
                        <span>Password</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`form-input ${error ? 'input-error' : ''}`}
                        placeholder="••••••••••••"
                        aria-invalid={!!error}
                    />
                </div>

                {error && <p id="code-error" className="error-message">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="button"
                >
                    {isLoading ? (
                        <div className="spinner"></div>
                    ) : (
                        <>
                            <span>Sign In</span>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                               <path d="M5 12h14" />
                               <path d="M12 5l7 7-7 7" />
                            </svg>
                        </>
                    )}
                </button>
            </form>
            <div className="hint">
                 <p>Hint: Use <code>user@exponent.os</code> and <code>password123</code> to sign in.</p>
            </div>
            <div className="auth-links">
                <button type="button" className="link">Forgot Password?</button>
            </div>
            <div className="signup-link">
                <p>
                    Don't have an account?{' '}
                    <button type="button" className="link">
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AccessPage;