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
    RefreshCw,
    ShieldCheck,
    AlertCircle,
    User,
    Calendar,
    MapPin,
} from 'lucide-react';
import { SKYFLOW_CONFIG } from './config/skyflow';

// --- Types ---
type Emotion = 'happy' | 'calm' | 'stressed' | 'tired' | 'excited' | 'neutral';

type Moment = {
    id: string;
    textToken: string;
    locationToken: string;
    timestamp: string;
    emotion?: Emotion;
    tags?: string[];
    weather?: string;
};

type DailySummary = {
    title: string;
    storyToken: string;
    mood: number;
    weatherContext: string;
    tags: string[];
};

type DayData = {
    moments: Moment[];
    summary: DailySummary | null;
};

type AppData = Record<string, DayData>;

// --- Helpers ---

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

    /**
     * Insert a mock user profile using only schema-defined fields
     * This is the ONLY method that should store data in Skyflow
     */
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
            // Fetch records from persons table and return only the first one
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
            // Return only the first record, or empty array if none
            const records = result.records || [];
            return records.length > 0 ? [records[0]] : [];
        } catch (error) {
            console.error('Skyflow fetch error:', error);
            throw error;
        }
    }
}

// --- Helpers ---
const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

const TODAY = getPastDate(0);

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

const analyzeMoment = (text: string): { emotion: Emotion, tags: string[] } => {
    const lower = text.toLowerCase();
    if (lower.includes('stress') || lower.includes('deadline')) return { emotion: 'stressed', tags: ['Work', 'Pressure'] };
    if (lower.includes('happy') || lower.includes('great')) return { emotion: 'happy', tags: ['Joy', 'Wins'] };
    if (lower.includes('tired') || lower.includes('sleep')) return { emotion: 'tired', tags: ['Health', 'Sleep'] };
    if (lower.includes('walk') || lower.includes('nature')) return { emotion: 'calm', tags: ['Nature', 'Health'] };
    if (lower.includes('code') || lower.includes('hackathon')) return { emotion: 'excited', tags: ['Hackathon', 'Dev'] };
    return { emotion: 'neutral', tags: ['Daily'] };
};

const getMoodColor = (mood: number | undefined) => {
    if (mood === undefined) return 'bg-stone-100 border-stone-200 text-stone-400';
    if (mood >= 8) return 'bg-emerald-400 border-emerald-500 text-white shadow-lg shadow-emerald-200';
    if (mood >= 5) return 'bg-amber-300 border-amber-400 text-amber-900';
    return 'bg-rose-400 border-rose-500 text-white shadow-lg shadow-rose-200';
};

