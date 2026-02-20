
import React, { useState } from 'react';
import {
    Palette, Type, Layers, Box,
    CheckCircle2, XCircle, AlertTriangle, Info,
    Search, ChevronDown, MousePointer2, Layout,
    ArrowLeft, Sun, Moon, Settings, FileSpreadsheet,
    GripVertical, List, Edit3, Plus
} from 'lucide-react';
import './DesignDocs.css';
import Switch from './Switch';
import ModeToggle from './ModeToggle';
import { ThemeMode } from '../types';

interface DesignDocsProps {
    onClose: () => void;
}

const DesignDocs: React.FC<DesignDocsProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'icons'>('tokens');
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
                        <p className="text-xs font-bold text-muted uppercase tracking-tighter">A Comprehensive Guide to Our Brand & Product UI</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-[10px] bg-primary text-white px-2 py-1 rounded font-black">v1.2.8</div>
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
                    <button
                        className={`docs-tab-btn ${activeTab === 'icons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('icons')}
                    >
                        <List className="w-4 h-4 inline-block mr-2" /> Project Icons
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
                                        <ColorSwatch name="Primary Gradient" variable="--primary-gradient" description="Dynamic gradient for primary actions" />
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
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest pl-1">High-Tech (Cyber) Tokens</h3>
                                    <div className="docs-grid">
                                        <ColorSwatch name="Neon Cyan" variable="--primary-color" description="Active in Cyber mode" />
                                        <ColorSwatch name="Deep Background" variable="--background" description="Active in Cyber mode" />
                                        <ColorSwatch name="Cyber Surface" variable="--surface" description="Glassmorphism surface" />
                                        <ColorSwatch name="Accent Border" variable="--border-strong" description="Neon accent color" />
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
                                <TypoScale label="Hero Title" sizeVar="--text-hero" text="Main Hero Header" />
                                <TypoScale label="Page Title" sizeVar="--text-lg" text="Page Level Heading" />
                                <TypoScale label="Section Title" sizeVar="--title-size" text="Section Level Heading" />
                                <TypoScale label="Body Normal" sizeVar="--text-base" text="This is standard body text for descriptions and labels." />
                                <TypoScale label="Body Small" sizeVar="--text-small" text="Secondary information and small metadata." />
                                <TypoScale label="Caption (Tiny)" sizeVar="--text-tiny" text="Smallest legal or caption text (Default: 12px)." />
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
                                        <button className="btn-base bg-primary-gradient text-white font-bold py-2.5 px-6 rounded-xl hover:brightness-110 shadow-lg shadow-blue-500/20">Action Primary</button>
                                        <button className="btn-base bg-primary-gradient text-white font-bold py-2.5 px-6 rounded-xl">Solid Primary</button>
                                        <button className="btn-base btn-surface px-6 py-2.5 font-bold">Surface Button</button>
                                        <button className="btn-base btn-ghost px-6 py-2.5 font-bold">Ghost Button</button>
                                        <button className="btn-base btn-ghost active px-6 py-2.5 font-bold">Active Ghost</button>
                                    </div>
                                </div>

                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Premium Controls</h3>
                                    <div className="preview-box flex-col gap-6 items-start">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                            <div className="p-4 bg-[var(--surface)] border border-[var(--border-base)] rounded-2xl flex flex-col gap-4">
                                                <span className="text-[10px] font-black uppercase text-muted">Premium Mode Toggle (High-End)</span>
                                                <div className="flex gap-4 items-center scale-110 origin-left">
                                                    <ModeToggle mode={ThemeMode.LIGHT} onChange={() => { }} />
                                                    <ModeToggle mode={ThemeMode.DARK} onChange={() => { }} />
                                                </div>
                                                <p className="text-[10px] text-muted italic mt-2">Enables enriched animations & some glass effects.</p>
                                            </div>
                                        </div>
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
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Navigation Tabs</h3>
                                    <div className="preview-box p-md rounded-xl cyber" style={{ backgroundColor: 'var(--background)' }}>
                                        <div className="flex gap-4">
                                            <button className="nav-tab-clean active">ACTIVE TAB</button>
                                            <button className="nav-tab-clean">INACTIVE TAB</button>
                                        </div>
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
                                        <div className="w-full space-y-design">
                                            <label className="text-[10px] font-black uppercase text-muted ml-1">Standard Input</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    placeholder="Type something..."
                                                    className="w-full p-md pl-10 bg-surface border-main rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
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
                                    <div className="preview-box flex-col gap-6 items-start">
                                        <div className="flex items-center gap-4">
                                            <Switch checked={true} onChange={() => { }} />
                                            <span className="text-xs font-bold text-main">Standardized ON (Primary Theme)</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Switch checked={false} onChange={() => { }} />
                                            <span className="text-xs font-bold text-muted">Standardized OFF</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'cards' && (
                            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                                <div className="docs-section">
                                    <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Content Container</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-design">
                                        <div className="p-design bg-surface border-main rounded-design shadow-base">
                                            <h4 className="text-lg font-black text-main mb-2">Standard Card</h4>
                                            <p className="text-sm text-secondary leading-relaxed">
                                                This is the standard content container used for widgets. It uses the global border radius and basic shadow.
                                            </p>
                                        </div>
                                        <div className="p-design bg-surface border-main rounded-design shadow-premium">
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

                {activeTab === 'icons' && (
                    <div className="animate-in fade-in duration-500 p-6 space-y-8">
                        <section className="docs-section">
                            <h2 className="docs-title"><Palette className="w-5 h-5" /> Project Icon Library</h2>
                            <p className="text-secondary text-sm mb-6 max-w-2xl">
                                We utilize <strong>Lucide React</strong> as our primary icon provider. All icons follow a consistent stroke weight (1.5px to 2px) and are sized dynamically using CSS variables.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {[
                                    { icon: Layout, label: "Dashboard", usage: "Widget Layout" },
                                    { icon: Edit3, label: "Edit Mode", usage: "Toggle editing" },
                                    { icon: Palette, label: "Design", usage: "Widget Toggle" },
                                    { icon: Plus, label: "Add", usage: "Widget/Page" },
                                    { icon: Settings, label: "Settings", usage: "Environment panel" },
                                    { icon: Sun, label: "Light Mode", usage: "Theme Toggle" },
                                    { icon: Moon, label: "Dark Mode", usage: "Theme Toggle" },
                                    { icon: XCircle, label: "Close/Delete", usage: "Inactive" },
                                    { icon: FileSpreadsheet, label: "Excel", usage: "Data source" },
                                    { icon: GripVertical, label: "Drag Handle", usage: "Widget Movement" },
                                    { icon: CheckCircle2, label: "Success", usage: "Status feedback" },
                                    { icon: AlertTriangle, label: "Warning", usage: "System Alert" }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-[var(--surface)] border border-[var(--border-base)] rounded-2xl flex flex-col items-center gap-3 hover:border-primary transition-colors group">
                                        <div className="p-3 bg-[var(--border-muted)] rounded-xl group-hover:scale-110 transition-transform">
                                            <item.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs font-black text-main uppercase tracking-tight">{item.label}</div>
                                            <div className="text-[9px] text-muted font-bold mt-0.5">{item.usage}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignDocs;
