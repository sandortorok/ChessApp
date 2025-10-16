import { useState, useEffect, useRef } from "react";
import { ref, push, onValue, off } from "firebase/database";
import { db } from "../firebase/config";

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
}

interface ChatBoxProps {
    gameId: string;
    currentUserId: string;
    currentUserName: string;
}

export default function ChatBox({ gameId, currentUserId, currentUserName }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Üzenetek betöltése
    useEffect(() => {
        if (!gameId) return;

        const messagesRef = ref(db, `games/${gameId}/chat`);
        
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList: Message[] = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                // Időbélyeg szerint rendezés
                messageList.sort((a, b) => a.timestamp - b.timestamp);
                setMessages(messageList);
            } else {
                setMessages([]);
            }
        });

        return () => off(messagesRef);
    }, [gameId]);

    // Auto-scroll az új üzenetekhez - csak a chat konténeren belül
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!inputText.trim() || !gameId) return;

        const messagesRef = ref(db, `games/${gameId}/chat`);
        
        try {
            await push(messagesRef, {
                senderId: currentUserId,
                senderName: currentUserName,
                text: inputText.trim(),
                timestamp: Date.now(),
            });
            
            setInputText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const isMyMessage = (message: Message) => message.senderId === currentUserId;

    return (
        <div className="backdrop-blur-xl bg-gray-900/40 rounded-xl border border-teal-500/30 overflow-hidden flex flex-col h-full w-full max-w-full min-w-[400px] shrink-0">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-900/60 border-b border-teal-500/30 flex-shrink-0 min-w-0">
                <div className="flex items-center gap-2 text-teal-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-semibold">Csevegés</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1.5 min-h-0 w-full">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-4">
                        Még nincsenek üzenetek. Kezdj el beszélgetni!
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-md px-2 py-1 break-all ${
                                    isMyMessage(message)
                                        ? "bg-teal-600/30 border border-teal-500/40 text-teal-100"
                                        : "bg-slate-700/50 border border-slate-600/40 text-slate-200"
                                }`}
                            >
                                <div className="text-[10px] opacity-70 mb-0.5">
                                    {isMyMessage(message) ? "Te" : message.senderName}
                                </div>
                                <div className="text-xs break-words">{message.text}</div>
                                <div className="text-[10px] opacity-50 mt-0.5 text-right">
                                    {new Date(message.timestamp).toLocaleTimeString("hu-HU", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-2 bg-gray-900/60 border-t border-teal-500/30 flex-shrink-0 min-w-0">
                <div className="flex gap-1.5 w-full">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Írj üzenetet..."
                        className="flex-1 min-w-0 bg-slate-800/50 text-slate-200 placeholder-slate-500 px-2 py-1.5 rounded-lg border border-slate-600/40 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs transition-all"
                        maxLength={200}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="px-3 py-1.5 bg-teal-600/30 hover:bg-teal-600/50 disabled:bg-slate-700/30 disabled:cursor-not-allowed text-teal-300 hover:text-teal-200 disabled:text-slate-500 font-semibold rounded-lg border border-teal-600/30 hover:border-teal-500/50 disabled:border-slate-600/30 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
