import React, { useState, useEffect } from 'react';
import ToneSelector from './components/ToneSelector';
import { Tone, ChatState } from './types';
import { streamEmojiEnhancement } from './services/geminiService';

const CHAR_LIMIT = 700;

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Auth State (Bring Your Own Key)
  const [isKeySelected, setIsKeySelected] = useState<boolean>(false);

  // App Logic State
  const [state, setState] = useState<ChatState>({
    inputText: '',
    outputText: '',
    isLoading: false,
    selectedTone: Tone.General,
    error: null,
  });

  // Check if key is already selected on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setIsKeySelected(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      }
    };
    checkKey();
  }, []);

  // Validation Logic
  const charCount = state.inputText.length;
  const isOverCharLimit = charCount > CHAR_LIMIT;
  const isInputInvalid = isOverCharLimit;

  // Toggle Dark Mode
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Returns true if connection was successful
  const handleConnectGoogle = async (): Promise<boolean> => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Re-verify strictly after modal closes to ensure success
        if (await window.aistudio.hasSelectedApiKey()) {
            setIsKeySelected(true);
            setState(prev => ({ ...prev, error: null }));
            return true;
        }
      }
    } catch (e) {
      console.error("Selection failed", e);
      setState(prev => ({ ...prev, error: "Connection cancelled or failed." }));
    }
    return false;
  };

  const handleChangeKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        if (await window.aistudio.hasSelectedApiKey()) {
            setIsKeySelected(true);
            setState(prev => ({ ...prev, error: null }));
        }
      }
    } catch (e) {
      console.error("Change key failed", e);
    }
  };

  const handleSignOut = () => {
     // Since we can't truly "logout" the Google session via SDK without page refresh logic or clearing storage
     // We simply reset the UI state to mimic a logout for the user experience.
     // In a real BYOK scenario, the token persists in the Google Context, but hiding it is enough for UX.
     setIsKeySelected(false);
     setState(prev => ({ ...prev, inputText: '', outputText: '' }));
  };

  const handleToneSelect = (tone: Tone) => {
    setState(prev => ({ ...prev, selectedTone: tone }));
  };

  const handleAction = async () => {
    // If not connected, connect first
    if (!isKeySelected) {
      const connected = await handleConnectGoogle();
      // If connection failed or was cancelled, stop here
      if (!connected) return;
      
      // If connected successfully, we fall through to the generation logic immediately below!
    }

    // If input is empty or invalid, do nothing
    if (!state.inputText.trim() || isInputInvalid) return;

    setState(prev => ({ ...prev, isLoading: true, outputText: '', error: null }));

    try {
      await streamEmojiEnhancement(
        state.inputText,
        state.selectedTone,
        (chunk) => {
          setState(prev => ({ ...prev, outputText: prev.outputText + chunk }));
        }
      );
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (err: any) {
      // If the error suggests an invalid key (entity not found), prompt to re-select
      // Map technical errors to user-friendly "Sign in" language
      if (err.message?.includes("API Key Error") || err.message?.includes("entity was not found")) {
        setIsKeySelected(false);
        setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: "Session expired. Please sign in again." 
          }));
      } else {
        setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: err.message || "Something went wrong." 
          }));
      }
    }
  };

  const copyToClipboard = () => {
    if (state.outputText) {
      navigator.clipboard.writeText(state.outputText);
    }
  };

  const getWarningMessage = () => {
    if (isOverCharLimit) return `Character limit exceeded (${charCount}/${CHAR_LIMIT}). Please shorten your text.`;
    return null;
  };

  const warningMsg = getWarningMessage();

  // --------------------------------------------------------------------------
  // RENDER: MAIN DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg font-sans selection:bg-primary/30 text-slate-900 dark:text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        {isKeySelected ? (
            <div className="flex items-center gap-2">
                <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all shadow-sm"
                title="Sign Out"
                >
                Sign Out
                </button>
            </div>
        ) : (
            <button
            onClick={handleConnectGoogle}
            className="px-4 py-2 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all shadow-sm flex items-center gap-2"
            title="Sign in with Google"
            >
            <i className="fa-brands fa-google text-sm"></i>
            Sign in
            </button>
        )}

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm text-yellow-500"
          title="Toggle Theme"
        >
          {isDarkMode ? <i className="fa-solid fa-sun text-lg"></i> : <i className="fa-solid fa-moon text-lg text-slate-700"></i>}
        </button>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-3xl space-y-10">
        
        {/* Header Section */}
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 mb-6 shadow-lg shadow-primary/20">
            <i className="fa-solid fa-wand-magic-sparkles text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-purple-400">
            Automatically Add Emojis to Your Text
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Perfect emojis to match your mood and message. Type or paste your text here!
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Tone Selection */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <ToneSelector 
              selectedTone={state.selectedTone} 
              onSelectTone={handleToneSelect}
              disabled={state.isLoading}
            />
          </section>

          {/* 2. Input Area */}
          <section className="animate-fade-in-up bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none transition-shadow hover:shadow-2xl hover:shadow-primary/5" style={{ animationDelay: '0.2s' }}>
            <div className="relative p-2">
              <textarea
                value={state.inputText}
                onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
                placeholder="Type your text here..."
                className={`
                  w-full min-h-[160px] bg-transparent p-6 text-lg outline-none resize-none 
                  text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl
                  ${isInputInvalid ? 'text-red-500 dark:text-red-400' : ''}
                `}
                disabled={state.isLoading}
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                  {state.inputText && !state.isLoading && (
                    <button 
                    onClick={() => setState(prev => ({...prev, inputText: ''}))}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Clear"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
              </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700/50 p-4 bg-gray-50/50 dark:bg-black/20 rounded-b-3xl flex flex-col sm:flex-row gap-4 justify-between items-center">
              
              {/* Validation Feedback */}
              <div className="flex-1 text-center sm:text-left">
                {warningMsg ? (
                  <div className="text-xs font-bold text-red-500 animate-pulse flex items-center justify-center sm:justify-start gap-1">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {warningMsg}
                  </div>
                ) : (
                  <div className="text-xs font-medium text-gray-400 ml-2">
                    {charCount} / {CHAR_LIMIT} characters
                  </div>
                )}
              </div>

              {/* ACTION BUTTON - DYNAMIC */}
              <button
                onClick={handleAction}
                disabled={state.isLoading || isInputInvalid || (isKeySelected && !state.inputText.trim())}
                className={`
                  w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95
                  ${state.isLoading || isInputInvalid || (isKeySelected && !state.inputText.trim())
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' 
                    : isKeySelected 
                        ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/30 hover:shadow-primary/50' // Generate Style
                        : 'bg-[#4285F4] hover:bg-[#357ABD] text-white shadow-lg shadow-blue-500/30 border-transparent' // Connect Style (Google Blue)
                  }
                `}
              >
                {state.isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Enhancing...
                  </>
                ) : !isKeySelected ? (
                    <>
                        <i className="fa-brands fa-google text-white"></i>
                        Sign in with Google
                    </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Generate
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 3. Output Area */}
          {(state.outputText || state.isLoading) && (
            <section className="animate-fade-in-up transition-all duration-500 ease-in-out" style={{ animationDelay: '0.3s' }}>
                <div className="flex justify-between items-end mb-3 px-2">
                <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Result
                </label>
                {state.outputText && !state.isLoading && (
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs font-bold text-primary hover:text-primary-light flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <i className="fa-regular fa-copy"></i> Copy Text
                  </button>
                )}
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-3xl opacity-20 dark:opacity-30 blur transition duration-1000 group-hover:opacity-40"></div>
                  <div className="relative bg-white dark:bg-dark-card rounded-3xl p-8 min-h-[120px] border border-gray-200 dark:border-gray-700 flex flex-col justify-center shadow-xl">
                    
                    {state.outputText ? (
                      <p className="text-xl leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-100 font-medium break-words">
                        {state.outputText}
                        {state.isLoading && <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse align-middle rounded-full"></span>}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 py-4 text-gray-400">
                          <div className="flex space-x-1.5">
                            <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm font-medium animate-pulse">Thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
            </section>
          )}

          {/* Error Message */}
          {state.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 animate-pulse">
              <i className="fa-solid fa-circle-exclamation text-xl"></i>
              <span className="font-medium">{state.error}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;