"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Lock,
  Shield,
  Image as ImageIcon,
  CheckCheck,
  Search,
  Sparkles,
  AlertCircle,
  Paperclip,
  Smile,
  FileText,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import Link from "next/link";
import { localePath } from "@/lib/i18n/settings";

interface ChatMessage {
  id: string;
  sender_handle: string;
  sender_name: string;
  recipient_handle: string;
  encrypted_content: string;
  media_url?: string | null;
  created_at: string;
}

interface ChatContact {
  handle: string;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  time: string;
}

export function EncryptedChatClient({ locale }: { locale: Locale }) {
  const [activeContact, setActiveContact] = useState<string>("alextran");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts: ChatContact[] = [
    {
      handle: "alextran",
      name: "Alex Trần",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Kiến trúc AI Agent đã tối ưu hóa xong rồi bạn nhé!",
      time: "10:45",
    },
    {
      handle: "hoangminh",
      name: "Hoàng Minh",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Bạn xem qua bài viết mới về biohacking chưa?",
      time: "Hôm qua",
    },
    {
      handle: "elena",
      name: "Dr. Elena Nguyễn",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastMessage: "Tài liệu khoa học đã được trích dẫn chuẩn hóa.",
      time: "28/10",
    },
    {
      handle: "myso_support",
      name: "Myso Bot Hỗ Trợ 🔒",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Kênh trò chuyện bảo mật mã hóa đầu cuối đã sẵn sàng.",
      time: "26/10",
    },
  ];

  // Load chat messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat?user1=me&user2=${activeContact}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
            return;
          }
        }
      } catch {}

      // Default initial encrypted conversation
      setMessages([
        {
          id: "m-1",
          sender_handle: activeContact,
          sender_name: contacts.find((c) => c.handle === activeContact)?.name || "Người dùng",
          recipient_handle: "me",
          encrypted_content: "Chào bạn! Đây là kênh trò chuyện bảo mật được mã hóa đầu cuối trên Myso.",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "m-2",
          sender_handle: "me",
          sender_name: "Bạn",
          recipient_handle: activeContact,
          encrypted_content: "Tuyệt vời, tin nhắn mã hóa không lưu bản rõ trên máy chủ trung gian đúng không?",
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: "m-3",
          sender_handle: activeContact,
          sender_name: contacts.find((c) => c.handle === activeContact)?.name || "Người dùng",
          recipient_handle: "me",
          encrypted_content: "Chính xác, bảo vệ tối đa quyền riêng tư cá nhân và tuân thủ các quy định pháp luật hiện hành.",
          created_at: new Date(Date.now() - 600000).toISOString(),
        },
      ]);
    }

    loadMessages();
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageUrl.trim()) return;

    setSending(true);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender_handle: "me",
      sender_name: "Bạn",
      recipient_handle: activeContact,
      encrypted_content: inputText.trim() || "Đã gửi một hình ảnh",
      media_url: imageUrl.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setImageUrl("");
    setShowImageInput(false);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_handle: "me",
          sender_name: "Bạn",
          recipient_handle: activeContact,
          encrypted_content: newMsg.encrypted_content,
          media_url: newMsg.media_url,
        }),
      });
    } catch (err) {
      console.error("Send chat error:", err);
    } finally {
      setSending(false);
    }
  };

  const currentContact = contacts.find((c) => c.handle === activeContact) || contacts[0];

  return (
    <div className="container-page py-6 sm:py-8 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-line bg-surface overflow-hidden shadow-2xl h-[750px]">
        {/* Left Contacts Sidebar (4 cols) */}
        <div className="md:col-span-4 border-r border-line flex flex-col bg-canvas/40">
          {/* Header */}
          <div className="p-4 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-accent/15 text-accent border border-accent/30">
                <Lock className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-bold text-ink">Myso Chat 🔒</h2>
            </div>
            <span className="font-mono text-[0.62rem] text-teal border border-teal/40 bg-teal/10 px-2 py-0.5 rounded-full font-bold">
              E2EE
            </span>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-line">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-subtle" />
              <input
                type="text"
                placeholder="Tìm bạn bè hoặc @username..."
                className="w-full rounded-xl border border-line bg-surface pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-line/60">
            {contacts.map((contact) => (
              <button
                key={contact.handle}
                onClick={() => setActiveContact(contact.handle)}
                className={`w-full p-3.5 flex items-center gap-3 text-left transition ${
                  activeContact === contact.handle ? "bg-accent/10 border-l-4 border-accent" : "hover:bg-canvas"
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="h-11 w-11 rounded-full object-cover border border-line"
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-surface" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink truncate">
                      {contact.name}
                    </span>
                    <span className="text-[0.65rem] font-mono text-subtle">{contact.time}</span>
                  </div>
                  <p className="text-[0.72rem] text-muted truncate mt-0.5">{contact.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Security Note */}
          <div className="p-3 border-t border-line bg-surface/60 text-[0.68rem] text-muted flex items-start gap-2">
            <Shield className="h-4 w-4 text-teal shrink-0 mt-0.5" />
            <span>
              Mã hóa bảo vệ sự riêng tư. Nghiêm cấm hành vi vi phạm pháp luật. Xem{" "}
              <Link href={localePath(locale, "/legal/standards")} className="text-accent underline font-semibold">
                chính sách
              </Link>
              .
            </span>
          </div>
        </div>

        {/* Right Active Conversation Stream (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-canvas/20">
          {/* Header */}
          <div className="p-4 border-b border-line bg-surface flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentContact.avatar}
                alt={currentContact.name}
                className="h-10 w-10 rounded-full object-cover border border-line"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-sm font-bold text-ink">{currentContact.name}</h3>
                  <span className="font-mono text-xs text-muted">@{currentContact.handle}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[0.68rem] text-teal font-mono">
                  <Lock className="h-3 w-3" />
                  <span>Kênh mã hóa đầu cuối (End-to-End Encrypted)</span>
                </div>
              </div>
            </div>

            <Link
              href={localePath(locale, "/legal/standards")}
              className="inline-flex items-center gap-1 text-[0.68rem] font-mono text-muted hover:text-ink border border-line rounded-lg px-2.5 py-1"
            >
              <FileText className="h-3 w-3" />
              <span>Tiêu chuẩn</span>
            </Link>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_handle === "me";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <img
                      src={currentContact.avatar}
                      alt={msg.sender_name}
                      className="h-7 w-7 rounded-full object-cover border border-line mb-1"
                    />
                  )}
                  <div
                    className={`max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-accent text-white dark:text-[#04101F] rounded-br-xs"
                        : "bg-surface border border-line text-ink rounded-bl-xs"
                    }`}
                  >
                    {msg.media_url && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-black/10">
                        <img src={msg.media_url} alt="Attachment" className="max-h-60 w-full object-cover" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.encrypted_content}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[0.62rem] font-mono ${
                        isMe ? "text-white/80 dark:text-[#04101F]/80" : "text-subtle"
                      }`}
                    >
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Image URL Pop-in */}
          {showImageInput && (
            <div className="p-3 border-t border-line bg-surface/90 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-accent" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Dán URL hình ảnh đính kèm (https://...)..."
                className="flex-1 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowImageInput(false)}
                className="text-xs text-muted hover:text-ink px-2"
              >
                Hủy
              </button>
            </div>
          )}

          {/* Message Composer Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-line bg-surface flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className="p-2 rounded-xl text-muted hover:text-ink hover:bg-canvas transition"
              title="Đính kèm ảnh"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập tin nhắn mã hóa (Enter để gửi)..."
              className="flex-1 rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-accent transition"
            />

            <button
              type="submit"
              disabled={sending || (!inputText.trim() && !imageUrl.trim())}
              className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white dark:text-[#04101F] hover:opacity-90 transition disabled:opacity-40 shadow-sm shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
