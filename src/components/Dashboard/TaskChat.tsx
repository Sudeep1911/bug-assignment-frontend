'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Send, Paperclip } from 'lucide-react';
import Image from 'next/image';
import { useUserAtom } from '@/store/atoms';
import { ChatAttachment, ChatMessage, TaskChatProps } from '@/types/tasks.types';
import io from 'socket.io-client'; // Import the socket.io-client library

// Define the Socket.IO server URL
const SOCKET_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:3000';

export default function TaskChat({ isOpen, onClose, availableEmployees, chatId, showClose = true }: TaskChatProps) {
  const { currentUser } = useUserAtom();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [dynamicHeight, setDynamicHeight] = useState<number>(320);

  // Custom hook to handle autosizing the textarea
  const textareaRef = useAutosizeTextarea(input);

  // Use a ref to hold the socket connection
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    // Only connect if the chat is open and a chatId is available
    if (isOpen && chatId && !socketRef.current) {
      setIsLoading(true);
      const socket = io(SOCKET_URL);
      socketRef.current = socket;

      // Event listener for initial messages
      socket.on('messages', (msgs: ChatMessage[]) => {
        setMessages(msgs);
        setIsLoading(false);
      });

      // Event listener for new incoming messages
      socket.on('message', (msg: ChatMessage) => {
        setMessages((prev) => [...prev, { ...msg, status: 'sent' }]);
      });

      // Request to join the specific chat room for this task
      socket.emit('joinTaskChat', { chatId });

      // Clean up the socket connection when the component unmounts or chatId changes
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isOpen, chatId]);

  // Function to send a message via WebSocket
  const sendMessage = async (attachments?: ChatAttachment[]) => {
    const messageToSend = input.trim();
    const socket = socketRef.current;
    if ((!messageToSend && !attachments?.length) || !currentUser || !chatId || !socket) {
      return;
    }

    const optimisticId = crypto.randomUUID();
    const optimisticMessage: ChatMessage = {
      _id: optimisticId,
      userId: currentUser._id,
      text: messageToSend,
      createdAt: Date.now(),
      attachments,
      status: 'sending', // Optimistic status
    };

    // Optimistically update the UI
    setInput('');

    // Emit the message to the server via WebSocket
    socket.emit(
      'sendMessage',
      {
        chatId,
        text: messageToSend,
        userId: currentUser._id,
        attachments,
      },
      (sentMessage: ChatMessage) => {
        // This callback is for confirmation from the server
        if (sentMessage) {
          // Find the optimistic message by its temporary ID and replace it with the server's version
          setMessages((prev) =>
            prev.map((msg) => (msg._id === optimisticId ? { ...sentMessage, status: 'sent' } : msg)),
          );
        } else {
          // Revert the optimistic update if sending fails
          setMessages((prev) => prev.map((msg) => (msg._id === optimisticId ? { ...msg, status: 'failed' } : msg)));
        }
      },
    );
  };

  // Auto-scroll bottom
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const attachments: ChatAttachment[] = [];
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) return; // ignore other types
      attachments.push({
        id: crypto.randomUUID(),
        type: isImage ? 'image' : 'video',
        url: URL.createObjectURL(file),
        name: file.name,
      });
    });
    if (attachments.length) sendMessage(attachments);
  };

  const getUserMeta = (id: string) => {
    if (currentUser && currentUser._id === id) return currentUser;
    return availableEmployees.find((e) => e._id === id);
  };

  // Dynamic responsive height
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const h = Math.min(Math.max(vh * 0.34, 240), vh * 0.55);
      setDynamicHeight(h);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="w-full bg-black/80 border border-white/10 rounded-2xl shadow-inner overflow-hidden flex flex-col backdrop-blur-sm"
      style={{ height: dynamicHeight }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/70">
        <h3 className="text-sm font-medium text-slate-200 tracking-wide">Team Chat</h3>
        {showClose && (
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10" aria-label="Close chat">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
      <div className="overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-500 text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-500 text-center">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((m) => {
            const user = getUserMeta(m.userId);
            const mine = currentUser?._id === m.userId;
            const isFailed = m.status === 'failed'; // Check for failed status

            return (
              <div key={m._id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed border w-fit max-w-[85%] break-words ${mine ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent' : 'bg-slate-800 text-slate-100 border-slate-700'} ${isFailed ? 'border-red-500' : ''}`} // Add red border for failed messages
                >
                  <div className={`text-[9px] mb-1 ${mine ? 'text-white/80' : 'text-slate-400'}`}>
                    {user?.name || user?.email || 'Unknown'}{' '}
                    {user?.role && <span className="text-slate-500">({user.role})</span>} -{' '}
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  {isFailed && <div className="text-[10px] text-red-400 mt-1">Failed to send. Click to retry.</div>}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-white/10 bg-black/70">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none leading-snug"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white disabled:from-white/10 disabled:to-white/10 disabled:text-slate-400 disabled:cursor-not-allowed hover:from-purple-600 hover:to-cyan-600 transition"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-500 leading-snug">
          Enter = send · Shift+Enter = newline · Files: image / video.
        </p>
      </div>
    </div>
  );
}

// Custom hook to automatically adjust textarea height
const useAutosizeTextarea = (value: string) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return textareaRef;
};
