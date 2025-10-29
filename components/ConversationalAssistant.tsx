import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { assistantTools } from '../services/assistantTools';
import { useTranslation } from '../hooks/useTranslation';
import { Page } from '../App';
import { ProjectType } from '../types';

// Helper functions for audio processing (should be defined outside component to avoid recreation)
const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const encode = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

interface ConversationalAssistantProps {
  onNavigate: (page: Page) => string;
  onAddProject: (project: Omit<ProjectType, 'id'>) => string;
  onStartVideoForProject: (projectName: string) => string;
}

type AssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const ConversationalAssistant: React.FC<ConversationalAssistantProps> = (props) => {
  const { onNavigate, onAddProject, onStartVideoForProject } = props;
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<AssistantStatus>('idle');
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Audio playback queue
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  const getApiKey = (): string | null => localStorage.getItem('kineo-api-key');

  const playResponse = useCallback(async (base64Audio: string) => {
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = outputAudioContextRef.current;
    
    setStatus('speaking');

    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    source.onended = () => {
        audioQueueRef.current.shift(); // Remove the played buffer
        if (audioQueueRef.current.length === 0) {
            setStatus('listening'); // Go back to listening if queue is empty
        }
    };
    
    const currentTime = audioContext.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
    audioQueueRef.current.push(source);
  }, []);

  const stopPlayback = () => {
      audioQueueRef.current.forEach(source => source.stop());
      audioQueueRef.current = [];
      nextStartTimeRef.current = 0;
  };

  const startSession = useCallback(async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      alert("API Key not found. Please configure it first.");
      setIsActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputAudioContext.createMediaStreamSource(stream);
      const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
      audioProcessorRef.current = scriptProcessor;
      
      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const pcmBlob: Blob = {
          data: encode(new Uint8Array(int16.buffer)),
          mimeType: 'audio/pcm;rate=16000',
        };

        sessionPromiseRef.current?.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };
      source.connect(scriptProcessor);
      scriptProcessor.connect(inputAudioContext.destination);

      const ai = new GoogleGenAI({ apiKey });
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => setStatus('listening'),
          onmessage: async (message: LiveServerMessage) => {
             if (message.toolCall) {
                setStatus('thinking');
                stopPlayback();
                for (const fc of message.toolCall.functionCalls) {
                  let result = t('assistant.response.error');
                  try {
                      if (fc.name === 'createProject') {
                        result = onAddProject(fc.args);
                      } else if (fc.name === 'navigateTo') {
                        result = onNavigate(fc.args.page);
                      } else if (fc.name === 'startVideoForProject') {
                        result = onStartVideoForProject(fc.args.projectName);
                      }
                  } catch (e) {
                      console.error(`Error executing tool ${fc.name}:`, e);
                  }
                  sessionPromiseRef.current?.then(session => {
                      session.sendToolResponse({
                          functionResponses: { id: fc.id, name: fc.name, response: { result } }
                      });
                  });
                }
             }
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
             if (base64Audio) {
                playResponse(base64Audio);
             }
             if (message.serverContent?.interrupted) {
                stopPlayback();
             }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus('error');
          },
          onclose: () => {
            // console.debug('Session closed');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: assistantTools }],
          systemInstruction: 'You are a helpful AI assistant for a video creation app called Kineo AI. Be concise and confirm actions. Do not ask "how can I help". Wait for the user to speak.',
        },
      });

    } catch (err) {
      console.error("Failed to get microphone permissions:", err);
      setStatus('error');
      setIsActive(false);
    }
  }, [playResponse, onAddProject, onNavigate, onStartVideoForProject, t]);

  const stopSession = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    audioProcessorRef.current?.disconnect();
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    stopPlayback();
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (isActive) {
      startSession();
    } else {
      stopSession();
    }
    return () => stopSession(); // Cleanup on unmount
  }, [isActive, startSession, stopSession]);

  const getStatusIndicator = () => {
    switch(status) {
        case 'listening': return <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" title={t('assistant.status.listening')}></div>;
        case 'thinking': return <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" title={t('assistant.status.thinking')}></div>;
        case 'speaking': return <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping" title={t('assistant.status.speaking')}></div>;
        case 'error': return <div className="w-4 h-4 bg-red-500 rounded-full" title={t('assistant.status.error')}></div>;
        default: return null;
    }
  };

  if (!getApiKey()) {
    return null; // Don't show the assistant if no API key is set
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
      {isActive && (
        <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2 animate-fade-in-scale">
          {getStatusIndicator()}
          <span className="text-slate-300 text-sm font-medium">{t(`assistant.status.${status}`)}</span>
        </div>
      )}
      <button
        onClick={() => setIsActive(prev => !prev)}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isActive ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}
        title={isActive ? t('assistant.tooltip.deactivate') : t('assistant.tooltip.activate')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
        </svg>
      </button>
    </div>
  );
};

export default ConversationalAssistant;