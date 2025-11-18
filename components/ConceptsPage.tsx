import React from 'react';
import type { Concept } from '../types';

interface ConceptsPageProps {
    concepts: Concept[];
    onSelectConcept: (concept: Concept) => void;
    onStartOver: () => void;
}

const ConceptsPage: React.FC<ConceptsPageProps> = ({ concepts, onSelectConcept, onStartOver }) => {
    return (
        <div className="page-container">
            <div className="page-header space-between">
                <div>
                    <span className="step-indicator">Step 2 of 3</span>
                    <h2>Select Your 10x Concept</h2>
                    <p>The AI has generated data-backed concepts. Select one to build the complete asset package.</p>
                </div>
                <button onClick={onStartOver} className="button button-secondary">&larr; Start Over</button>
            </div>
            <div className="concepts-grid">
                {concepts.map((concept, index) => (
                    <div
                        key={index}
                        onClick={() => onSelectConcept(concept)}
                        className="concept-card"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && onSelectConcept(concept)}
                    >
                        <h3>{concept.title}</h3>
                        <p>{concept.hook}</p>
                        <div 
                            className="rationale"
                            dangerouslySetInnerHTML={{ __html: `<p><strong>Data-Backed Rationale:</strong> ${concept.rationale}</p>` }} 
                        />

                        <div className="leads-data">
                             <div className="grid">
                                <div className="lead-metric">
                                    <div className="metric-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M17 17l-5-5-5 5" />
                                            <path d="M17 11l-5-5-5 5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="metric-label">Organic Reach</p>
                                        <p className="metric-value">
                                            ~{(concept.organicLeads || 0).toLocaleString()}
                                        </p>
                                        <p className="metric-sublabel">Potential monthly leads</p>
                                    </div>
                                </div>
                                <div className="lead-metric">
                                     <div className="metric-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <path d="M15 3h6v6"></path>
                                            <path d="M10 14L21 3"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="metric-label">With Paid Ads</p>
                                        <p className="metric-value">
                                            ~{(concept.paidLeads || 0).toLocaleString()}
                                        </p>
                                        <p className="metric-sublabel">Potential monthly leads</p>
                                    </div>
                                </div>
                            </div>
                            <p className="leads-rationale">
                                {concept.leadsRationale}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConceptsPage;
