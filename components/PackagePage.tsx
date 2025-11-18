import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import type { PackageData } from '../types';
import CopyableBlock from './CopyableBlock';

interface PackagePageProps {
    packageData: PackageData;
    onStartOver: () => void;
}

type Tab = 'audit' | 'results' | 'funnel' | 'gtm';

// A dedicated component to render all package data in a single, print-friendly layout.
const PrintableContent: React.FC<{ packageData: PackageData }> = ({ packageData }) => {
    const { audit, results, funnel, gtm } = packageData;
    return (
        <div className="printable-package">
            <h1>Your Lead Magnet Package</h1>
            <section>
                <h2>1. The Audit</h2>
                <h3>Audit Questions</h3>
                {audit.questions.map(q => (
                    <div key={q.id} className="print-card">
                        <p><b>{q.id}. {q.text}</b> ({q.type.replace('_', ' ')})</p>
                        {q.options && q.options.length > 0 && (
                            <ul>
                                {q.options.map((opt, index) => <li key={index}>{opt}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
                <h3>Scoring Logic</h3>
                <div className="prose-block" dangerouslySetInnerHTML={{ __html: audit.scoringLogic }} />
            </section>
            <section>
                <h2>2. The Results</h2>
                 <div><h3>Low Score</h3><div className="prose-block" dangerouslySetInnerHTML={{ __html: results.lowScore }} /></div>
                 <div><h3>Mid Score</h3><div className="prose-block" dangerouslySetInnerHTML={{ __html: results.midScore }} /></div>
                 <div><h3>High Score</h3><div className="prose-block" dangerouslySetInnerHTML={{ __html: results.highScore }} /></div>
            </section>
            <section>
                <h2>3. The Funnel</h2>
                <h3>Landing Page Copy</h3>
                <div className="prose-block" dangerouslySetInnerHTML={{ __html: funnel.landingPageCopy }} />
                <h3>3-Part Email Nurture Sequence</h3>
                {funnel.emailSequence.map((email, i) => (<div className="print-card" key={i}><h4>Subject: {email.subject}</h4><div className="prose-block" dangerouslySetInnerHTML={{ __html: email.body}}/></div>))}
            </section>
             <section>
                 <h2>4. The GTM Plan</h2>
                 <h3>Organic GTM Ideas</h3>
                 {gtm.organicIdeas.map((idea, i) => (<div className="print-card" key={i}><h4>{idea.title}</h4><p>{idea.hook}</p></div>))}
                 <h3>Paid Ad Copy</h3>
                 {gtm.paidAds.map((ad, i) => (<div className="print-card" key={i}><h4>{ad.platform} Ad</h4><p><b>Headline:</b> {ad.headline}</p><p><b>Body:</b> {ad.body}</p></div>))}
                 <h3>Paid Ad Optimization</h3>
                 {gtm.paidAdOptimizations.map((opt, i) => (<div className="print-card" key={i}><h4>{opt.platform} Optimization</h4><h5>Targeting</h5><div className="prose-block" dangerouslySetInnerHTML={{ __html: opt.targeting }}/><hr /><h5>Goals</h5><div className="prose-block" dangerouslySetInnerHTML={{ __html: opt.goals }} /></div>))}
            </section>
        </div>
    );
};


const PackagePage: React.FC<PackagePageProps> = ({ packageData, onStartOver }) => {
    const [activeTab, setActiveTab] = useState<Tab>('audit');
    const [isExporting, setIsExporting] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    const { audit, results, funnel, gtm } = packageData;
    
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        const activeButton = nav.querySelector<HTMLButtonElement>('.tab-button.active');
        if (activeButton) {
            nav.style.setProperty('--active-tab-left', `${activeButton.offsetLeft}px`);
            nav.style.setProperty('--active-tab-width', `${activeButton.offsetWidth}px`);
        }
    }, [activeTab]);


    const tabs: { id: Tab; label: string }[] = [
        { id: 'audit', label: '1. The Audit' },
        { id: 'results', label: '2. The Results' },
        { id: 'funnel', label: '3. The Funnel' },
        { id: 'gtm', label: '4. The GTM Plan' },
    ];

    const handleExport = () => {
        setIsExporting(true);
    
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.title = 'Print Content'; 
    
        document.body.appendChild(iframe);
    
        const printDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!printDoc) {
            alert("Could not open print view. Please check your browser settings.");
            setIsExporting(false);
            document.body.removeChild(iframe);
            return;
        }
    
        printDoc.open();
        printDoc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Exponent Lead Magnet Package</title>
                    <link rel="stylesheet" href="index.css">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                </head>
                <body>
                    <div id="print-root"></div>
                </body>
            </html>
        `);
        printDoc.close();
    
        const printRootElement = printDoc.getElementById('print-root');
        if (printRootElement) {
            const printRoot = ReactDOM.createRoot(printRootElement);
            
            const handlePrint = () => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                
                // Set a timer to clean up, allowing the print dialog to close
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    setIsExporting(false);
                }, 1000);
            };

            // Use a short timeout to ensure all styles and fonts are loaded
            // before triggering the print dialog.
            const renderTimeout = setTimeout(() => {
                handlePrint();
            }, 500);

            printRoot.render(
                <React.StrictMode>
                    <PrintableContent packageData={packageData} />
                </React.StrictMode>
            );

        } else {
             alert("Failed to initialize the print view.");
             setIsExporting(false);
             document.body.removeChild(iframe);
        }
    };
    

    const renderContent = () => {
        switch (activeTab) {
            case 'audit':
                return (
                    <div className="tab-content">
                        <div>
                            <h3>Audit Questions</h3>
                            <p>Use these questions in your quiz tool (e.g., Typeform, Tally, Outgrow). You can copy the entire block below.</p>
                             <CopyableBlock>
                                <div className="list-container">
                                    {audit.questions.map(q => (
                                        <div key={q.id} className="audit-question-card">
                                            <div className="item-id">{q.id}</div>
                                            <div>
                                                <p>{q.text}</p>
                                                <div className="tag-container">
                                                     <span className="tag">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                          <path d="M14 2v6h6"></path>
                                                          <path d="M16 13H8"></path>
                                                          <path d="M16 17H8"></path>
                                                          <path d="M10 9H8"></path>
                                                        </svg>
                                                        {q.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                </div>
                                                {q.options && q.options.length > 0 && (
                                                    <div className="options-list">
                                                        <p>Options:</p>
                                                        <ul>
                                                            {q.options.map((opt, index) => <li key={index}>{opt}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CopyableBlock>
                        </div>
                        <div>
                            <h3>Scoring Logic</h3>
                            <CopyableBlock>
                                <div className="prose-block" dangerouslySetInnerHTML={{ __html: audit.scoringLogic }} />
                            </CopyableBlock>
                        </div>
                    </div>
                );
            case 'results':
                return (
                    <div className="tab-content">
                        <h3>Personalized Result Pages</h3>
                        <p>Show these pages to users based on their final score from the audit.</p>
                        <div className="grid grid-cols-3">
                            <CopyableBlock>
                                <div className="result-card low-score">
                                    <div className="result-card-header">
                                        <h4>Low Score Result</h4>
                                        <p>For users who need significant help.</p>
                                    </div>
                                    <div className="copyable-block-content prose-block" dangerouslySetInnerHTML={{ __html: results.lowScore }} />
                                </div>
                            </CopyableBlock>
                            <CopyableBlock>
                                <div className="result-card mid-score">
                                     <div className="result-card-header">
                                        <h4>Mid Score Result</h4>
                                        <p>For users who are on the right track.</p>
                                    </div>
                                    <div className="copyable-block-content prose-block" dangerouslySetInnerHTML={{ __html: results.midScore }} />
                                </div>
                            </CopyableBlock>
                            <CopyableBlock>
                                 <div className="result-card high-score">
                                     <div className="result-card-header">
                                        <h4>High Score Result</h4>
                                        <p>For users who are already excelling.</p>
                                    </div>
                                    <div className="copyable-block-content prose-block" dangerouslySetInnerHTML={{ __html: results.highScore }} />
                                </div>
                            </CopyableBlock>
                        </div>
                    </div>
                );
            case 'funnel':
                return (
                     <div className="tab-content">
                        <div>
                            <h3>Landing Page Copy</h3>
                            <CopyableBlock>
                               <div className="prose-block" dangerouslySetInnerHTML={{ __html: funnel.landingPageCopy }} />
                            </CopyableBlock>
                        </div>
                        <div>
                            <h3>3-Part Email Nurture Sequence</h3>
                             <div className="list-container">
                                {funnel.emailSequence.map((email, i) => (
                                     <CopyableBlock key={i}>
                                        <div className="email-item">
                                            <div className="item-id">{i + 1}</div>
                                            <div>
                                                <h4>Subject: {email.subject}</h4>
                                                <div className="prose-block" dangerouslySetInnerHTML={{ __html: email.body}}/>
                                            </div>
                                        </div>
                                    </CopyableBlock>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'gtm':
                return (
                     <div className="tab-content">
                        <div>
                            <h3>Organic GTM Ideas (Blog/Social)</h3>
                            <CopyableBlock>
                                <div className="grid grid-cols-2">
                                    {gtm.organicIdeas.map((idea, i) => (
                                        <div key={i} className="card">
                                            <div className="card-icon">
                                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h4>{idea.title}</h4>
                                                <p>{idea.hook}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CopyableBlock>
                        </div>
                        <div>
                            <h3>Paid Ad Copy</h3>
                            <CopyableBlock>
                                <div className="list-container">
                                    {gtm.paidAds.map((ad, i) => (
                                        <div key={i} className="card">
                                            <h4>{ad.platform} Ad</h4>
                                            <div>
                                                <p><strong>Headline:</strong> {ad.headline}</p>
                                                <p><strong>Body:</strong> {ad.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CopyableBlock>
                        </div>
                        {gtm.paidAdOptimizations && gtm.paidAdOptimizations.length > 0 && (
                            <div>
                                <h3>Paid Ad Optimization</h3>
                                <CopyableBlock>
                                    <div className="list-container">
                                        {gtm.paidAdOptimizations.map((opt, i) => (
                                            <div key={i} className="card">
                                                <h4>{opt.platform} Optimization</h4>
                                                <div className="prose-block">
                                                    <h5>Targeting Recommendations</h5>
                                                    <div dangerouslySetInnerHTML={{ __html: opt.targeting }} />
                                                    <h5>Campaign Goal Recommendations</h5>
                                                    <div dangerouslySetInnerHTML={{ __html: opt.goals }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CopyableBlock>
                            </div>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className="page-container">
            <div className="page-header space-between">
                <div>
                    <h2>Your Lead Magnet Package is Ready</h2>
                     <p>All assets have been generated. You can now copy them or export the full package as a PDF.</p>
                </div>
                <div className="header-actions">
                     <button 
                        onClick={onStartOver} 
                        className="button button-secondary"
                     >
                        &larr; Start Over
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="button"
                        aria-live="polite"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            <div className="tabs">
                <nav className="tab-nav" ref={navRef}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="tab-panel">
                {renderContent()}
            </div>
        </div>
    );
};

export default PackagePage;