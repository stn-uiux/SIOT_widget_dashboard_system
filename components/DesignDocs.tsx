
import React, { useState } from 'react';
import {
    Palette, Type, Layers, Box,
    CheckCircle2, XCircle, AlertTriangle, Info,
    Search, ChevronDown, MousePointer2, Layout,
    ArrowLeft
} from 'lucide-react';
import './DesignDocs.css';

interface DesignDocsProps {
    onClose: () => void;
}

const DesignDocs: React.FC<DesignDocsProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'tokens' | 'components'>('tokens');
    const [activeSubTab, setActiveSubTab] = useState<'buttons' | 'forms' | 'cards'>('buttons');

    const ColorSwatch = ({ name, variable, description }: { name: string, variable: string, description?: string }) => (
        <div className="swatch-card">
            <div className="swatch-preview" style={{ backgroundColor: `var(${variable})` }} />
            <div className="swatch-info">
                <div className="swatch-name">{name}</div>
                <div className="swatch-value">{variable}</div>
                {description && <div className="text-[10px] text-muted mt-1 leading-tight">{description}</div>}
            </div>
        </div>
    );

    const TypoScale = ({ label, sizeVar, weightVar = '--title-weight', text = 'The quick brown fox jumps over the lazy dog' }: any) => (
        <div className="typo-row">
            <div className="typo-label">{label} ({sizeVar})</div>
            <div style={{ fontSize: `var(${sizeVar})`, fontWeight: `var(${weightVar})` }} className="text-main truncate">
                {text}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] overflow-y-auto custom-scrollbar flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border-base)] px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-[var(--border-muted)] rounded-full transition-colors text-muted">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-main">Design System Documentation</h1>
                        <p className="text-xs font-bold text-muted uppercase tracking-tighter">Unified Design Language & Token System</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-[10px] bg-primary text-white px-2 py-1 rounded font-black">v1.1.0</div>
                </div>
            </header>

            <div className="docs-container flex-1">
                {/* Main Tabs */}
                <nav className="docs-tabs">
                    <button
                        className={`docs-tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tokens')}
                    >
                        <Palette className="w-4 h-4 inline-block mr-2" /> Design Tokens
                    </button>
                    <button
                        className={`docs-tab-btn ${activeTab === 'components' ? 'active' : ''}`}
                        onClick={() => setActiveTab('components')}
                    >
                        <Layers className="w-4 h-4 inline-block mr-2" /> UI Components
                    </button>
                </nav>

                {activeTab === 'tokens' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Color Palette */}
                        <section className="docs-section">
                            <h2 className="docs-title"><Palette className="w-5 h-5" /> Color Palette</h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest pl-1">Brand Colors</h3>
                                    <div className="docs-grid">
                                        <ColorSwatch name="Primary" variable="--primary-color" description="Main brand color for actions" />
                                        <ColorSwatch name="Secondary" variable="--secondary-color" description="Alternative brand color" />
                                        <ColorSwatch name="Primary Subtle" variable="--primary-subtle" description="Transparent primary background" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest pl-1">Semantic (Auto-Themed)</h3>
                                    <div className="docs-grid">
                                        <ColorSwatch name="Background" variable="--background" />
                                        <ColorSwatch name="Surface" variable="--surface" />
                                        <ColorSwatch name="Text Main" variable="--text-main" />
                                        <ColorSwatch name="Text Secondary" variable="--text-secondary" />
                                        <ColorSwatch name="Text Muted" variable="--text-muted" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest pl-1">Status Colors</h3>
                                    <div className="docs-grid">
                                        <ColorSwatch name="Success" variable="--success" />
                                        <ColorSwatch name="Error" variable="--error" />
                                        <ColorSwatch name="Warning" variable="--warning" />
                                        <ColorSwatch name="Info" variable="--info" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest pl-1">Borders</h3>
                                    <div className="docs-grid">
                                        <ColorSwatch name="Border Base" variable="--border-base" />
                                        <ColorSwatch name="Border Muted" variable="--border-muted" />
                                        <ColorSwatch name="Border Strong" variable="--border-strong" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Typography */}
                        <section className="docs-section">
                            <h2 className="docs-title"><Type className="w-5 h-5" /> Typography</h2>
                            <div className="bg-[var(--surface)] border border-[var(--border-base)] rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-4 bg-[var(--border-muted)] border-b border-[var(--border-base)]">
                                    <span className="text-[10px] font-black uppercase text-muted">Font Scale</span>
                                </div>
                                <TypoScale label="Extra Large" sizeVar="--radius-xl" text="Main Heading XL" />
                                <TypoScale label="Title Large" sizeVar="--title-size" text="Section Heading L" />
                                <TypoScale label="Content Base" sizeVar="--spacing" text="This is standard body text for descriptions and labels." />
                                <TypoScale label="Content Small" sizeVar="--content-size" text="Secondary information and small metadata." />
                                <TypoScale label="Caption" sizeVar="--radius-sm" text="Smallest legal or caption text." />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 bg-[var(--surface)] border border-[var(--border-base)] rounded-2xl">
                                    <h3 className="text-[10px] font-black uppercase text-muted mb-4">Font Weights</h3>
                                    <div className="space-y-2">
                                        <p className="font-normal text-main">Normal (400)</p>
                                        <p className="font-medium text-main">Medium (500)</p>
                                        <p className="font-semibold text-main">Semibold (600)</p>
                                        <p className="font-bold text-main">Bold (700)</p>
                                        <p className="font-black text-main uppercase tracking-tighter">Black (900)</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-[var(--surface)] border border-[var(--border-base)] rounded-2xl">
                                    <h3 className="text-[10px] font-black uppercase text-muted mb-4">Font Families</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[9px] text-muted uppercase font-bold">Sans (Default)</span>
                                            <p className="font-sans text-lg text-main">Inter Display</p>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-muted uppercase font-bold">Monospace</span>
                                            <p className="font-mono text-lg text-main">JetBrains Mono</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Spacing & Shapes */}
                        <section className="docs-section">
                            <h2 className="docs-title"><Box className="w-5 h-5" /> Spacing & Shapes</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase text-muted mb-4">Spacing Scale</h3>
                                    <div className="space-y-3">
                                        {['xs', 'sm', 'md', 'lg', 'xl'].map(s => (
                                            <div key={s} className="flex items-center gap-4">
                                                <div className="w-16 text-[10px] font-bold text-muted uppercase">{s}</div>
                                                <div className="h-4 bg-primary rounded" style={{ width: `var(--spacing-${s})` }} title={s} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase text-muted mb-4">Border Radius</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['sm', 'md', 'lg', 'xl'].map(r => (
                                            <div key={r} className={`p-4 border border-[var(--border-base)] bg-[var(--surface)] text-center text-[10px] font-bold text-muted uppercase`} style={{ borderRadius: `var(--radius-${r})` }}>
                                                Radius {r}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'components' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Component Sub Tabs */}
                        <div className="docs-sub-tabs">
                            <button
                                className={`docs-sub-tab-btn ${activeSubTab === 'buttons' ? 'active' : ''}`}
                                onClick={() => setActiveSubTab('buttons')}
                            >
                                Buttons
                            </button>
                            <button
                                className={`docs-sub-tab-btn ${activeSubTab === 'forms' ? 'active' : ''}`}
                                onClick={() => setActiveSubTab('forms')}
                            >
                                Forms & Inputs
                            </button>
                            <button
                                className={`docs-sub-tab-btn ${activeSubTab === 'cards' ? 'active' : ''}`}
                                onClick={() => setActiveSubTab('cards')}
                            >
                                Layout & Cards
                            </button>
                        </div>

                        {activeSubTab === 'buttons' && (
                            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Main Buttons</h3>
                                    <div className="preview-box">
                                        <button className="btn-base bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:brightness-110 shadow-lg shadow-blue-500/20">Primary Button</button>
                                        <button className="btn-base btn-surface px-6 py-2.5 font-bold">Surface Button</button>
                                        <button className="btn-base btn-ghost px-6 py-2.5 font-bold">Ghost Button</button>
                                        <button className="btn-base btn-ghost active px-6 py-2.5 font-bold">Active Ghost</button>
                                    </div>
                                </div>

                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Status Buttons</h3>
                                    <div className="preview-box">
                                        <button className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all bg-[var(--success)] shadow-lg shadow-emerald-500/20">Success</button>
                                        <button className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all bg-[var(--error)] shadow-lg shadow-red-500/20">Error Action</button>
                                        <button className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all bg-[var(--warning)] shadow-lg shadow-amber-500/20">Warning</button>
                                        <button className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all bg-[var(--info)] shadow-lg shadow-blue-500/20">Info State</button>
                                    </div>
                                </div>

                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Iconic & Small</h3>
                                    <div className="preview-box">
                                        <button className="p-2.5 bg-[var(--border-muted)] border border-[var(--border-base)] rounded-xl text-primary hover:bg-[var(--border-base)] transition-colors">
                                            <MousePointer2 className="w-5 h-5" />
                                        </button>
                                        <button className="btn-base btn-surface p-2 rounded-lg">
                                            <Layout className="w-4 h-4" />
                                        </button>
                                        <button className="text-[10px] font-black uppercase text-primary border-b-2 border-primary pb-0.5 hover:text-blue-600">Text Button</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'forms' && (
                            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Text Inputs</h3>
                                    <div className="preview-box flex-col items-start max-w-md">
                                        <div className="w-full space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted ml-1">Standard Input</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    placeholder="Type something..."
                                                    className="w-full p-2.5 pl-10 bg-[var(--surface)] border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                                                />
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>

                                        <div className="w-full space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted ml-1">Value Field (Mono)</label>
                                            <input
                                                type="number"
                                                defaultValue="123.45"
                                                className="w-40 p-2.5 bg-[var(--surface)] border border-[var(--border-base)] rounded-xl text-sm font-mono font-bold text-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Selects & Dropdowns</h3>
                                    <div className="preview-box flex-col items-start max-w-md">
                                        <div className="w-full space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted ml-1">Custom Select</label>
                                            <div className="w-full p-2.5 bg-[var(--surface)] border border-[var(--border-base)] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[var(--border-muted)] transition-colors">
                                                <span className="text-sm font-bold text-main">Option One Selected</span>
                                                <ChevronDown className="w-4 h-4 text-muted" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Toggles & Switches</h3>
                                    <div className="preview-box flex-col gap-4 items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked readOnly />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            </div>
                                            <span className="text-xs font-bold text-main">Active State</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            </div>
                                            <span className="text-xs font-bold text-muted">Inactive State</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'cards' && (
                            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Content Container</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 bg-[var(--surface)] border border-[var(--border-base)] rounded-[var(--border-radius)] shadow-base">
                                            <h4 className="text-lg font-black text-main mb-2">Standard Card</h4>
                                            <p className="text-sm text-secondary leading-relaxed">
                                                This is the standard content container used for widgets. It uses the global border radius and basic shadow.
                                            </p>
                                        </div>
                                        <div className="p-8 bg-[var(--surface)] border border-[var(--border-base)] rounded-[var(--border-radius)] shadow-premium">
                                            <h4 className="text-lg font-black text-main mb-2">Premium Card</h4>
                                            <p className="text-sm text-secondary leading-relaxed">
                                                This container uses a deeper premium shadow for elevated components like modals or highlighted widgets.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignDocs;
