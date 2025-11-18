import React, { useState } from 'react';
import { recommendICP } from '../services/geminiService';


interface BriefingPageProps {
    onGenerateIdeas: (icp: string, painPoint: string) => void;
}

const BriefingPage: React.FC<BriefingPageProps> = ({ onGenerateIdeas }) => {
    const [icp, setIcp] = useState('');
    const [painPoint, setPainPoint] = useState('');
    const [industry, setIndustry] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [isRecommending, setIsRecommending] = useState(false);
    const [hasRecommended, setHasRecommended] = useState(false);
    const [showInspiration, setShowInspiration] = useState(false);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!icp || !painPoint) {
            alert("Please fill out both the ICP and Pain Point fields.");
            return;
        }
        onGenerateIdeas(icp, painPoint);
    };

    const handleRecommend = async () => {
        if (!industry || !jobRole) {
            alert("Please provide an Industry and Job Role to get a suggestion.");
            return;
        }
        setIsRecommending(true);
        try {
            const result = await recommendICP(industry, jobRole);
            setIcp(result.icp);
            setPainPoint(result.painPoint);
            setHasRecommended(true);
        } catch (error) {
            console.error(error);
            alert("Failed to get a recommendation. The API might be busy. Please try again.");
        } finally {
            setIsRecommending(false);
        }
    };


    const fillExample = () => {
        setIndustry('B2B SaaS');
        setJobRole('Product Manager');
        setIcp('Mid-level managers at tech companies feeling stuck');
        setPainPoint('Not getting promoted despite working hard');
    };

    return (
        <div className="page-container">
            <div className="page-header centered">
                <span className="step-indicator">Step 1 of 3</span>
                <h2>Define Your Briefing</h2>
                <p>Tell us about your target audience and their biggest challenge. The more specific you are, the better your lead magnet will be.</p>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label htmlFor="icp" className="form-label">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                        </svg>
                        <span>Target Audience (ICP)</span>
                    </label>
                    <input
                        type="text"
                        id="icp"
                        value={icp}
                        onChange={(e) => setIcp(e.target.value)}
                        className="form-input"
                        placeholder="e.g., Mid-level managers at tech companies feeling stuck"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pain-point" className="form-label">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                           <path d="M13 1L6 12L11 13L10 23L18 10L13 9L13 1Z"></path>
                        </svg>
                        <span>Their #1 Pain Point</span>
                    </label>
                    <input
                        type="text"
                        id="pain-point"
                        value={painPoint}
                        onChange={(e) => setPainPoint(e.target.value)}
                        className="form-input"
                        placeholder="e.g., Not getting promoted despite working hard"
                    />
                </div>

                <div className="inspiration-toggle">
                    <p>
                        Need inspiration?{' '}
                        <button
                            type="button"
                            onClick={() => setShowInspiration(!showInspiration)}
                            className="link"
                            aria-expanded={showInspiration}
                        >
                            Get an AI suggestion
                        </button>
                        {' '}or{' '}
                        <button type="button" onClick={fillExample} className="link">
                            try an example
                        </button>.
                    </p>
                    <div className={`inspiration-panel-wrapper ${showInspiration ? 'visible' : ''}`}>
                         <div className="inspiration-panel glassmorphism">
                            <h3>Get an AI-powered suggestion</h3>
                            <p>Provide an industry and job role to get a specific ICP & pain point.</p>
                            <div className="grid">
                                <div>
                                    <label htmlFor="industry" className="form-label-sm">Industry</label>
                                    <input
                                        type="text"
                                        id="industry"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="form-input-sm"
                                        placeholder="e.g., B2B SaaS"
                                    />
                                </div>
                                <div>
                                     <label htmlFor="job-role" className="form-label-sm">Job Role</label>
                                    <input
                                        type="text"
                                        id="job-role"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        className="form-input-sm"
                                        placeholder="e.g., Product Manager"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleRecommend}
                                disabled={isRecommending}
                                className="button button-secondary"
                            >
                                {isRecommending ? (
                                     <div className="spinner-sm"></div>
                                ) : hasRecommended && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 12A10 10 0 10 12 2" />
                                        <path d="M2 4V2H4" />
                                        <path d="M22 12A10 10 0 0012 2" />
                                        <path d="M22 20V22H20" />
                                    </svg>
                                )}
                                {isRecommending ? 'Suggesting...' : hasRecommended ? 'Remix Suggestion' : 'Get Suggestion'}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="button"
                >
                    <span>Generate 10x Lead Magnet Ideas</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M5 12h14" />
                       <path d="M12 5l7 7-7 7" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default BriefingPage;
