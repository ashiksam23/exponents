import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import type { PackageData } from '../types';
import CopyableBlock from './CopyableBlock';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface PackagePageProps {
    packageData: PackageData;
    onStartOver: () => void;
}

type Tab = 'audit' | 'results' | 'funnel' | 'gtm';

// A dedicated component to render all package data in a single, print-friendly layout.
// This ensures that all CSS styles are correctly applied for the PDF conversion.
const PrintableContent: React.FC<{ packageData: PackageData }> = ({ packageData }) => {
    const { audit, results, funnel, gtm } = packageData;
    // This component is only for PDF generation and won't be styled by index.css,
    // so it retains its own minimal styling for the PDF output.
    return (
        <div className="printable-content" style={{ color: '#111', fontFamily: 'sans-serif', padding: '1in' }}>
            <style>
            {`
                .printable-content h1 { font-size: 28px; border-bottom: 2px solid #E24A37; padding-bottom: 8px; margin-bottom: 24px; }
                .printable-content h2 { font-size: 20px; border-left: 3px solid #E24A37; padding-left: 12px; margin: 24px 0 16px; }
                .printable-content h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
                .printable-content section { margin-bottom: 32px; }
                .printable-content .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
                .printable-content .prose-block { border: 1px solid #eee; padding: 16px; }
            `}
            </style>
            <h1>Your Lead Magnet Package</h1>
            <section>
                <h2>1. The Audit</h2>
                <h3>Audit Questions</h3>
                {audit.questions.map(q => (<div key={q.id}><p><b>{q.id}. {q.text}</b> ({q.type})</p></div>))}
                <h3>Scoring Logic</h3>
                <div className="prose-block" dangerouslySetInnerHTML={{ __html: audit.scoringLogic }} />
            </section>
            <section>
                <h2>2. The Results</h2>
                <div className="grid">
                     <div><h3>Low Score</h3><div className="prose-block" dangerouslySetInnerHTML={{ __html: results.lowScore }} /></div>
                     <div><h3>Mid Score</h3><div className="prose-block" dangerouslySetInnerHTML={{ __html: results.midScore }} /></div>
                     <div><h3>High Score</h3><div className="prose-block" dangerouslySetInnerHTML={{ __html: results.highScore }} /></div>
                </div>
            </section>
            <section>
                <h2>3. The Funnel</h2>
                <h3>Landing Page Copy</h3>
                <div className="prose-block" dangerouslySetInnerHTML={{ __html: funnel.landingPageCopy }} />
                <h3>3-Part Email Nurture Sequence</h3>
                {funnel.emailSequence.map((email, i) => (<div key={i}><h4>Subject: {email.subject}</h4><div className="prose-block" dangerouslySetInnerHTML={{ __html: email.body}}/></div>))}
            </section>
             <section>
                 <h2>4. The GTM Plan</h2>
                 <h3>Organic GTM Ideas</h3>
                 {gtm.organicIdeas.map((idea, i) => (<div key={i}><h4>{idea.title}</h4><p>{idea.hook}</p></div>))}
                 <h3>Paid Ad Copy</h3>
                 {gtm.paidAds.map((ad, i) => (<div key={i}><h4>{ad.platform} Ad</h4><p><b>Headline:</b> {ad.headline}</p><p><b>Body:</b> {ad.body}</p></div>))}
                 <h3>Paid Ad Optimization</h3>
                 {gtm.paidAdOptimizations.map((opt, i) => (<div key={i}><h4>{opt.platform}</h4><div className="prose-block"><h5>Targeting</h5><div dangerouslySetInnerHTML={{ __html: opt.targeting }}/><h5>Goals</h5><div dangerouslySetInnerHTML={{ __html: opt.goals }} /></div></div>))}
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

    const handleExport = async () => {
        setIsExporting(true);

        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.top = '0';
        pdfContainer.style.width = '8.5in';
        pdfContainer.style.background = 'white';
        document.body.appendChild(pdfContainer);

        const root = ReactDOM.createRoot(pdfContainer);
        root.render(<PrintableContent packageData={packageData} />);

        setTimeout(async () => {
            try {
                const canvas = await html2canvas(pdfContainer, { scale: 1 });
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt',
                    format: 'a4',
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / pdfWidth;
                const scaledCanvasHeight = canvasHeight / ratio;
                let heightLeft = scaledCanvasHeight;
                let position = 0;
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledCanvasHeight);
                heightLeft -= pdfHeight;
                while (heightLeft > 0) {
                    position -= pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledCanvasHeight);
                    heightLeft -= pdfHeight;
                }
                pdf.save('exponent-lead-magnet-package.pdf');
            } catch (error) {
                console.error("Failed to export PDF:", error);
                alert("Sorry, there was an error creating the PDF. Please try again.");
            } finally {
                root.unmount();
                document.body.removeChild(pdfContainer);
                setIsExporting(false);
            }
        }, 500);
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