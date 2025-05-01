"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, MicOff, Send, Loader2, Edit2, Check, X } from "lucide-react";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messageLimit = 20;

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
  }, [messages]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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

  const handleSendMessage = async () => {
    // @ts-ignore
    if (!input.trim() || !session?.user?.id) return;

    setError(null);
    const userMessage: Message = { role: "USER", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId || "new-chat",
          // @ts-ignore
          userId: session.user.id,
          chatHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
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
        const assistantMessage: Message = {
          role: "ASSISTANT",
          content: data.messages[0],
        };
        setMessages((prev) => [...prev, assistantMessage]);
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

  const startSpeechRecognition = () => {
    // Check if browser supports speech recognition
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "Your browser doesn't support speech recognition. Try Chrome or Edge."
      );
      return;
    }

    // Initialize speech recognition
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      finalTranscript = "";
      setInput("Listening...");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInput(finalTranscript || interimTranscript || "Listening...");
    };

    recognition.onerror = (event: Event) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
      if (input === "Listening...") {
        setInput("");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (input === "Listening...") {
        setInput("");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        {isEditingTitle ? (
          <div className="flex items-center">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="text-xl font-bold text-[#014D4E] border-b border-[#014D4E] bg-transparent focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleUpdateTitle}
              className="ml-2 p-1 rounded-full hover:bg-[#f5d4b0]"
              title="Save"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => {
                setIsEditingTitle(false);
                setTitleInput(currentSession?.name || "AI Companion");
              }}
              className="ml-1 p-1 rounded-full hover:bg-[#f5d4b0]"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <h1 className="text-3xl font-bold text-[#014D4E] flex items-center">
            {currentSession?.name || "AI Companion"}
            {currentSession && (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="ml-2 p-1 rounded-full hover:bg-[#f5d4b0]"
                title="Edit title"
              >
                <Edit2 size={16} />
              </button>
            )}
          </h1>
        )}
        <button
          onClick={() =>
            router.push("/dashboard/ai-companion?sessionId=new-chat")
          }
          className="bg-[#014D4E] text-white px-4 py-2 rounded-md hover:bg-[#013638]"
        >
          New Chat
        </button>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4"
      >
        {isLoadingMessages && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#014D4E]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Start a conversation with your AI companion
          </div>
        ) : (
          <div className="space-y-4">
            {isLoadingMessages && hasMoreMessages && (
              <div className="flex justify-center p-2">
                <Loader2 size={20} className="animate-spin text-[#014D4E]" />
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.role === "USER"
                      ? "bg-[#014D4E] text-white"
                      : "bg-[#FFE4C4] text-[#014D4E]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#FFE4C4] text-[#014D4E] max-w-[70%] rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#014D4E] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#014D4E] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#014D4E] rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
          className={`p-2 rounded-full ${
            isListening
              ? "bg-red-500 text-white"
              : "bg-[#FFE4C4] text-[#014D4E]"
          }`}
          title={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#014D4E]"
        />

        <button
          onClick={handleSendMessage}
          disabled={
            !input.trim() ||
            isLoading ||
            input === "Listening..." ||
            // @ts-ignore
            !session?.user?.id
          }
          className="bg-[#014D4E] text-white p-2 rounded-md hover:bg-[#013638] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Send className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
}
