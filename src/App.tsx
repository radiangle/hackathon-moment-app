import { useState } from 'react';
import {
    PenLine,
    Send,
    Lock,
    CloudRain,
    Sparkles,
    Brain,
    Database,
    CheckCircle2,
    Clock,
    ChevronLeft,
    BarChart3,
    Calendar as CalendarIcon,
    ChevronRight,
    MapPin,
    Camera,
    Zap,
    ShieldCheck,
    Edit2,
    Share2,
    ChevronDown,
    Activity
} from 'lucide-react';

// --- Types ---
type Emotion = 'happy' | 'calm' | 'stressed' | 'tired' | 'excited' | 'neutral';

type Moment = {
    id: string;
    text: string;
    timestamp: string;
    emotion?: Emotion;
    tags?: string[];
    location?: string;
    weather?: string;
    hasPhoto?: boolean;
};

type RetroAction = {
    id: string;
    text: string;
    completed: boolean;
};

type Highlight = {
    text: string;
    sourceMomentId?: string; // Link back to source for "Traceability"
};

type DailySummary = {
    title: string;
    story: string;
    mood: number;
    weatherContext: string;
    highlights: Highlight[];
    actions: RetroAction[];
    tags: string[];
};

type DayData = {
    moments: Moment[];
    summary: DailySummary | null;
};

type AppData = Record<string, DayData>;

// --- Mock Data Helpers ---
const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

const TODAY = getPastDate(0);
const YESTERDAY = getPastDate(1);
const TWO_DAYS_AGO = getPastDate(2);
const FIVE_DAYS_AGO = getPastDate(5);
const TWELVE_DAYS_AGO = getPastDate(12);

// Emotion Helpers
const getEmotionIcon = (e?: Emotion) => {
    switch (e) {
        case 'happy': return '😍';
        case 'calm': return '😌';
        case 'stressed': return '😣';
        case 'tired': return '😴';
        case 'excited': return '🤩';
        default: return '😐';
    }
};

const getEmotionLabel = (e?: Emotion) => {
    if (!e) return 'Neutral';
    return e.charAt(0).toUpperCase() + e.slice(1);
};

