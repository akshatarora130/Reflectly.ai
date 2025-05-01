"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Edit2,
  Check,
  X,
  Volume2,
  VolumeX,
  AlertCircle,
  User,
  Bot,
  Info,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MessageRole = "USER" | "ASSISTANT";

interface Message {
  id?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
}

// Define speech recognition types inline
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  // @ts-ignore
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  onstart: () => void;
}

// Declare browser-specific speech recognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export default function AICompanion() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageOffset, setMessageOffset] = useState(0);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [voiceActivityLevel, setVoiceActivityLevel] = useState(0);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [alwaysSpeak, setAlwaysSpeak] = useState(false);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [currentResponseText, setCurrentResponseText] = useState("");
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>(
    Array(15).fill(5)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const finalTranscriptRef = useRef("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageLimit = 20;

  // Check if speech recognition is supported
  useEffect(() => {
    const isSupported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setSpeechSupported(isSupported);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch chat session when sessionId changes
  useEffect(() => {
    // @ts-ignore
    if (sessionId && sessionId !== "new-chat" && session?.user?.id) {
      fetchChatSession();
    } else {
      setMessages([]);
      setCurrentSession(null);
    }
    // @ts-ignore
  }, [sessionId, session?.user?.id]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  // Clean up speech recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Handle scroll to load more messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMoreMessages && !isLoadingMessages) {
        // Save current scroll height
        const scrollHeight = container.scrollHeight;

        // Load more messages
        loadMoreMessages().then(() => {
          // Restore scroll position after new messages are loaded
          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight - scrollHeight;
            container.scrollTop = newScrollHeight;
          });
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, isLoadingMessages, sessionId]);

  // Add this useEffect to handle automatic restart if recognition stops unexpectedly
  useEffect(() => {
    // This will monitor if speech recognition stops unexpectedly
    // and restart it if the user is still in listening mode
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isListening) {
        // If the page becomes visible again and we were listening,
        // restart speech recognition
        restartSpeechRecognition();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isListening]);

  // Animate voice waveform
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setVoiceWaveform((prev) => {
          return prev.map(() => {
            // Generate random heights based on voice activity level
            const baseHeight = 5; // Minimum height
            const maxAdditionalHeight = 20; // Maximum additional height
            const randomFactor = Math.random() * voiceActivityLevel;
            return baseHeight + Math.floor(randomFactor * maxAdditionalHeight);
          });
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isListening, voiceActivityLevel]);

  // Gradually decrease voice activity level when not speaking
  useEffect(() => {
    let fadeInterval: NodeJS.Timeout | null = null;

    if (voiceActivityLevel > 0 && !isListening) {
      fadeInterval = setInterval(() => {
        setVoiceActivityLevel((prev) => Math.max(0, prev - 0.1));
      }, 100);
    }

    return () => {
      if (fadeInterval) clearInterval(fadeInterval);
    };
  }, [voiceActivityLevel, isListening]);

  // Focus on input field when transcription is complete
  useEffect(() => {
    if (transcriptionComplete) {
      const inputField = document.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      if (inputField) {
        inputField.focus();
      }
    }
  }, [transcriptionComplete]);

  // Typing animation effect
  useEffect(() => {
    if (isTyping && currentResponseText) {
      if (currentTypingIndex < currentResponseText.length) {
        typingTimerRef.current = setTimeout(() => {
          setTypingText(
            currentResponseText.substring(0, currentTypingIndex + 1)
          );
          setCurrentTypingIndex(currentTypingIndex + 1);
        }, 15); // Adjust speed as needed
      } else {
        setIsTyping(false);
        // Add the complete message to the messages array
        setMessages((prev) => {
          // Check if the last message is already the current response
          const lastMessage = prev[prev.length - 1];
          if (
            lastMessage &&
            lastMessage.role === "ASSISTANT" &&
            lastMessage.content === currentResponseText
          ) {
            return prev;
          }
          return [...prev, { role: "ASSISTANT", content: currentResponseText }];
        });
        setTypingText("");
      }
    }
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [isTyping, currentTypingIndex, currentResponseText]);

  const fetchChatSession = async () => {
    // @ts-ignore
    if (!sessionId || sessionId === "new-chat" || !session?.user?.id) return;

    setError(null);
    try {
      setIsLoadingMessages(true);
      setMessageOffset(0);

      const response = await fetch(
        // @ts-ignore
        `/api/chat-sessions/${sessionId}?limit=${messageLimit}&offset=0&userId=${session.user.id}`
      );

      if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();

      setCurrentSession(data.chatSession);
      setMessages(data.chatSession.messages);
      setTitleInput(data.chatSession.name);
      setHasMoreMessages(data.hasMore);
    } catch (error) {
      console.error("Error fetching chat session:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load chat session"
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadMoreMessages = async () => {
    if (
      !sessionId ||
      sessionId === "new-chat" ||
      isLoadingMessages ||
      !hasMoreMessages ||
      // @ts-ignore
      !session?.user?.id
    )
      return;

    setError(null);
    try {
      setIsLoadingMessages(true);
      const newOffset = messageOffset + messageLimit;

      const response = await fetch(
        // @ts-ignore
        `/api/chat-sessions/${sessionId}?limit=${messageLimit}&offset=${newOffset}&userId=${session.user.id}`
      );

      if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();

      // Prepend older messages
      setMessages((prev) => [...data.chatSession.messages, ...prev]);
      setMessageOffset(newOffset);
      setHasMoreMessages(data.hasMore);

      return data;
    } catch (error) {
      console.error("Error loading more messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load more messages"
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Modified to not automatically send the message
  const startSpeechRecognition = () => {
    // Check if browser supports speech recognition
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Your browser doesn't support speech recognition. Try Chrome or Edge."
      );
      return;
    }

    // Reset state
    finalTranscriptRef.current = "";
    setVoiceActivityLevel(0);
    setTranscriptionComplete(false);

    // Initialize speech recognition
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor();

    // Configure recognition settings
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    let lastSpeechTime = Date.now();
    const silenceThreshold = 2500; // 2.5 seconds of silence before stopping
    let hasReceivedResults = false;
    let isProcessingFinalResult = false;

    recognition.onstart = () => {
      setIsListening(true);
      setInput("Listening...");
      lastSpeechTime = Date.now();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      hasReceivedResults = true;

      // Update the last time speech was detected
      lastSpeechTime = Date.now();

      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Calculate average volume level from results (if available)
      try {
        // This is a non-standard feature that might not be available in all browsers
        const results = event.results as any;
        if (
          results[event.resultIndex] &&
          results[event.resultIndex].isFinal === false
        ) {
          // Set voice activity level based on confidence (rough approximation)
          const confidence = results[event.resultIndex][0].confidence || 0.5;
          setVoiceActivityLevel(Math.min(1, confidence * 1.5));
        }
      } catch (e) {
        // Fallback if volume detection isn't available
        setVoiceActivityLevel(0.7);
      }

      // Process all results, including previous ones to ensure we don't miss anything
      let newFinalTranscript = finalTranscriptRef.current;

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Only add to final transcript if we haven't already processed this result
          // This check helps prevent duplicates
          if (!newFinalTranscript.includes(transcript)) {
            newFinalTranscript += transcript + " ";
          }
        } else if (i >= event.resultIndex) {
          // Only add interim results from the current recognition segment
          interimTranscript += transcript;
        }
      }

      // Update our ref with the new final transcript
      finalTranscriptRef.current = newFinalTranscript;

      // Update the input field with what we've captured so far
      const displayText =
        newFinalTranscript.trim() || interimTranscript.trim() || "Listening...";
      setInput(displayText);

      // Set a new silence timer
      silenceTimerRef.current = setTimeout(() => {
        // If we haven't heard anything for the silence threshold, stop listening
        if (
          Date.now() - lastSpeechTime >= silenceThreshold &&
          recognitionRef.current &&
          !isProcessingFinalResult
        ) {
          isProcessingFinalResult = true;
          recognitionRef.current.stop();
        }
      }, silenceThreshold);
    };

    recognition.onerror = (event: Event) => {
      console.error("Speech recognition error", event);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Don't stop listening on all errors, only on fatal ones
      const error = event as { error?: string };
      if (error.error === "no-speech" || error.error === "audio-capture") {
        setIsListening(false);
        if (input === "Listening...") {
          setInput("");
        }
      }
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      setIsListening(false);
      setProcessingVoice(true);

      // Ensure we have the latest transcript
      const finalTranscript = finalTranscriptRef.current.trim();

      // If we have a transcript, process it
      if (finalTranscript) {
        // Don't set autoSpeak automatically - we'll use alwaysSpeak to determine if we should speak

        // Set the input to the final transcript
        setInput(finalTranscript);

        // Small delay to show the final transcript
        setTimeout(() => {
          setProcessingVoice(false);
          setTranscriptionComplete(true);
          // Focus will be set by the useEffect
        }, 300);
      } else if (hasReceivedResults) {
        // We got some results but no final transcript
        // This can happen when the user speaks but the recognition doesn't finalize
        setInput("Sorry, I couldn't understand that. Please try again.");
        setTimeout(() => {
          setInput("");
          setProcessingVoice(false);
        }, 2000);
      } else {
        // No results at all
        setInput("");
        setProcessingVoice(false);
      }
    };

    // Add a visual indicator that updates while listening
    const updateListeningIndicator = () => {
      if (isListening) {
        if (input === "Listening..." || input.startsWith("Listening.")) {
          const dots = ["Listening.", "Listening..", "Listening..."];
          const currentIndex =
            dots.indexOf(input) >= 0 ? dots.indexOf(input) : 0;
          const nextIndex = (currentIndex + 1) % dots.length;
          setInput(dots[nextIndex]);
        }

        // Only schedule the next update if still listening
        if (isListening) {
          setTimeout(updateListeningIndicator, 500);
        }
      }
    };

    // Start the visual indicator
    setTimeout(updateListeningIndicator, 500);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Add this new function after the stopSpeechRecognition function
  const restartSpeechRecognition = () => {
    // First stop any existing recognition
    stopSpeechRecognition();

    // Wait a short time to ensure it's fully stopped
    setTimeout(() => {
      // Then start a new recognition session
      startSpeechRecognition();
    }, 300);
  };

  // Modify the speakText function to make it more reliable
  const speakText = (text: string) => {
    // Stop any ongoing speech
    stopSpeech();

    // Check if browser supports speech synthesis
    if (!("speechSynthesis" in window)) {
      setError(
        "Your browser doesn't support text to speech. Try Chrome or Edge."
      );
      return;
    }

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set properties
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Don't reset autoSpeak if alwaysSpeak is enabled
      if (!alwaysSpeak) {
        setAutoSpeak(false);
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);

      // @ts-ignore
      if (event.error !== "interrupted" && !utterance.hasRetried) {
        console.log("Retrying speech synthesis...");
        // @ts-ignore
        utterance.hasRetried = true;
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
      } else if (!alwaysSpeak) {
        setAutoSpeak(false);
      }
    };

    // Store reference to current utterance
    speechSynthesisRef.current = utterance;

    // Start speaking
    try {
      window.speechSynthesis.speak(utterance);

      // Some browsers have a bug where speech doesn't start
      // This timeout checks if speaking started and retries if not
      setTimeout(() => {
        if (speechSynthesisRef.current === utterance && !isSpeaking) {
          console.log("Speech didn't start, retrying...");
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }, 250);
    } catch (e) {
      console.error("Error starting speech synthesis:", e);
      setError("Failed to start text-to-speech. Please try again.");
    }
  };

  const stopSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAutoSpeak(false);
    }
  };

  const handleUpdateTitle = async () => {
    // @ts-ignore
    if (!currentSession || !titleInput.trim() || !session?.user?.id) return;

    setError(null);
    try {
      const response = await fetch(`/api/chat-sessions/${currentSession.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: titleInput,
          // @ts-ignore
          userId: session.user.id,
        }),
      });

      if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const updatedSession = await response.json();
      setCurrentSession({
        ...currentSession,
        name: updatedSession.name,
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating chat title:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update chat title"
      );
    }
  };

  const handleConversationStarter = (message: string) => {
    if (!message.trim()) return;

    setInput(message);
    // Use setTimeout to ensure the input value is set before sending
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSendMessage = async () => {
    if (
      !input.trim() ||
      // @ts-ignore
      !session?.user?.id ||
      input === "Listening..." ||
      input.startsWith("Listening.") ||
      isListening ||
      processingVoice ||
      isLoading
    )
      return;

    setError(null);
    const messageText = input.trim();
    const userMessage: Message = { role: "USER", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setTranscriptionComplete(false);

    try {
      const fullChatHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: sessionId || "new-chat",
          // @ts-ignore
          userId: session.user.id,
          chatHistory: fullChatHistory,
        }),
      });

      if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        // Start typing animation
        setCurrentResponseText(data.messages[0]);
        setCurrentTypingIndex(0);
        setTypingText("");
        setIsTyping(true);

        // Auto-speak the response if the input was from voice or alwaysSpeak is enabled
        if (alwaysSpeak) {
          // Small delay to ensure everything is ready
          setTimeout(() => {
            speakText(data.messages[0]);
          }, 300);
        }
      }

      // If this was a new chat, update the URL with the new session ID
      if (!sessionId || sessionId === "new-chat") {
        router.push(`/dashboard/ai-companion?sessionId=${data.sessionId}`);

        // Fetch the session to get the title
        const sessionResponse = await fetch(
          // @ts-ignore
          `/api/chat-sessions/${data.sessionId}?userId=${session.user.id}`
        );
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setCurrentSession(sessionData.chatSession);
          setTitleInput(sessionData.chatSession.name);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
      // Remove the optimistically added message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#014D4E]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isEditingTitle ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="text-xl font-bold text-[#014D4E] border-b border-[#014D4E] bg-transparent focus:outline-none"
                  autoFocus
                />
                <motion.button
                  onClick={handleUpdateTitle}
                  className="ml-2 p-1 rounded-full hover:bg-[#f5d4b0]"
                  title="Save"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check size={16} />
                </motion.button>
                <motion.button
                  onClick={() => {
                    setIsEditingTitle(false);
                    setTitleInput(currentSession?.name || "Sage");
                  }}
                  className="ml-1 p-1 rounded-full hover:bg-[#f5d4b0]"
                  title="Cancel"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            ) : (
              <h1 className="text-xl font-bold text-[#014D4E] flex items-center">
                {currentSession?.name || "New Conversation"}
                {currentSession && (
                  <motion.button
                    onClick={() => setIsEditingTitle(true)}
                    className="ml-2 p-1 rounded-full hover:bg-[#f5d4b0]"
                    title="Edit title"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 size={16} />
                  </motion.button>
                )}
              </h1>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              title="Conversation Information"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mx-6 mt-4 relative"
          >
            <span className="block sm:inline">{error}</span>
            <motion.button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-white to-gray-50"
      >
        {isLoadingMessages && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-[#014D4E]" />
            </motion.div>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col items-center justify-center text-gray-500 max-w-xl mx-auto px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              <Bot className="h-16 w-16 text-[#014D4E] mb-4 opacity-70" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="h-6 w-6 text-[#014D4E]" />
              </motion.div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-xl font-semibold text-[#014D4E] mb-2"
            >
              Welcome to Sage
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-6 text-center max-w-md"
            >
              Your personal AI assistant for mental health support. Choose a
              topic below or ask anything.
            </motion.p>

            {/* Conversation starter options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg"
            >
              {[
                {
                  title: "Feeling anxious",
                  description:
                    "I've been feeling anxious lately. What are some techniques to manage anxiety?",
                  icon: "🧠",
                },
                {
                  title: "Improving sleep",
                  description:
                    "I'm having trouble sleeping. Can you suggest some strategies for better sleep?",
                  icon: "💤",
                },
                {
                  title: "Managing stress",
                  description:
                    "What are some effective ways to manage daily stress?",
                  icon: "🍃",
                },
                {
                  title: "Mindfulness practices",
                  description:
                    "Can you guide me through a simple mindfulness exercise?",
                  icon: "🧘",
                },
                {
                  title: "Low mood",
                  description:
                    "I've been feeling down lately. What might help improve my mood?",
                  icon: "🌤️",
                },
                {
                  title: "Self-care ideas",
                  description:
                    "I need some self-care suggestions for my mental wellbeing.",
                  icon: "❤️",
                },
              ].map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setInput(option.description);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="flex items-center p-4 bg-white border border-[#FFE4C4] rounded-lg shadow-sm hover:shadow-md hover:border-[#014D4E]/30 transition-all text-left group"
                  whileHover={{ scale: 1.02, backgroundColor: "#FFFAF0" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.5 + index * 0.1, duration: 0.3 },
                  }}
                >
                  <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </span>
                  <div>
                    <h3 className="font-medium text-[#014D4E] group-hover:text-[#013638] transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {option.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {!speechSupported && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex items-center text-amber-600 text-sm bg-amber-50 p-3 rounded-md max-w-md mt-6"
              >
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span>
                  Voice input is not supported in this browser. Try Chrome or
                  Edge for the full experience.
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {isLoadingMessages && hasMoreMessages && (
              <div className="flex justify-center p-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Loader2 size={20} className="text-[#014D4E]" />
                </motion.div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`flex ${
                    msg.role === "USER" ? "justify-end" : "justify-start"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`flex items-start max-w-[80%] ${
                      msg.role === "USER" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        msg.role === "USER"
                          ? "bg-[#014D4E] ml-3"
                          : "bg-[#FFE4C4] mr-3"
                      }`}
                    >
                      {msg.role === "USER" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-[#014D4E]" />
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        delay: 0.1,
                      }}
                      className={`rounded-2xl p-4 ${
                        msg.role === "USER"
                          ? "bg-[#014D4E] text-white rounded-tr-none shadow-md"
                          : "bg-[#FFE4C4] text-[#014D4E] rounded-tl-none shadow-md"
                      }`}
                      style={{
                        boxShadow:
                          msg.role === "USER"
                            ? "0 4px 6px rgba(1, 77, 78, 0.1), 0 1px 3px rgba(1, 77, 78, 0.08)"
                            : "0 4px 6px rgba(255, 228, 196, 0.1), 0 1px 3px rgba(255, 228, 196, 0.08)",
                      }}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === "ASSISTANT" && (
                        <div className="mt-2 flex justify-end">
                          {isSpeaking && index === messages.length - 1 ? (
                            <motion.button
                              onClick={stopSpeech}
                              className="text-[#014D4E] opacity-70 hover:opacity-100 p-1 rounded-full"
                              title="Stop speaking"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <VolumeX size={16} />
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => {
                                speakText(msg.content);
                                setAutoSpeak(false); // Manual click, don't auto-speak next response
                              }}
                              className="text-[#014D4E] opacity-70 hover:opacity-100 p-1 rounded-full"
                              title="Read aloud"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Volume2 size={16} />
                            </motion.button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing animation */}
            {isTyping && typingText && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FFE4C4] mr-3 flex items-center justify-center"
                  >
                    <Bot className="h-5 w-5 text-[#014D4E]" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: 0.1,
                    }}
                    className="bg-[#FFE4C4] text-[#014D4E] rounded-2xl rounded-tl-none p-4 shadow-md"
                    style={{
                      boxShadow:
                        "0 4px 6px rgba(255, 228, 196, 0.1), 0 1px 3px rgba(255, 228, 196, 0.08)",
                    }}
                  >
                    <div className="whitespace-pre-wrap">
                      {typingText}
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className="inline-block w-2 h-4 bg-[#014D4E] ml-1"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {isLoading && !isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FFE4C4] mr-3 flex items-center justify-center"
                  >
                    <Bot className="h-5 w-5 text-[#014D4E]" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: 0.1,
                    }}
                    className="bg-[#FFE4C4] text-[#014D4E] rounded-2xl rounded-tl-none p-4 shadow-md"
                    style={{
                      boxShadow:
                        "0 4px 6px rgba(255, 228, 196, 0.1), 0 1px 3px rgba(255, 228, 196, 0.08)",
                    }}
                  >
                    <div className="flex space-x-2">
                      <motion.div
                        className="w-2 h-2 bg-[#014D4E] rounded-full"
                        animate={{ scale: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#014D4E] rounded-full"
                        animate={{ scale: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#014D4E] rounded-full"
                        animate={{ scale: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <motion.button
              onClick={
                isListening ? stopSpeechRecognition : startSpeechRecognition
              }
              disabled={!speechSupported || isLoading || processingVoice}
              className={`p-3 rounded-full relative ${
                isListening
                  ? "bg-red-500 text-white"
                  : processingVoice
                  ? "bg-amber-500 text-white"
                  : "bg-[#FFE4C4] text-[#014D4E]"
              } ${
                !speechSupported || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-opacity-80 transition-colors"
              }`}
              title={
                !speechSupported
                  ? "Speech recognition not supported"
                  : isListening
                  ? "Stop listening"
                  : processingVoice
                  ? "Processing voice..."
                  : "Start listening"
              }
              whileHover={
                !(!speechSupported || isLoading) ? { scale: 1.05 } : {}
              }
              whileTap={!(!speechSupported || isLoading) ? { scale: 0.95 } : {}}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </motion.button>

            {/* Voice activity visualization */}
            {isListening && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-end h-10 space-x-[2px] bg-white/80 rounded-lg p-1 shadow-md">
                {voiceWaveform.map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] bg-red-500"
                    initial={{ height: 5 }}
                    animate={{ height }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            )}

            {/* Voice activity indicator */}
            {isListening && (
              <motion.div
                className="absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full border-4 border-transparent"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              </motion.div>
            )}
          </div>

          <div className="relative flex-1">
            <motion.input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setAutoSpeak(false); // Reset auto-speak when typing
                setTranscriptionComplete(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isListening || processingVoice}
              placeholder="Type your message..."
              className={`w-full border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent transition-all ${
                isListening ? "bg-gray-100" : ""
              } ${processingVoice ? "bg-amber-50" : ""} ${
                transcriptionComplete ? "bg-green-50 border-green-300" : ""
              }`}
              initial={{ scale: 1 }}
              animate={transcriptionComplete ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5 }}
            />

            {/* Processing indicator */}
            {processingVoice && (
              <motion.div
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 size={16} className="text-amber-500" />
              </motion.div>
            )}
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={
              !input.trim() ||
              isLoading ||
              input === "Listening..." ||
              // @ts-ignore
              !session?.user?.id ||
              isListening ||
              processingVoice ||
              input.startsWith("Listening.")
            }
            className={`bg-[#014D4E] text-white p-3 rounded-full hover:bg-[#013638] disabled:opacity-50 transition-colors ${
              transcriptionComplete ? "animate-pulse" : ""
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 1 }}
            animate={
              input.trim() &&
              !isLoading &&
              !isListening &&
              !processingVoice &&
              !input.startsWith("Listening.")
                ? { scale: [1, 1.05, 1] }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="h-5 w-5" />
              </motion.div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Voice Status and Settings */}
        <div className="mt-3 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-center text-gray-500"
              >
                Listening... speak clearly and I'll convert your speech to text
              </motion.div>
            )}
            {processingVoice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-center text-amber-600"
              >
                Processing your voice message...
              </motion.div>
            )}
            {transcriptionComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-center text-green-600"
              >
                Voice transcribed! Review and press Enter or click Send to
                continue.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always speak toggle */}
          <div className="mt-2 flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={alwaysSpeak}
                  onChange={() => setAlwaysSpeak(!alwaysSpeak)}
                />
                <motion.div
                  className={`block w-10 h-6 rounded-full ${
                    alwaysSpeak ? "bg-[#014D4E]" : "bg-gray-300"
                  }`}
                  animate={{
                    backgroundColor: alwaysSpeak ? "#014D4E" : "#D1D5DB",
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full"
                  animate={{ x: alwaysSpeak ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
              <div className="ml-3 text-sm text-gray-600">
                Always read responses aloud
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
