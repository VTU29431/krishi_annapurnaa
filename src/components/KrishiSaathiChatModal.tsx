import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  MapPin,
  ExternalLink,
  Loader2,
  Bot,
  User as UserIcon,
  RefreshCw,
  PhoneCall,
  PhoneOff,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { firestore } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  places?: Array<{ title: string; uri: string }>;
  timestamp: string;
}

interface KrishiSaathiProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  user?: any;
}

export default function KrishiSaathiChatModal({
  isOpen,
  onClose,
  lang = 'en',
  user,
}: KrishiSaathiProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content:
        'Namaste! 🙏 I am **Krishi Saathi (कृषि साथी)**, your Official AI Agricultural Procurement & Mandi Assistant.\n\nI can help you with:\n• **30-Min Digital Token Booking & Slot Timings**\n• **FAQ Crop Quality Standards** (Moisture limit ≤ 17% for Paddy)\n• **Real-Time Mandi Queues & Smart Diversions**\n• **MSP Rates & 48-Hour DBT Disbursal**\n• **Google Maps Mandi & Silo Locator**\n\nHow may I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'maps' | 'voice'>('chat');
  const [mapLocationQuery, setMapLocationQuery] = useState('Karnal, Haryana');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapResults, setMapResults] = useState<{
    text: string;
    places: Array<{ title: string; uri: string }>;
  } | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Send Chat Message to /api/ai/chat
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          district: 'Karnal, Haryana',
          lang,
        }),
      });

      const data = await res.json();
      const botReply: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || 'I could not process your query at this moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedChat = [...newHistory, botReply];
      setMessages(updatedChat);

      // Persist to Firestore if user is authenticated
      if (user?.uid) {
        try {
          const chatDoc = doc(firestore, 'ai_chats', `${user.uid}_latest`);
          await setDoc(
            chatDoc,
            {
              userId: user.uid,
              lastMessage: botReply.content.slice(0, 100),
              updatedAt: serverTimestamp(),
              messageCount: updatedChat.length,
            },
            { merge: true }
          );
        } catch (fsErr) {
          console.warn('Firestore chat save fallback:', fsErr);
        }
      }
    } catch (err: any) {
      console.error('Failed to get bot reply:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          content: 'Sorry, the assistant is currently experiencing high load. Please try asking again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Start Audio Recording with gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioForTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Microphone access is required for voice input. Please enable permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (blob: Blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/ai/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type || 'audio/webm',
          }),
        });

        const data = await res.json();
        if (data.transcript) {
          setInput(data.transcript);
          // If in live call mode, automatically send
          if (isLiveCallActive) {
            handleLiveVoiceCall(data.transcript);
          }
        }
      };
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Live Voice Call Mode with gemini-3.1-flash-live-preview / TTS
  const handleLiveVoiceCall = async (spokenText: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/voice-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSpeechText: spokenText,
          lang,
        }),
      });

      const data = await res.json();
      if (data.responseText) {
        setMessages((prev) => [
          ...prev,
          {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: spokenText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `bot-voice-${Date.now()}`,
            role: 'model',
            content: data.responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        if (data.audioBase64) {
          playAudioResponse(data.audioBase64);
        }
      }
    } catch (err) {
      console.error('Voice call error:', err);
    } finally {
      setLoading(false);
    }
  };

  const playAudioResponse = (base64Audio: string) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setIsAudioPlaying(true);
      audio.onended = () => setIsAudioPlaying(false);
      audio.onerror = () => setIsAudioPlaying(false);
      audio.play().catch((e) => console.warn('Audio play error:', e));
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  // Google Maps Grounding Search with gemini-3.5-flash
  const handleSearchMapsMandi = async () => {
    if (!mapLocationQuery.trim() || mapsLoading) return;
    setMapsLoading(true);
    try {
      // Try to get current position if available
      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const pos: any = await new Promise((resolve) =>
          navigator.geolocation?.getCurrentPosition(resolve, () => resolve(null), { timeout: 3000 })
        );
        if (pos?.coords) {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      } catch {
        // Fallback
      }

      const res = await fetch('/api/ai/maps-mandi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: mapLocationQuery,
          latitude: lat,
          longitude: lng,
          crop: 'Paddy and Wheat',
        }),
      });

      const data = await res.json();
      setMapResults({
        text: data.text || '',
        places: data.places || [],
      });
    } catch (err) {
      console.error('Maps search error:', err);
    } finally {
      setMapsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="krishi-saathi-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[88vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Krishi Saathi AI (कृषि साथी)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] font-bold border border-emerald-400/40">
                  Gemini 3.5 Flash
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Official Multi-Turn Procurement Assistant • Live Voice & Maps Grounded
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {isAudioPlaying && (
              <button
                onClick={() => {
                  currentAudioRef.current?.pause();
                  setIsAudioPlaying(false);
                }}
                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 text-xs flex items-center space-x-1"
                title="Mute spoken response"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'chat'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chatbot Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'voice'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span>Live Voice Call</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('maps');
              if (!mapResults) handleSearchMapsMandi();
            }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'maps'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Maps Mandis</span>
          </button>
        </div>

        {/* Tab 1: Chat Assistant */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start space-x-2.5 ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'model' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans font-normal">{m.content}</div>

                    {m.places && m.places.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="font-bold text-[11px] text-emerald-800 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>Google Maps Grounded Locations:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.places.map((place, idx) => (
                            <a
                              key={idx}
                              href={place.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-all"
                            >
                              <span>{place.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        m.role === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Krishi Saathi is analyzing guidelines & live data...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 border-t border-slate-200 bg-white flex items-center space-x-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <span className="text-slate-400 font-semibold px-1 whitespace-nowrap">Suggested:</span>
              <button
                onClick={() => handleSendMessage('What is the maximum moisture percentage allowed for Paddy Grade A?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 whitespace-nowrap transition-all"
              >
                🌾 Paddy Moisture Limit
              </button>
              <button
                onClick={() => handleSendMessage('Check current queue wait time at Karnal Central Mandi')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 whitespace-nowrap transition-all"
              >
                ⏱️ Karnal Mandi Queue
              </button>
              <button
                onClick={() => handleSendMessage('What is the Minimum Support Price (MSP) for 2026 Kharif paddy?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 whitespace-nowrap transition-all"
              >
                💰 MSP 2026 Rates
              </button>
              <button
                onClick={() => handleSendMessage('How does Direct Benefit Transfer (DBT) credit into my bank account?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 whitespace-nowrap transition-all"
              >
                🏦 DBT Bank Disbursal
              </button>
            </div>

            {/* Input Form with Audio Transcription */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
            >
              {/* Microphone Audio Input */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200'
                }`}
                title={isRecording ? 'Stop Recording' : 'Speak to Transcribe with Gemini 3.5'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? 'Listening... Speak in Hindi or English' : 'Ask about mandi tokens, moisture, queues, MSP...'}
                className="flex-1 text-xs py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Live Voice Call Mode */}
        {activeTab === 'voice' && (
          <div className="flex-1 p-6 bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center relative">
              <div className={`w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center ${isRecording ? 'animate-ping' : ''}`}>
                <PhoneCall className="w-8 h-8 text-white" />
              </div>
              {isRecording && (
                <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-bold animate-pulse">
                  LISTENING
                </div>
              )}
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Krishi Live Voice Call</h3>
              <p className="text-xs text-slate-400">
                Interactive real-time voice conversation powered by <strong>Gemini 3.1 Live & Speech Synthesis</strong>. Talk naturally in Hindi, Punjabi, or English to check mandi slots, weighbridge lines, or FAQ moisture guidelines.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-full text-xs font-bold transition-all flex items-center space-x-2 shadow-lg ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <PhoneOff className="w-4 h-4" />
                    <span>Stop Speaking</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Tap to Speak with AI</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleLiveVoiceCall('Hello, what is the token wait time today?')}
                className="px-4 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                Quick Voice Query
              </button>
            </div>

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-emerald-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing live speech dialogue...</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Google Maps Grounded Mandi Search */}
        {activeTab === 'maps' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-slate-50 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Google Maps Mandi & Silo Grounding
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Live geographic search for APMC grain markets, government procurement yards & FCI godowns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={mapLocationQuery}
                  onChange={(e) => setMapLocationQuery(e.target.value)}
                  placeholder="Enter district, tehsil or city (e.g. Karnal, Kurukshetra, Khanna)..."
                  className="flex-1 text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSearchMapsMandi}
                  disabled={mapsLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm disabled:bg-slate-300"
                >
                  {mapsLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                  <span>Search Maps</span>
                </button>
              </div>
            </div>

            {mapResults && (
              <div className="space-y-3">
                {mapResults.places.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                    <h4 className="text-xs font-bold text-blue-950 mb-2 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Google Maps Centers Found:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mapResults.places.map((place, idx) => (
                        <a
                          key={idx}
                          href={place.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg bg-blue-50/70 hover:bg-blue-100 border border-blue-200 transition-all flex items-center justify-between group"
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold text-xs text-blue-900 group-hover:text-blue-950 truncate">
                              {place.title}
                            </div>
                            <div className="text-[10px] text-blue-600 truncate">
                              Open in Google Maps Directions
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                  {mapResults.text}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