const getEmotionColor = (e?: Emotion) => {
    switch (e) {
        case 'happy': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'calm': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'stressed': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'tired': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'excited': return 'bg-rose-100 text-rose-700 border-rose-200';
        default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
};

// Mock "AI" Analysis for new moments
const analyzeMoment = (text: string): { emotion: Emotion, tags: string[] } => {
    const lower = text.toLowerCase();
    if (lower.includes('stress') || lower.includes('deadline')) return { emotion: 'stressed', tags: ['Work', 'Pressure'] };
    if (lower.includes('happy') || lower.includes('great')) return { emotion: 'happy', tags: ['Joy', 'Wins'] };
    if (lower.includes('tired') || lower.includes('sleep')) return { emotion: 'tired', tags: ['Health', 'Sleep'] };
    if (lower.includes('walk') || lower.includes('nature')) return { emotion: 'calm', tags: ['Nature', 'Health'] };
    if (lower.includes('code') || lower.includes('hackathon')) return { emotion: 'excited', tags: ['Hackathon', 'Dev'] };
    return { emotion: 'neutral', tags: ['Daily'] };
};

const INITIAL_DATA: AppData = {
    [YESTERDAY]: {
        moments: [{
            id: '1',
            text: "Long walk by the pier, felt calm.",
            timestamp: "18:30",
            emotion: 'calm',
            tags: ['Nature', 'Health'],
            location: "San Francisco Pier",
            weather: "18°C Sunset"
        }],
        summary: {
            title: "A Breath of Fresh Air",
            story: "After a chaotic week, you finally found some stillness. The walk by the pier wasn't just exercise; it was a necessary reset. The visual of the sunset seemed to anchor you.",
            mood: 8,
            weatherContext: "Clear skies, 18°C",
            highlights: [{ text: "Sunset walk", sourceMomentId: '1' }, { text: "Disconnected from work", sourceMomentId: '1' }],
            actions: [{ id: 'a1', text: "Keep the phone off for 1 hour tonight", completed: true }],
            tags: ["Health", "Nature"]
        }
    },
    [TWO_DAYS_AGO]: {
        moments: [{
            id: '2',
            text: "Deadline looming. Stressed.",
            timestamp: "09:15",
            emotion: 'stressed',
            tags: ['Work', 'Deadline'],
            location: "Home Office",
            weather: "Rainy 14°C"
        }],
        summary: {
            title: "The Pressure Cooker",
            story: "High anxiety defined the morning. The deadline represents a significant hurdle, but your ability to articulate the stress is the first step in managing it.",
            mood: 3,
            weatherContext: "Overcast, 14°C",
            highlights: [{ text: "Acknowledged stress", sourceMomentId: '2' }],
            actions: [{ id: 'a2', text: "Break project into 15min chunks", completed: false }],
            tags: ["Work", "Anxiety"]
        }
    },
    [FIVE_DAYS_AGO]: {
        moments: [{ id: '3', text: "Great lunch with team.", timestamp: "13:00", emotion: 'happy', tags: ['Social'] }],
        summary: { title: "Social Connection", story: "...", mood: 9, weatherContext: "Sunny", highlights: [], actions: [], tags: [] }
    },
    [TWELVE_DAYS_AGO]: {
        moments: [{ id: '4', text: "Tired.", timestamp: "08:00", emotion: 'tired', tags: ['Sleep'] }],
        summary: { title: "Rest Required", story: "...", mood: 4, weatherContext: "Rainy", highlights: [], actions: [], tags: [] }
    }
};

// --- Helpers ---
const getMoodColor = (mood: number | undefined) => {
    if (mood === undefined) return 'bg-stone-100 border-stone-200 text-stone-400';
    if (mood >= 8) return 'bg-emerald-400 border-emerald-500 text-white shadow-lg shadow-emerald-200';
    if (mood >= 5) return 'bg-amber-300 border-amber-400 text-amber-900';
    return 'bg-rose-400 border-rose-500 text-white shadow-lg shadow-rose-200';
};

const generateMockSummary = (moments: Moment[]): DailySummary => {
    return {
        title: "Finding The Flow",
        story: "Today was a mix of focused productivity and necessary reflection. Momo noticed you started with high energy but felt the midday slump. Capturing these small wins—like the coffee break—anchors your day in positivity despite the workload.",
        mood: 7,
        weatherContext: "Partly Cloudy, 22°C",
        highlights: moments.map(m => ({ text: `Reflected on: ${m.text.substring(0, 15)}...`, sourceMomentId: m.id })),
        actions: [
            { id: '1', text: "Take a 10 min walk before 9am tomorrow (Sunny forecast)", completed: false },
            { id: '2', text: "Write down 3 priorities for tomorrow tonight", completed: false }
        ],
        tags: ["Productivity", "Mindfulness"]
    };
};

// --- Floating Momo Component ---
const FloatingMomo = ({ state }: { state: 'idle' | 'thinking' | 'happy' }) => {
    return (
        <div className="fixed bottom-24 right-6 z-40 animate-float hidden md:block group">
            <div className="relative">
                <div className="absolute -top-8 -left-16 bg-white px-3 py-1.5 rounded-t-xl rounded-bl-xl shadow-md border border-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100 origin-bottom-right">
                    <p className="text-xs font-medium text-indigo-800 whitespace-nowrap">I'm listening...</p>
                </div>
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-300 flex items-center justify-center transform rotate-3 transition-transform hover:rotate-0 hover:scale-110 cursor-pointer">
                    {state === 'thinking' ? (
                        <Brain size={24} className="text-white animate-pulse" />
                    ) : state === 'happy' ? (
                        <Sparkles size={24} className="text-yellow-300 animate-spin-slow" />
                    ) : (
                        <span className="text-2xl">🤖</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Components ---

export default function App() {
    const [view, setView] = useState<'calendar' | 'input' | 'processing' | 'dashboard'>('input');
    const [selectedDate, setSelectedDate] = useState<string>(TODAY);
    const [data, setData] = useState<AppData>(INITIAL_DATA);
    const [inputText, setInputText] = useState('');
    const [processingStep, setProcessingStep] = useState(0);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [expandedHighlight, setExpandedHighlight] = useState<number | null>(null);

    // Calendar Logic
    const todayObj = new Date();
    const currentYear = todayObj.getFullYear();
    const currentMonth = todayObj.getMonth();
    const monthName = todayObj.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const processingSteps = [
        { text: "Encrypting & Vaulting to Skyflow...", icon: Lock },
        { text: "Analyzing context (Postman Weather)...", icon: CloudRain },
        { text: "Recalling similar days (RedisVL)...", icon: Database },
        { text: "Momo is writing your story (Claude)...", icon: Brain },
        { text: "Updating Sanity Life Dashboard...", icon: BarChart3 },
    ];

    // -- Actions --

    const handleDateClick = (date: string) => {
        setSelectedDate(date);
        const dayData = data[date];
        if (dayData?.summary) {
            setView('dashboard');
        } else {
            setView('input');
        }
    };

    const handleBack = () => {
        if (view === 'calendar') {
            setSelectedDate(TODAY);
            setView('input');
        } else if (view === 'dashboard') {
            // If we came from calendar, go back there. If we generated today, go home.
            setView('calendar');
        } else {
            setView('input');
        }
    };

    const addMoment = () => {
        if (!inputText.trim()) return;

        // Simulate AI analysis
        const analysis = analyzeMoment(inputText);

        const newMoment: Moment = {
            id: Date.now().toString(),
            text: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            emotion: analysis.emotion,
            tags: analysis.tags,
            location: "San Francisco, CA",
            weather: "62°F Sunny"
        };

        setData(prev => ({
            ...prev,
            [selectedDate]: {
                moments: [...(prev[selectedDate]?.moments || []), newMoment],
                summary: prev[selectedDate]?.summary || null
            }
        }));
        setInputText('');

        // Trigger Skyflow Toast
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);
    };

    const startProcessing = () => {
        setView('processing');
        let currentStep = 0;
        const interval = setInterval(() => {
            setProcessingStep(currentStep);
            currentStep++;
            if (currentStep > processingSteps.length) {
                clearInterval(interval);
                const dayMoments = data[selectedDate]?.moments || [];
                const newSummary = generateMockSummary(dayMoments);

                setData(prev => ({
                    ...prev,
                    [selectedDate]: {
                        moments: dayMoments,
                        summary: newSummary
                    }
                }));
                setTimeout(() => setView('dashboard'), 500);
            }
        }, 1000);
    };

    const currentMoments = data[selectedDate]?.moments || [];
    const currentSummary = data[selectedDate]?.summary;

    // Header Helpers
    const getHeaderTitle = () => {
        if (view === 'calendar') return 'Your Life';
        if (view === 'processing') return 'Momo Thinking...';
        if (view === 'dashboard') return 'Daily Story';
        return 'Moments';
    };

    const getHeaderSubtitle = () => {
        if (view === 'calendar') return 'Overview';
        if (view === 'input') return selectedDate === TODAY ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-stone-100 text-stone-800 font-sans flex justify-center p-4 md:p-8">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-[40px] overflow-hidden min-h-[800px] flex flex-col relative border-8 border-stone-900">

                {/* --- HEADER --- */}
                <div className={`h-28 bg-white flex flex-col justify-end px-6 pb-4 sticky top-0 z-20 border-b border-stone-50 backdrop-blur-xl bg-white/90 transition-shadow duration-300 ${view === 'dashboard' ? 'shadow-lg z-30' : ''}`}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            {view === 'input' ? (
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg transform rotate-3">
                                    M
                                </div>
                            ) : (
                                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors">
                                    <ChevronLeft size={24} className="text-stone-600" />
                                </button>
                            )}

                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">
                                    {getHeaderSubtitle()}
                                </span>
                                <span className="font-bold text-xl leading-none text-stone-800 tracking-tight">
                                    {getHeaderTitle()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {view === 'dashboard' && (
                                <div className="flex gap-1">
                                    <button className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-stone-50 rounded-full transition-colors"><Edit2 size={16} /></button>
                                    <button className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-stone-50 rounded-full transition-colors"><Share2 size={16} /></button>
                                </div>
                            )}

                            {view === 'input' && (
                                <button
                                    onClick={() => setView('calendar')}
                                    className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-indigo-600 transition-all active:scale-95"
                                >
                                    <CalendarIcon size={20} />
                                </button>
                            )}
                            {view !== 'dashboard' && (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center">
                                    <span className="text-xs font-bold text-indigo-400">JD</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {view === 'input' && (
                        <p className="text-xs text-stone-400 mt-2 font-medium animate-fade-in">
                            Drop moments throughout your day. I'll take care of the story.
                        </p>
                    )}
                </div>

                {/* --- VIEW: CALENDAR --- */}
                {view === 'calendar' && (
                    <div className="flex-1 p-6 bg-white overflow-y-auto animate-fade-in">

                        {/* Weekly Insight Card */}
                        <div className="mb-8 bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3 opacity-80">
                                    <Sparkles size={14} className="text-yellow-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Weekly Insight</span>
                                </div>
                                <p className="text-sm leading-relaxed text-indigo-100 font-medium mb-3">
                                    "Your week was highly social and productive, but sleep quality dipped mid-week. You report feeling 'Calm' most often when near the ocean."
                                </p>
                                {/* Stats Row */}
                                <div className="flex items-center gap-4 text-[10px] font-medium text-indigo-300 border-t border-indigo-700 pt-2 mt-2">
                                    <span className="flex items-center gap-1"><Activity size={10} /> Most active: Fri</span>
                                    <span>•</span>
                                    <span>Quietest: Tue</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Section */}
                        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">Daily Mood Calendar</h3>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-stone-800">{monthName} {currentYear}</h2>
                            <div className="flex gap-1 bg-stone-100 p-1 rounded-lg">
                                <button className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft size={16} /></button>
                                <button className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-8">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-stone-400 py-2">{d}</div>
                            ))}

                            {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}

                            {[...Array(daysInMonth)].map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                const isToday = dateStr === TODAY;
                                const dayData = data[dateStr];
                                const hasSummary = !!dayData?.summary;
                                const moodClass = getMoodColor(dayData?.summary?.mood);

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(dateStr)}
                                        className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all hover:scale-110 hover:z-10 ${moodClass} ${isToday ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}
                                    >
                                        <span className={`text-xs font-bold ${hasSummary ? 'text-inherit' : 'text-stone-400'}`}>{day}</span>
                                        {hasSummary && (
                                            <div className="mt-1">
                                                <div className={`w-1 h-1 rounded-full bg-white/60`}></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Theme Bubbles */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Detected Themes</h3>
                                <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-1 rounded-full">RedisVL Cluster</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Simulating Bubble Chart with different sizes */}
                                <span className="px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-bold text-indigo-700 shadow-sm">#Hackathon</span>
                                <span className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-medium text-emerald-700">#Nature</span>
                                <span className="px-5 py-4 bg-amber-50 border border-amber-100 rounded-full text-base font-bold text-amber-700 shadow-md">#Stress</span>
                                <span className="px-3 py-2 bg-rose-50 border border-rose-100 rounded-full text-xs font-medium text-rose-700">#Sleep</span>
                                <span className="px-4 py-2 bg-stone-100 border border-stone-200 rounded-full text-xs font-medium text-stone-600">#Coding</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW: INPUT (List) --- */}
                {view === 'input' && (
                    <div className="flex-1 flex flex-col bg-stone-50 animate-fade-in relative">

                        {/* Floating Momo */}
                        <FloatingMomo state={inputText.length > 0 ? 'thinking' : 'idle'} />

                        {/* Skyflow Toast */}
                        <div className={`absolute top-4 left-0 right-0 flex justify-center pointer-events-none transition-all duration-500 z-30 ${showSavedToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                            <div className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium">
                                <ShieldCheck size={14} /> Saved securely with Skyflow Vault 🔒
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">

                            {/* Today Insight Card */}
                            <div className="mx-4 mt-4 bg-gradient-to-br from-white to-indigo-50/50 rounded-3xl p-5 shadow-sm border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Today's Pulse</span>
                                    <div className="flex items-center gap-1 text-[10px] text-stone-500 bg-white/50 px-2 py-1 rounded-full border border-stone-100">
                                        <CloudRain size={10} /> San Francisco • 62°F
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <span className="text-[10px] text-stone-400 block mb-1">Mood so far</span>
                                        <div className="flex items-center gap-2 text-lg font-bold text-stone-700">
                                            🙂 Calm
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-stone-400 block mb-1">Energy</span>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Zap size={14} fill="currentColor" />
                                            <span className="text-sm font-bold">Medium</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/60 rounded-xl p-3 flex gap-3 items-start border border-indigo-100">
                                    <div className="mt-0.5 bg-white p-1 rounded-full shadow-sm">
                                        <Brain size={12} className="text-indigo-500" />
                                    </div>
                                    <p className="text-xs text-indigo-800 leading-relaxed">
                                        <span className="font-bold">Check-in:</span> It looks like work stress is creeping up. Consider a short walk before your next meeting.
                                    </p>
                                </div>
                            </div>

                            {/* Moments Timeline */}
                            <div className="px-4 pt-6 relative">
                                {/* Timeline Line */}
                                {currentMoments.length > 0 && (
                                    <div className="absolute left-[27px] top-6 bottom-0 w-0.5 bg-stone-200"></div>
                                )}

                                {currentMoments.length === 0 ? (
                                    <div className="text-center mt-10 opacity-40">
                                        <PenLine size={48} className="mx-auto mb-4 text-stone-400" />
                                        <p className="text-stone-500 font-medium">No moments yet.</p>
                                        <p className="text-xs text-stone-400 mt-1">Start capturing your day.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {currentMoments.map((m, idx) => (
                                            <div key={idx} className="relative pl-8 animate-fade-in-up group">
                                                {/* Timeline Dot */}
                                                <div className="absolute left-[7px] top-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-100 z-10"></div>

                                                {/* Card */}
                                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                                                    <p className="text-stone-700 leading-relaxed mb-3 font-medium">{m.text}</p>

                                                    {/* Metadata Chips */}
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        {/* Auto-Emotion */}
                                                        {m.emotion && (
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getEmotionColor(m.emotion)}`}>
                                                                {getEmotionIcon(m.emotion)} {getEmotionLabel(m.emotion)}
                                                            </span>
                                                        )}
                                                        {/* Auto-Tags */}
                                                        {m.tags?.map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Footer Info */}
                                                    <div className="flex items-center justify-between border-t border-stone-50 pt-2">
                                                        <div className="flex items-center gap-3 text-[10px] text-stone-400 font-medium">
                                                            <span className="flex items-center gap-1"><Clock size={10} /> {m.timestamp}</span>
                                                            {m.location && <span className="flex items-center gap-1"><MapPin size={10} /> {m.location}</span>}
                                                        </div>
                                                        <span className="text-[10px] text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                            <Lock size={8} /> Skyflow
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-stone-100 sticky bottom-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] rounded-t-[30px] z-30">
                            {currentMoments.length > 0 && (
                                <button
                                    onClick={startProcessing}
                                    className="w-full mb-4 bg-stone-900 text-white py-3.5 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-stone-800 hover:scale-[1.02] active:scale-95"
                                >
                                    <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                                    <span>Create My Day's Story</span>
                                </button>
                            )}

                            <div className="relative flex items-end gap-2">
                                <div className="absolute left-3 bottom-3 text-stone-400 hover:text-stone-600 cursor-pointer transition-colors">
                                    <Camera size={20} />
                                </div>
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addMoment()}
                                    placeholder="What's happening right now?"
                                    className="w-full bg-stone-100 border-0 rounded-2xl pl-10 pr-12 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-stone-400 font-medium text-sm"
                                />
                                <button
                                    onClick={addMoment}
                                    className="absolute right-2 bottom-2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW: PROCESSING --- */}
                {view === 'processing' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden">
                        {/* Ambient Background */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-white to-indigo-50"></div>
                        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                        <div className="w-full max-w-xs relative z-10">
                            <div className="flex justify-center mb-12 relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center relative z-10 animate-bounce">
                                    <Brain size={32} className="text-indigo-600" />
                                </div>
                            </div>

                            <div className="text-center mb-10">
                                <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Momo is writing...</h3>
                                <p className="text-sm text-stone-500">Weaving your moments into a narrative.</p>
                            </div>

                            <div className="space-y-6 relative z-10 pl-4">
                                {processingSteps.map((step, idx) => {
                                    const isDone = idx < processingStep;
                                    const isCurrent = idx === processingStep;
                                    return (
                                        <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isCurrent ? 'scale-105 opacity-100 translate-x-2' : isDone ? 'opacity-40' : 'opacity-20'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm ${isDone ? 'bg-green-500 border-green-500 text-white' : isCurrent ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-stone-200 text-stone-300'}`}>
                                                {isDone ? <CheckCircle2 size={12} /> : isCurrent ? <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" /> : <div className="w-2 h-2 bg-stone-200 rounded-full" />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <step.icon size={14} className={isCurrent ? 'text-indigo-600' : 'text-inherit'} />
                                                <span className={`text-sm font-medium ${isCurrent ? 'text-indigo-900' : 'text-inherit'}`}>{step.text}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW: DASHBOARD (Story) --- */}
                {view === 'dashboard' && currentSummary && (
                    <div className="flex-1 overflow-y-auto bg-stone-50 pb-8 animate-fade-in">
                        {/* Mood Header */}
                        <div className={`p-8 pb-12 rounded-b-[3rem] ${getMoodColor(currentSummary.mood).replace('border', '')} transition-colors duration-700 relative overflow-hidden`}>
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer"></div>

                            <div className="flex justify-between items-start mb-4 opacity-70 relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/10 px-2 py-1 rounded-md text-white/90">Sanity.io Content</span>
                                <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded backdrop-blur-sm text-white">{selectedDate}</span>
                            </div>

                            <div className="relative z-10">
                                <h1 className="text-3xl font-serif font-medium leading-tight mb-4 text-stone-900">
                                    {currentSummary.title}
                                </h1>
                                <div className="flex gap-2">
                                    {currentSummary.tags.map(t => (
                                        <span key={t} className="bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-stone-800">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 -mt-8 relative z-20">
                            {/* Story Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-stone-200/50 mb-6 border border-stone-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-lg">🤖</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-stone-900 mb-1">Momo's Reflection</h3>
                                        <p className="text-stone-600 leading-loose font-serif text-base">
                                            {currentSummary.story}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-xs text-stone-400 font-medium border-t border-stone-50 pt-4">
                                    <CloudRain size={12} /> {currentSummary.weatherContext}
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 ml-2">Highlights (Tap to expand)</h3>
                                {currentSummary.highlights.map((h, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setExpandedHighlight(expandedHighlight === i ? null : i)}
                                        className="bg-white px-4 py-3 mb-2 rounded-xl border border-stone-100 shadow-sm transition-all hover:scale-[1.01] cursor-pointer active:scale-95"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] flex-shrink-0" />
                                            <span className="text-stone-600 text-sm font-medium">{h.text}</span>
                                            <ChevronDown size={14} className={`ml-auto text-stone-300 transition-transform ${expandedHighlight === i ? 'rotate-180' : ''}`} />
                                        </div>
                                        {/* Expanded Context */}
                                        {expandedHighlight === i && (
                                            <div className="mt-3 pl-4 border-l-2 border-stone-100 text-xs text-stone-500 animate-fade-in">
                                                <p className="font-bold text-stone-400 mb-1 uppercase tracking-wider text-[10px]">Original Moment</p>
                                                <p className="italic">"Deadline looming. Stressed."</p>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600">
                                                    <Database size={8} /> <span>Verified from Skyflow</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Retro Actions */}
                            <div className="bg-stone-900 rounded-3xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 animate-pulse"></div>
                                <div className="flex items-center gap-2 mb-4 relative z-10">
                                    <Sparkles size={16} className="text-yellow-400" />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">Recommended Actions</h3>
                                </div>
                                <div className="space-y-3 relative z-10">
                                    {currentSummary.actions.map((action, i) => (
                                        <div key={i} className="flex items-start gap-3 group cursor-pointer">
                                            <button className={`mt-0.5 w-5 h-5 rounded border transition-all flex items-center justify-center ${action.completed ? 'bg-yellow-400 border-yellow-400 text-stone-900' : 'border-stone-600 hover:border-stone-400'}`}>
                                                {action.completed && <CheckCircle2 size={14} />}
                                            </button>
                                            <span className={`text-sm leading-snug transition-opacity ${action.completed ? 'opacity-50 line-through' : 'opacity-90 group-hover:text-yellow-100'}`}>
                                                {action.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

