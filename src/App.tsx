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
    Activity,
    User,
    Link,
    Settings,
    LogOut,
    Flame,
    Timer,
    Mountain,
    Footprints,
    Calendar,
} from 'lucide-react';
import { SKYFLOW_CONFIG } from './config/skyflow';

// --- Types ---
type Emotion = 'happy' | 'calm' | 'stressed' | 'tired' | 'excited' | 'neutral';

type StravaActivity = {
    type: 'Run' | 'Walk' | 'Hike' | 'Ride';
    distance: string;
    duration: string;
    calories: number;
};

type Moment = {
    id: string;
    text: string;
    timestamp: string;
    emotion?: Emotion;
    tags?: string[];
    location?: string;
    weather?: string;
    hasPhoto?: boolean;
    stravaActivity?: StravaActivity;
};

type RetroAction = {
    id: string;
    text: string;
    completed: boolean;
};

type Highlight = {
    text: string;
    sourceMomentId?: string;
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

const getMoodColor = (mood: number | undefined) => {
    if (mood === undefined) return 'bg-stone-100 border-stone-200 text-stone-400';
    if (mood >= 8) return 'bg-emerald-400 border-emerald-500 text-white shadow-lg shadow-emerald-200';
    if (mood >= 5) return 'bg-amber-300 border-amber-400 text-amber-900';
    return 'bg-rose-400 border-rose-500 text-white shadow-lg shadow-rose-200';
};

const getMoodEmoji = (mood: number | undefined) => {
    if (mood === undefined) return null;
    if (mood >= 9) return '🤩';
    if (mood >= 8) return '😁';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😫';
};

const getActivityIcon = (type: StravaActivity['type']) => {
    switch (type) {
        case 'Run': return Activity;
        case 'Hike': return Mountain;
        case 'Walk': return Footprints;
        case 'Ride': return Zap;
        default: return Activity;
    }
};

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
    [TODAY]: {
        moments: [
            {
                id: '0',
                text: "Morning run through Golden Gate Park.",
                timestamp: "07:30",
                emotion: 'excited',
                tags: ['Health', 'Fitness'],
                location: "San Francisco, CA",
                weather: "55°F Foggy",
                stravaActivity: {
                    type: 'Run',
                    distance: '5.2 km',
                    duration: '28m 15s',
                    calories: 320
                }
            },
            {
                id: '0b',
                text: "Grabbed coffee at the new place. The latte art was terrible but tasted amazing.",
                timestamp: "08:45",
                emotion: 'happy',
                tags: ['Coffee', 'Morning'],
                location: "Blue Bottle"
            },
            {
                id: '0c',
                text: "Deep work session. Finally cracked the authentication bug.",
                timestamp: "11:20",
                emotion: 'calm',
                tags: ['Work', 'Coding', 'Win']
            },
            {
                id: '0d',
                text: "Feeling a bit of a slump after lunch. Need to hydrate.",
                timestamp: "14:00",
                emotion: 'tired',
                tags: ['Health']
            }
        ],
        summary: null
    },
    [YESTERDAY]: {
        moments: [{
            id: '1',
            text: "Long walk by the pier, felt calm.",
            timestamp: "18:30",
            emotion: 'calm',
            tags: ['Nature', 'Health'],
            location: "San Francisco Pier",
            weather: "18°C Sunset",
            stravaActivity: {
                type: 'Walk',
                distance: '3.1 km',
                duration: '45m',
                calories: 140
            }
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

// --- Real Skyflow Service ---
class SkyflowService {
    private static instance: SkyflowService;

    private constructor() { }

    static getInstance(): SkyflowService {
        if (!SkyflowService.instance) {
            SkyflowService.instance = new SkyflowService();
        }
        return SkyflowService.instance;
    }

    async insertUserProfile(profileData: {
        date_of_birth: string;
        nationality: string;
        gender?: string;
        race?: string;
        ethnicity?: string;
        religion?: string;
        preferred_language?: string;
        marital_status?: string;
        name?: {
            prefix?: string;
            first_name?: string;
            middle_name?: string;
            last_name?: string;
            suffix?: string;
            use?: string;
        };
        addresses?: {
            full_name?: string;
            use?: string;
            line_1?: string;
            line_2?: string;
            city?: string;
            district?: string;
            state?: string;
            country?: string;
            zip_code?: string;
            latitude?: number;
            longitude?: number;
            address_type?: string;
        };
        phone_numbers?: {
            value?: string;
            type?: string;
        };
        emails?: {
            value?: string;
            type?: string;
        };
    }): Promise<{ skyflowId: string }> {
        try {
            const response = await fetch(
                `${SKYFLOW_CONFIG.vaultURL}/v1/vaults/${SKYFLOW_CONFIG.vaultID}/${SKYFLOW_CONFIG.tableName}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SKYFLOW_CONFIG.bearerToken}`,
                        'Content-Type': 'application/json',
                        'X-SKYFLOW-ACCOUNT-ID': SKYFLOW_CONFIG.accountId
                    },
                    mode: 'cors',
                    body: JSON.stringify({
                        records: [{
                            fields: profileData
                        }],
                        tokenization: true
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Skyflow API error (${response.status}): ${errorText}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error?.message) {
                        errorMessage = `Skyflow API error: ${errorJson.error.message}`;
                    }
                } catch {
                    // Use the text error if JSON parsing fails
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            if (!result.records || result.records.length === 0) {
                throw new Error('No records returned from Skyflow');
            }

            return {
                skyflowId: result.records[0].skyflow_id
            };
        } catch (error) {
            console.error('Skyflow insert error:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error(
                    'Network error: Unable to reach Skyflow API. This may be a CORS issue.'
                );
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to save profile: ${String(error)}`);
        }
    }

    async fetchUserProfile(): Promise<any[]> {
        try {
            const response = await fetch(
                `${SKYFLOW_CONFIG.vaultURL}/v1/vaults/${SKYFLOW_CONFIG.vaultID}/${SKYFLOW_CONFIG.tableName}?redaction=PLAIN_TEXT&limit=1`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${SKYFLOW_CONFIG.bearerToken}`,
                        'Content-Type': 'application/json',
                        'X-SKYFLOW-ACCOUNT-ID': SKYFLOW_CONFIG.accountId
                    },
                    mode: 'cors'
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Skyflow API error (${response.status}): ${errorText}`);
            }

            const result = await response.json();
            const records = result.records || [];
            return records.length > 0 ? [records[0]] : [];
        } catch (error) {
            console.error('Skyflow fetch error:', error);
            throw error;
        }
    }
}

// --- Components ---

export default function MomentsApp() {
    const [view, setView] = useState<'calendar' | 'input' | 'processing' | 'dashboard' | 'profile'>('input');
    const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');
    const [selectedDate, setSelectedDate] = useState<string>(TODAY);
    const [displayedDate, setDisplayedDate] = useState<Date>(new Date());
    const [data, setData] = useState<AppData>(INITIAL_DATA);
    const [inputText, setInputText] = useState('');
    const [processingStep, setProcessingStep] = useState(0);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [expandedHighlight, setExpandedHighlight] = useState<number | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [profileData, setProfileData] = useState<any[]>([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [, setError] = useState<string | null>(null);

    const skyflowService = SkyflowService.getInstance();

    // Calendar Calculation Logic
    const currentYear = displayedDate.getFullYear();
    const currentMonth = displayedDate.getMonth();
    const monthName = displayedDate.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const processingSteps = [
        { text: "Encrypting & Vaulting to Skyflow...", icon: Lock },
        { text: "Analyzing context (Postman Weather)...", icon: CloudRain },
        { text: "Recalling similar days (RedisVL)...", icon: Database },
        { text: "Momo is writing your story (Claude)...", icon: Brain },
        { text: "Updating Sanity Life Dashboard...", icon: BarChart3 },
    ];

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
        } else if (view === 'dashboard' || view === 'profile') {
            setView('calendar');
        } else {
            setView('input');
        }
    };

    const handlePrevPeriod = () => {
        const newDate = new Date(displayedDate);
        if (calendarMode === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 7);
        }
        setDisplayedDate(newDate);
    };

    const handleNextPeriod = () => {
        const newDate = new Date(displayedDate);
        if (calendarMode === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setDisplayedDate(newDate);
    };

    const loadProfile = async () => {
        setIsLoadingProfile(true);
        setError(null);
        try {
            const records = await skyflowService.fetchUserProfile();
            setProfileData(records);
            setView('profile');
        } catch (error) {
            console.error('Failed to load profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to load profile');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const createMockProfile = async () => {
        setIsLoadingProfile(true);
        setError(null);
        try {
            const mockProfile = {
                date_of_birth: '1990-05-15',
                nationality: 'AMERICAN',
                gender: 'FEMALE',
                race: 'ASIAN',
                ethnicity: 'NOT_HISPANIC_OR_LATINO',
                preferred_language: 'ENGLISH_LANGUAGE',
                marital_status: 'MARRIED',
                name: {
                    prefix: 'Ms.',
                    first_name: 'Jane',
                    middle_name: 'Marie',
                    last_name: 'Doe',
                    use: 'USUAL'
                },
                addresses: {
                    use: 'HOME',
                    line_1: '123 Main Street',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'UNITED_STATES',
                    zip_code: '94102'
                },
                phone_numbers: {
                    value: '+1-415-555-0123',
                    type: 'MOBILE'
                },
                emails: {
                    value: 'jane.doe@example.com',
                    type: 'PERSONAL'
                }
            };
            
            await skyflowService.insertUserProfile(mockProfile);
            await loadProfile();
        } catch (error) {
            console.error('Failed to create mock profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to create mock profile');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const addMoment = () => {
        if (!inputText.trim()) return;

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

    const getHeaderTitle = () => {
        if (view === 'calendar') return 'Your Life';
        if (view === 'processing') return 'Momo Thinking...';
        if (view === 'dashboard') return 'Daily Story';
        if (view === 'profile') return 'Profile';
        return 'Moments';
    };

    const getHeaderSubtitle = () => {
        if (view === 'calendar') return 'Overview';
        if (view === 'input') return selectedDate === TODAY ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (view === 'profile') return 'Skyflow Data';
        return new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getWeekDates = (date: Date) => {
        const week = [];
        const current = new Date(date);
        const day = current.getDay();
        const diff = current.getDate() - day;
        const startOfWeek = new Date(current.setDate(diff));

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            week.push(d);
        }
        return week;
    };

    return (
        <div className="min-h-screen bg-stone-100 text-stone-800 font-sans flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-[3rem] overflow-hidden h-[850px] max-h-[90vh] flex flex-col relative border-[14px] border-stone-900 ring-2 ring-stone-900/10">

                {/* --- HEADER (Fixed) --- */}
                <div className={`h-28 bg-white flex-shrink-0 flex flex-col justify-end px-6 pb-4 z-20 border-b border-stone-50 ${view === 'dashboard' ? 'shadow-md' : ''}`}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            {view !== 'input' && (
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
                            {view !== 'dashboard' && view !== 'profile' && (
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-orange-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>

                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="relative w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border-2 border-white shadow-sm flex items-center justify-center transition-transform active:scale-95"
                                    >
                                        <span className="text-xs font-bold text-white">HM</span>
                                    </button>

                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                            <div className="px-3 py-2 mb-1">
                                                <p className="text-xs font-bold text-stone-800">Henry Mai</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="bg-amber-100 p-0.5 rounded-full">
                                                        <Sparkles size={10} className="text-amber-600 fill-amber-600" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Premium Member</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { setIsProfileMenuOpen(false); loadProfile(); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-indigo-600 rounded-xl transition-colors"
                                            >
                                                <User size={16} /> Profile
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-indigo-600 rounded-xl transition-colors">
                                                <Link size={16} /> Connected Apps
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-indigo-600 rounded-xl transition-colors">
                                                <Settings size={16} /> Settings
                                            </button>
                                            <div className="h-px bg-stone-100 my-1"></div>
                                            <button
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <LogOut size={16} /> Log out
                                            </button>
                                        </div>
                                    )}

                                    {isProfileMenuOpen && (
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                                    )}
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
                    <div className="flex-1 p-6 bg-white overflow-y-auto animate-fade-in relative">

                        <div className={`mb-8 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden transition-all duration-500 ${calendarMode === 'month' ? 'bg-gradient-to-r from-indigo-900 to-indigo-800 shadow-indigo-200' : 'bg-gradient-to-r from-teal-800 to-emerald-800 shadow-emerald-200'}`}>
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3 opacity-90">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-yellow-300" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{calendarMode === 'month' ? 'Monthly Masterpiece' : 'Weekly Wrap-up'}</span>
                                    </div>
                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">AI Analysis</span>
                                </div>

                                {calendarMode === 'month' ? (
                                    <p className="text-sm leading-relaxed text-indigo-100 font-medium mb-3">
                                        "Your month has been highly social and productive. Sleep quality dipped mid-month but recovered. You report feeling 'Calm' most often on weekends."
                                    </p>
                                ) : (
                                    <p className="text-sm leading-relaxed text-emerald-50 font-medium mb-3">
                                        "This week, you focused heavily on 'Health'. Stress spiked on Tuesday but you managed it with evening walks. Great job maintaining balance!"
                                    </p>
                                )}

                                <div className={`flex items-center gap-4 text-[10px] font-medium pt-2 mt-2 border-t ${calendarMode === 'month' ? 'border-indigo-700 text-indigo-300' : 'border-emerald-700 text-emerald-200'}`}>
                                    <span className="flex items-center gap-1"><Activity size={10} /> Most active: Fri</span>
                                    <span>•</span>
                                    <span>Quietest: Tue</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Daily Mood Calendar</h3>

                            <div className="flex bg-stone-100 p-0.5 rounded-lg">
                                <button
                                    onClick={() => setCalendarMode('month')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${calendarMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    Month
                                </button>
                                <button
                                    onClick={() => setCalendarMode('week')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${calendarMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    Week
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6 bg-stone-50 p-2 rounded-xl">
                            <button onClick={handlePrevPeriod} className="p-2 hover:bg-white rounded-lg shadow-sm transition-all text-stone-500"><ChevronLeft size={18} /></button>
                            <h2 className="text-sm font-bold text-stone-800">
                                {calendarMode === 'month'
                                    ? `${monthName} ${currentYear}`
                                    : `Week of ${new Date(displayedDate.setDate(displayedDate.getDate() - displayedDate.getDay())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                }
                            </h2>
                            <button onClick={handleNextPeriod} className="p-2 hover:bg-white rounded-lg shadow-sm transition-all text-stone-500"><ChevronRight size={18} /></button>
                        </div>

                        {calendarMode === 'month' ? (
                            <div className="grid grid-cols-7 gap-2 mb-8 animate-fade-in">
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
                                    const moodEmoji = getMoodEmoji(dayData?.summary?.mood);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => handleDateClick(dateStr)}
                                            className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all hover:scale-110 hover:z-10 ${moodClass} ${isToday ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}
                                        >
                                            <span className={`text-xs font-bold ${hasSummary ? 'text-inherit' : 'text-stone-400'}`}>{day}</span>
                                            {hasSummary && (
                                                <div className="mt-0.5 text-[10px] leading-none animate-fade-in">
                                                    {moodEmoji}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-3 mb-8 animate-fade-in">
                                {getWeekDates(displayedDate).map((date, i) => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const dayData = data[dateStr];
                                    const hasSummary = !!dayData?.summary;
                                    const moodClass = getMoodColor(dayData?.summary?.mood);
                                    const moodEmoji = getMoodEmoji(dayData?.summary?.mood);
                                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                    const dayNum = date.getDate();

                                    return (
                                        <div key={i} onClick={() => handleDateClick(dateStr)} className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] ${hasSummary ? 'bg-white shadow-sm border border-stone-100' : 'bg-stone-50 border border-stone-100 opacity-60'}`}>
                                            <div className={`w-12 h-14 flex flex-col items-center justify-center rounded-xl relative overflow-hidden ${moodClass}`}>
                                                <span className="text-[10px] uppercase font-bold opacity-80">{dayName}</span>
                                                <span className="text-sm font-bold mb-0.5">{dayNum}</span>
                                                {moodEmoji && <div className="absolute -bottom-1 -right-1 opacity-40 text-lg">{moodEmoji}</div>}
                                            </div>
                                            <div className="flex-1">
                                                {hasSummary ? (
                                                    <>
                                                        <h4 className="text-sm font-bold text-stone-800">{dayData?.summary?.title}</h4>
                                                        <div className="flex gap-2 mt-1">
                                                            {dayData?.summary?.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">#{tag}</span>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-stone-400 font-medium italic">No story generated.</p>
                                                )}
                                            </div>
                                            {hasSummary && <ChevronRight size={16} className="text-stone-300" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Detected Themes</h3>
                                <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-1 rounded-full">RedisVL Cluster</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
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
                    <div className="flex-1 flex flex-col bg-stone-50 animate-fade-in relative overflow-hidden">

                        <div className={`absolute top-4 left-0 right-0 flex justify-center pointer-events-none transition-all duration-500 z-30 ${showSavedToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                            <div className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium">
                                <ShieldCheck size={14} /> Saved securely with Skyflow Vault 🔒
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pb-4 scrollbar-hide">

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

                            <div className="px-4 pt-6 relative">
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
                                        {currentMoments.map((m, idx) => {
                                            const ActivityIcon = m.stravaActivity ? getActivityIcon(m.stravaActivity.type) : null;
                                            return (
                                                <div key={idx} className="relative pl-8 animate-fade-in-up group">
                                                    <div className={`absolute left-[7px] top-0 w-3 h-3 rounded-full border-2 border-white ring-2 z-10 ${m.stravaActivity ? 'bg-orange-500 ring-orange-100' : 'bg-indigo-500 ring-indigo-100'}`}></div>

                                                    <div className={`p-4 rounded-2xl rounded-tl-none shadow-sm border hover:shadow-md transition-shadow ${m.stravaActivity ? 'bg-white border-orange-100' : 'bg-white border-stone-100'}`}>

                                                        {m.stravaActivity && (
                                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-orange-50">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="bg-orange-500 p-1 rounded-md text-white">
                                                                        {ActivityIcon && <ActivityIcon size={14} />}
                                                                    </div>
                                                                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                                                                        {m.stravaActivity.type}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                                                    Synced from Strava
                                                                </span>
                                                            </div>
                                                        )}

                                                        <p className="text-stone-700 leading-relaxed mb-3 font-medium">{m.text}</p>

                                                        {m.stravaActivity && (
                                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                                <div className="bg-stone-50 p-2 rounded-lg text-center">
                                                                    <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400 mb-0.5"><Activity size={10} /> Dist</div>
                                                                    <span className="text-xs font-bold text-stone-700">{m.stravaActivity.distance}</span>
                                                                </div>
                                                                <div className="bg-stone-50 p-2 rounded-lg text-center">
                                                                    <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400 mb-0.5"><Timer size={10} /> Time</div>
                                                                    <span className="text-xs font-bold text-stone-700">{m.stravaActivity.duration}</span>
                                                                </div>
                                                                <div className="bg-stone-50 p-2 rounded-lg text-center">
                                                                    <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400 mb-0.5"><Flame size={10} /> Cals</div>
                                                                    <span className="text-xs font-bold text-stone-700">{m.stravaActivity.calories}</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                                            {m.emotion && (
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getEmotionColor(m.emotion)}`}>
                                                                    {getEmotionIcon(m.emotion)} {getEmotionLabel(m.emotion)}
                                                                </span>
                                                            )}
                                                            {m.tags?.map(tag => (
                                                                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>

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
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-none p-4 bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] rounded-t-[30px] z-30">
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
                    <div className="flex-1 overflow-y-auto bg-stone-50 pb-8 animate-fade-in relative">
                        <div className={`p-8 pb-12 rounded-b-[3rem] ${getMoodColor(currentSummary.mood).replace('border', '')} transition-colors duration-700 relative overflow-hidden`}>
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
                                        {expandedHighlight === i && (
                                            <div className="mt-3 pl-4 border-l-2 border-stone-100 text-xs text-stone-500 animate-fade-in">
                                                <p className="font-bold text-stone-400 mb-1 uppercase tracking-wider text-[10px]">Original Moment</p>
                                                <p className="italic">"{currentMoments.find(m => m.id === h.sourceMomentId)?.text || 'Moment not found'}"</p>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600">
                                                    <Database size={8} /> <span>Verified from Skyflow</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

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

                {/* --- VIEW: PROFILE --- */}
                {view === 'profile' && (
                    <div className="flex-1 overflow-y-auto bg-stone-50 pb-8">
                        <div className="p-6">
                            <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-bold">
                                            {profileData.length > 0 ? '👤' : '🔒'}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">User Profile</h2>
                                            <p className="text-sm text-white/80">{profileData.length > 0 ? 'Profile loaded' : 'No profile found'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {isLoadingProfile ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : profileData.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Database size={48} className="mx-auto text-stone-300 mb-4" />
                                            <p className="text-stone-500 font-medium mb-2">No profile data found</p>
                                            <p className="text-sm text-stone-400 mb-4">Create a mock user profile to see how Skyflow stores data</p>
                                            <button
                                                onClick={createMockProfile}
                                                disabled={isLoadingProfile}
                                                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                            >
                                                Create Mock Profile
                                            </button>
                                        </div>
                                    ) : profileData.length > 0 ? (
                                        <div className="space-y-4">
                                            {(() => {
                                                const record = profileData[0];
                                                return (
                                                    <div key={record.skyflow_id} className="border border-stone-200 rounded-2xl p-5 bg-stone-50">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                                                <ShieldCheck size={16} className="text-emerald-600" />
                                                                User Profile
                                                            </h3>
                                                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                                <Database size={10} className="inline mr-1" />
                                                                {record.skyflow_id?.substring(0, 12)}...
                                                            </span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {record.fields?.date_of_birth && (
                                                                <div className="flex items-start gap-3">
                                                                    <Calendar size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-xs font-medium text-stone-500">Date</p>
                                                                        <p className="text-sm text-stone-900">{record.fields.date_of_birth}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {record.fields?.nationality && (
                                                                <div className="flex items-start gap-3">
                                                                    <MapPin size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-xs font-medium text-stone-500">Nationality</p>
                                                                        <p className="text-sm text-stone-900">{record.fields.nationality}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {record.fields?.name && (
                                                                <div className="border-t border-stone-200 pt-3 mt-3">
                                                                    <p className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">Name</p>
                                                                    {record.fields.name.prefix && (
                                                                        <div className="mb-2">
                                                                            <p className="text-xs font-medium text-stone-500">Prefix</p>
                                                                            <p className="text-sm text-stone-900 bg-white p-2 rounded-lg border border-stone-200">
                                                                                {record.fields.name.prefix}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    {record.fields.name.first_name && (
                                                                        <div className="mb-2">
                                                                            <p className="text-xs font-medium text-stone-500">First Name</p>
                                                                            <p className="text-sm text-stone-900 bg-white p-2 rounded-lg border border-stone-200 break-words">
                                                                                {record.tokens?.name?.first_name || record.fields.name.first_name}
                                                                            </p>
                                                                            {record.tokens?.name?.first_name && (
                                                                                <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                                                                                    <Lock size={8} /> Tokenized
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {record.fields.name.middle_name && (
                                                                        <div className="mb-2">
                                                                            <p className="text-xs font-medium text-stone-500">Middle Name</p>
                                                                            <p className="text-sm text-stone-900 bg-white p-2 rounded-lg border border-stone-200">
                                                                                {record.tokens?.name?.middle_name || record.fields.name.middle_name}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    {record.fields.name.last_name && (
                                                                        <div className="mb-2">
                                                                            <p className="text-xs font-medium text-stone-500">Last Name</p>
                                                                            <p className="text-sm text-stone-900 bg-white p-2 rounded-lg border border-stone-200 break-words">
                                                                                {record.tokens?.name?.last_name || record.fields.name.last_name}
                                                                            </p>
                                                                            {record.tokens?.name?.last_name && (
                                                                                <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                                                                                    <Lock size={8} /> Tokenized
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {record.fields.name.suffix && (
                                                                        <div className="mb-2">
                                                                            <p className="text-xs font-medium text-stone-500">Suffix</p>
                                                                            <p className="text-sm text-stone-900 bg-white p-2 rounded-lg border border-stone-200">
                                                                                {record.fields.name.suffix}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {record.fields?.gender && (
                                                                <div className="flex items-start gap-3 border-t border-stone-200 pt-3 mt-3">
                                                                    <User size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-xs font-medium text-stone-500">Gender</p>
                                                                        <p className="text-sm text-stone-900">{record.fields.gender}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {record.fields?.addresses && (
                                                                <div className="border-t border-stone-200 pt-3 mt-3">
                                                                    <p className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">Address</p>
                                                                    {record.fields.addresses.line_1 && (
                                                                        <p className="text-sm text-stone-900 bg-white p-2 rounded-lg border border-stone-200 mb-1">
                                                                            {record.fields.addresses.line_1}
                                                                        </p>
                                                                    )}
                                                                    {record.fields.addresses.line_2 && (
                                                                        <p className="text-sm text-stone-900 bg-white p-2 rounded-lg border border-stone-200 mb-1">
                                                                            {record.fields.addresses.line_2}
                                                                        </p>
                                                                    )}
                                                                    {(record.fields.addresses.city || record.fields.addresses.state || record.fields.addresses.zip_code) && (
                                                                        <p className="text-sm text-stone-900">
                                                                            {[record.fields.addresses.city, record.fields.addresses.state, record.fields.addresses.zip_code].filter(Boolean).join(', ')}
                                                                        </p>
                                                                    )}
                                                                    {record.fields.addresses.country && (
                                                                        <p className="text-sm text-stone-900">{record.fields.addresses.country}</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {record.fields?.phone_numbers && (
                                                                <div className="flex items-start gap-3 border-t border-stone-200 pt-3 mt-3">
                                                                    <Database size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-xs font-medium text-stone-500">Phone</p>
                                                                        <p className="text-sm text-stone-900">{record.fields.phone_numbers.value}</p>
                                                                        {record.fields.phone_numbers.type && (
                                                                            <p className="text-xs text-stone-400">{record.fields.phone_numbers.type}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {record.fields?.emails && (
                                                                <div className="flex items-start gap-3 border-t border-stone-200 pt-3 mt-3">
                                                                    <Database size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-xs font-medium text-stone-500">Email</p>
                                                                        <p className="text-sm text-stone-900">{record.fields.emails.value}</p>
                                                                        {record.fields.emails.type && (
                                                                            <p className="text-xs text-stone-400">{record.fields.emails.type}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="border-t border-stone-200 pt-3 mt-3">
                                                                <p className="text-xs font-medium text-stone-500 mb-1">Skyflow ID</p>
                                                                <p className="text-xs font-mono text-stone-600 bg-white p-2 rounded-lg border border-stone-200 break-all">
                                                                    {record.skyflow_id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {profileData.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-2xl p-4 border border-stone-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Database size={16} className="text-indigo-600" />
                                            <p className="text-xs font-medium text-stone-500">Status</p>
                                        </div>
                                        <p className="text-2xl font-bold text-stone-900">✓</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-stone-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lock size={16} className="text-emerald-600" />
                                            <p className="text-xs font-medium text-stone-500">Encrypted</p>
                                        </div>
                                        <p className="text-2xl font-bold text-stone-900">✓</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
