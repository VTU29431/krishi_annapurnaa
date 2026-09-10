import { LanguageCode } from '../types.ts';

export const LANGUAGE_LOCALE_MAP: Record<LanguageCode, { locale: string; name: string }> = {
  en: { locale: 'en-IN', name: 'Indian English' },
  hi: { locale: 'hi-IN', name: 'हिन्दी (Hindi)' },
  te: { locale: 'te-IN', name: 'తెలుగు (Telugu)' },
  ta: { locale: 'ta-IN', name: 'தமிழ் (Tamil)' },
  pa: { locale: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  bn: { locale: 'bn-IN', name: 'বাংলা (Bengali)' },
  mr: { locale: 'mr-IN', name: 'मराठी (Marathi)' },
  kn: { locale: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
  gu: { locale: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
  or: { locale: 'or-IN', name: 'ଓଡ଼ିଆ (Odia)' },
  ur: { locale: 'ur-IN', name: 'اردو (Urdu)' },
  ml: { locale: 'ml-IN', name: 'മലയാളം (Malayalam)' },
};

/**
 * Robust Text-to-Speech Engine for all 12 Indian languages
 */
export function speakText(
  text: string,
  lang: LanguageCode,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment');
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any currently playing audio

    const target = LANGUAGE_LOCALE_MAP[lang] || { locale: 'en-IN', name: 'English' };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = target.locale;
    utterance.rate = options?.rate ?? 0.95;
    utterance.pitch = options?.pitch ?? 1.0;

    // Attempt to match installed system voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(target.locale.toLowerCase()) ||
          v.lang.toLowerCase().startsWith(lang.toLowerCase())
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis playback error:', err);
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
