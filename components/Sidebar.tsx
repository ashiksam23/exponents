import React from 'react';

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
    return (
        <aside className="sidebar glassmorphism">
            <div>
                <div className="logo">
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 24L12 12L0 24L12 36L24 24Z" stroke="#E24A37" strokeWidth="4" strokeLinejoin="miter"/>
                        <path d="M24 24L36 12L48 24L36 36L24 24Z" stroke="#E24A37" strokeWidth="4" strokeLinejoin="miter"/>
                    </svg>
                    <span className="logo-text">ExponentOS</span>
                </div>
                <nav className="nav">
                    <ul>
                        <li className="active">
                            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 24L12 12L0 24L12 36L24 24Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter"/>
                                <path d="M24 24L36 12L48 24L36 36L24 24Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter"/>
                            </svg>
                            <span className="nav-text">Lead Magnet Generator</span>
                        </li>
                    </ul>
                </nav>
            </div>

            <div className="sidebar-footer">
                <button onClick={onToggleCollapse} className="collapse-btn" aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                     </svg>
                     <span className="collapse-btn__text">{isCollapsed ? 'Expand' : 'Collapse'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;