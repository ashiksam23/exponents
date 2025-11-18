import React, { useState, useCallback, useEffect } from 'react';
import BriefingPage from './components/BriefingPage';
import ConceptsPage from './components/ConceptsPage';
import PackagePage from './components/PackagePage';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import AccessPage from './components/AccessPage';
import Sidebar from './components/Sidebar';
import { generateIdeas, buildPackage } from './services/geminiService';
import type { Concept, PackageData, Theme } from './types';

type Page = 'briefing' | 'concepts' | 'package' | 'loading' | 'error';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [page, setPage] = useState<Page>('briefing');
    const [loadingText, setLoadingText] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [packageData, setPackageData] = useState<PackageData | null>(null);
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('isAuthenticated') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        document.body.classList.toggle('light-mode', theme === 'light');
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        document.body.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    const handleThemeToggle = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleLogin = useCallback((email: string, password: string): boolean => {
        if (email.toLowerCase() === 'user@exponent.os' && password === 'password123') {
            sessionStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, []);


    const handleGenerateIdeas = useCallback(async (icp: string, painPoint: string) => {
        setLoadingText('Generating data-backed concepts...');
        setPage('loading');
        try {
            const ideas = await generateIdeas(icp, painPoint);
            setConcepts(ideas);
            setPage('concepts');
        } catch (error) {
            console.error(error);
            setErrorMessage('Failed to generate ideas. The API may be overloaded. Please try again in a moment.');
            setPage('error');
        }
    }, []);

    const handleSelectConcept = useCallback(async (concept: Concept) => {
        setLoadingText('Building your complete asset package... This may take up to 60 seconds.');
        setPage('loading');
        try {
            const data = await buildPackage(concept);
            setPackageData(data);
            setPage('package');
        } catch (error) {
            console.error(error);
            setErrorMessage('Failed to build the asset package. This is a large request; please try again.');
            setPage('error');
        }
    }, []);

    const handleStartOver = useCallback(() => {
        setPage('briefing');
        setConcepts([]);
        setPackageData(null);
    }, []);

    const renderPage = () => {
        switch (page) {
            case 'briefing':
                return <BriefingPage onGenerateIdeas={handleGenerateIdeas} />;
            case 'concepts':
                return <ConceptsPage concepts={concepts} onSelectConcept={handleSelectConcept} onStartOver={handleStartOver} />;
            case 'package':
                return packageData ? <PackagePage packageData={packageData} onStartOver={handleStartOver} /> : null;
            case 'loading':
                return <LoadingSpinner text={loadingText} />;
            case 'error':
                return <ErrorDisplay message={errorMessage} onStartOver={handleStartOver} />;
            default:
                return <BriefingPage onGenerateIdeas={handleGenerateIdeas} />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar 
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            />
            <main className="main-content">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Exponent Lead Magnet Generator</h1>
                        <p>
                            {isAuthenticated
                                ? 'Generate a complete, data-backed lead magnet and GTM plan in 60 seconds.'
                                : 'An AI-powered tool for creating high-conversion marketing assets.'
                            }
                        </p>
                    </div>
                    <div className="theme-toggle">
                        <svg className="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        <label htmlFor="theme-switch" className="switch">
                            <input
                                type="checkbox"
                                id="theme-switch"
                                onChange={handleThemeToggle}
                                checked={theme === 'dark'}
                            />
                            <span className="slider"></span>
                            <span className="sr-only">Toggle theme</span>
                        </label>
                        <svg className="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    </div>
                </header>
                <div className="page-content">
                    {isAuthenticated ? renderPage() : <AccessPage onLogin={handleLogin} />}
                </div>
            </main>
        </div>
    );
};

export default App;