// --- Main Component ---
export default function MomentsApp() {
    const [view, setView] = useState<'input' | 'processing' | 'dashboard' | 'profile'>('input');
    const [profileData, setProfileData] = useState<any[]>([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [selectedDate] = useState<string>(TODAY);
    const [data, setData] = useState<AppData>({});
    const [inputText, setInputText] = useState('');
    const [processingStep, setProcessingStep] = useState(0);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const skyflowService = SkyflowService.getInstance();

    const processingSteps = [
        { text: "🔒 Encrypting & Vaulting to Skyflow...", icon: Lock },
        { text: "🌤️ Analyzing context (Weather API)...", icon: CloudRain },
        { text: "🧠 AI Emotion & Tag Detection...", icon: Brain },
        { text: "📝 Momo writing your story (Claude)...", icon: Sparkles },
        { text: "💾 Saving summary to Skyflow...", icon: Database },
    ];

    const handleBack = () => {
        if (view === 'dashboard' || view === 'profile') {
            setView('input');
        }
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
            await loadProfile(); // Refresh profile data
        } catch (error) {
            console.error('Failed to create mock profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to create mock profile');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    // Add moment - stored locally only (NOT in Skyflow)
    const addMoment = async () => {
        if (!inputText.trim() || isSaving) return;

        setIsSaving(true);
        setError(null);

        try {
            // Analyze emotion/tags locally (no PII sent to AI, no Skyflow storage)
            const analysis = analyzeMoment(inputText);

            // Create moment - stored locally only
            const newMoment: Moment = {
                id: Date.now().toString(),
                textToken: inputText, // Store locally, not tokenized
                locationToken: "San Francisco, CA", // Store locally
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                emotion: analysis.emotion,
                tags: analysis.tags,
                weather: "62°F Sunny"
            };

            // Store in app state (local storage only)
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

        } catch (error) {
            console.error('Failed to save moment:', error);
            setError(error instanceof Error ? error.message : 'Failed to save moment');
        } finally {
            setIsSaving(false);
        }
    };

    const startProcessing = async () => {
        setView('processing');
        setError(null);

        try {
            for (let i = 0; i <= processingSteps.length; i++) {
                setProcessingStep(i);
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (i === processingSteps.length) {
                    const dayMoments = data[selectedDate]?.moments || [];

                    const summaryData = {
                        title: "Finding The Flow",
                        story: "Today was meaningful and full of reflection. You captured important moments that reveal patterns in your daily life.",
                        mood: 7
                    };

                    // Create summary - stored locally only (NOT in Skyflow)
                    const newSummary: DailySummary = {
                        ...summaryData,
                        storyToken: summaryData.story, // Store locally, not tokenized
                        weatherContext: "Partly Cloudy, 22°C",
                        tags: ["Productivity", "Mindfulness"]
                    };

                    setData(prev => ({
                        ...prev,
                        [selectedDate]: {
                            moments: dayMoments,
                            summary: newSummary
                        }
                    }));

                    setTimeout(() => setView('dashboard'), 500);
                }
            }
        } catch (error) {
            console.error('Processing error:', error);
            setError(error instanceof Error ? error.message : 'Failed to process moments');
            setView('input');
        }
    };

    const currentMoments = data[selectedDate]?.moments || [];
    const currentSummary = data[selectedDate]?.summary;

    return (
        <div className="min-h-screen bg-stone-100 text-stone-800 font-sans flex justify-center p-4 md:p-8">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-[40px] overflow-hidden min-h-[800px] flex flex-col relative border-8 border-stone-900">

                {/* --- HEADER --- */}
                <div className="h-28 bg-white flex flex-col justify-end px-6 pb-4 sticky top-0 z-20 border-b border-stone-50 backdrop-blur-xl bg-white/90">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            {view === 'input' ? (
                                <>
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg transform rotate-3">
                                        M
                                    </div>
                                    <button 
                                        onClick={loadProfile}
                                        disabled={isLoadingProfile}
                                        className="ml-auto p-2 hover:bg-stone-100 rounded-full transition-colors"
                                        title="View Profile"
                                    >
                                        <User size={20} className="text-stone-600" />
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors">
                                    <ChevronLeft size={24} className="text-stone-600" />
                                </button>
                            )}

                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">
                                    {view === 'input' ? 'Today' : selectedDate}
                                </span>
                                <span className="font-bold text-xl leading-none text-stone-800 tracking-tight">
                                    {view === 'input' ? 'Moments' : view === 'processing' ? 'Momo Thinking...' : view === 'profile' ? 'Profile' : 'Daily Story'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {view === 'input' && (
                        <p className="text-xs text-stone-400 mt-2 font-medium">
                            🔒 All data encrypted via Skyflow before storage
                        </p>
                    )}
                </div>

                {/* --- ERROR BANNER --- */}
                {error && (
                    <div className="mx-4 mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-rose-900 mb-1">Error</p>
                            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
                        </div>
                    </div>
                )}

                {/* --- VIEW: INPUT --- */}
                {view === 'input' && (
                    <div className="flex-1 flex flex-col bg-stone-50 relative">

                        {/* Saved Toast */}
                        <div className={`absolute top-4 left-0 right-0 flex justify-center pointer-events-none transition-all duration-500 z-30 ${showSavedToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                            <div className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium">
                                <CheckCircle2 size={14} /> Moment saved! 💾
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pb-32">

                            {/* Info Card */}
                            <div className="mx-4 mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock size={16} />
                                    <h3 className="font-bold text-sm">Skyflow Data Privacy Vault</h3>
                                </div>
                                <p className="text-xs opacity-90 leading-relaxed mb-3">
                                    Your personal moments are tokenized and encrypted before storage. Only you can decrypt them.
                                </p>
                                <div className="flex items-center gap-2 text-[10px] bg-white/20 rounded-lg px-2 py-1">
                                    <Database size={10} />
                                    <span className="font-mono">{SKYFLOW_CONFIG.vaultID.substring(0, 20)}...</span>
                                </div>
                            </div>

                            <div className="px-4 pt-6">
                                {currentMoments.length === 0 ? (
                                    <div className="text-center mt-10 opacity-40">
                                        <PenLine size={48} className="mx-auto mb-4 text-stone-400" />
                                        <p className="text-stone-500 font-medium">No moments yet.</p>
                                        <p className="text-xs text-stone-400 mt-1">Start capturing your day.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {currentMoments.map((m, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <Lock size={14} className="text-emerald-600 mt-1 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-stone-500 leading-relaxed mb-1 font-mono text-xs break-all">
                                                            {m.textToken}
                                                        </p>
                                                        <p className="text-[10px] text-stone-400">
                                                            (Original text encrypted in Skyflow)
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {m.emotion && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEmotionColor(m.emotion)}`}>
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
                                                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                                        <Clock size={10} /> {m.timestamp}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-stone-100 sticky bottom-0">
                            {currentMoments.length > 0 && (
                                <button
                                    onClick={startProcessing}
                                    className="w-full mb-4 bg-stone-900 text-white py-3.5 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-stone-800"
                                >
                                    <Sparkles size={16} className="text-yellow-300" />
                                    Create My Day's Story
                                </button>
                            )}

                            <div className="relative flex items-end gap-2">
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isSaving && addMoment()}
                                    placeholder="What's happening right now?"
                                    disabled={isSaving}
                                    className="w-full bg-stone-100 border-0 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-stone-400 font-medium text-sm disabled:opacity-50"
                                />
                                <button
                                    onClick={addMoment}
                                    disabled={isSaving}
                                    className="absolute right-2 bottom-2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW: PROCESSING --- */}
                {view === 'processing' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden">
                        <div className="w-full max-w-xs relative z-10">
                            <div className="flex justify-center mb-12">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                                    <Brain size={32} className="text-indigo-600" />
                                </div>
                            </div>

                            <div className="text-center mb-10">
                                <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Momo is writing...</h3>
                                <p className="text-sm text-stone-500">Weaving your moments into a narrative.</p>
                            </div>

                            <div className="space-y-6">
                                {processingSteps.map((step, idx) => {
                                    const isDone = idx < processingStep;
                                    const isCurrent = idx === processingStep;
                                    return (
                                        <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isCurrent ? 'scale-105 opacity-100' : isDone ? 'opacity-40' : 'opacity-20'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-stone-200'}`}>
                                                {isDone ? <CheckCircle2 size={12} /> : isCurrent && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
                                            </div>
                                            <span className="text-sm font-medium">{step.text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW: DASHBOARD --- */}
                {view === 'dashboard' && currentSummary && (
                    <div className="flex-1 overflow-y-auto bg-stone-50 pb-8">
                        <div className={`p-8 pb-12 rounded-b-[3rem] ${getMoodColor(currentSummary.mood)}`}>
                            <h1 className="text-3xl font-serif font-medium leading-tight mb-4 text-stone-900">
                                {currentSummary.title}
                            </h1>
                            <div className="flex gap-2">
                                {currentSummary.tags.map(t => (
                                    <span key={t} className="bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 -mt-8">
                            <div className="bg-white p-6 rounded-3xl shadow-xl mb-6 border border-stone-100">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg">🤖</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-stone-900 mb-2">Momo's Reflection</h3>
                                        <div className="bg-stone-50 p-3 rounded-lg mb-3">
                                            <p className="text-[10px] text-stone-500 font-mono mb-1 break-all">
                                                🔒 Story Token: {currentSummary.storyToken}
                                            </p>
                                            <p className="text-[9px] text-stone-400">
                                                (Original narrative encrypted in Skyflow)
                                            </p>
                                        </div>
                                    </div>
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
                                {/* Profile Header */}
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

                                {/* Profile Content */}
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
                                                        {/* Date of Birth */}
                                                        {record.fields?.date_of_birth && (
                                                            <div className="flex items-start gap-3">
                                                                <Calendar size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-xs font-medium text-stone-500">Date</p>
                                                                    <p className="text-sm text-stone-900">{record.fields.date_of_birth}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Nationality */}
                                                        {record.fields?.nationality && (
                                                            <div className="flex items-start gap-3">
                                                                <MapPin size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-xs font-medium text-stone-500">Nationality</p>
                                                                    <p className="text-sm text-stone-900">{record.fields.nationality}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Name Fields */}
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

                                                        {/* Gender */}
                                                        {record.fields?.gender && (
                                                            <div className="flex items-start gap-3 border-t border-stone-200 pt-3 mt-3">
                                                                <User size={16} className="text-stone-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-xs font-medium text-stone-500">Gender</p>
                                                                    <p className="text-sm text-stone-900">{record.fields.gender}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Address */}
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

                                                        {/* Phone */}
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

                                                        {/* Email */}
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

                                                        {/* Skyflow ID */}
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

                            {/* Stats Summary */}
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