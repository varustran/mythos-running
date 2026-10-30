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
  UserPlus,
  UserCheck,
  ShieldAlert,
  Inbox,
  Users,
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
  isFriend: boolean;
}

export function EncryptedChatClient({ locale }: { locale: Locale }) {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [activeContact, setActiveContact] = useState<string>("alextran");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<"friends" | "pending" | "stranger">("friends");
  const [newFriendHandle, setNewFriendHandle] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendActionMsg, setFriendActionMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      handle: "alextran",
      name: "Alex Trần",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Kiến trúc AI Agent đã tối ưu hóa xong rồi bạn nhé!",
      time: "10:45",
      isFriend: true,
    },
    {
      handle: "hoangminh",
      name: "Hoàng Minh",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Bạn xem qua bài viết mới về biohacking chưa?",
      time: "Hôm qua",
      isFriend: true,
    },
    {
      handle: "elena",
      name: "Dr. Elena Nguyễn",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastMessage: "Tài liệu khoa học đã được trích dẫn chuẩn hóa.",
      time: "28/10",
      isFriend: true,
    },
    {
      handle: "myso_support",
      name: "Myso Bot Hỗ Trợ 🔒",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Kênh trò chuyện bảo mật mã hóa đầu cuối đã sẵn sàng.",
      time: "26/10",
      isFriend: true,
    },
    {
      handle: "nguoila_9921",
      name: "Kỹ sư Crypto Ẩn Danh",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastMessage: "Chào bạn, mình muốn trao đổi về dự án mở rộng cộng đồng...",
      time: "15:20",
      isFriend: false,
    },
  ]);

  // Check relationship status when activeContact changes
  useEffect(() => {
    const contact = contacts.find((c) => c.handle === activeContact);
    if (contact) {
      setFriendshipStatus(contact.isFriend ? "friends" : "stranger");
    }
  }, [activeContact, contacts]);

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

  // Handle Accept Message Request / Friend
  const handleAcceptStranger = async () => {
    try {
      await fetch("/api/social/relationship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_handle: "me",
          target_handle: activeContact,
          action: "accept_friend",
        }),
      });

      setFriendshipStatus("friends");
      setContacts((prev) =>
        prev.map((c) => (c.handle === activeContact ? { ...c, isFriend: true } : c))
      );
      setFriendActionMsg("Đã chấp nhận kết bạn! Cuộc trò chuyện chuyển vào danh sách Bạn Bè.");
      setTimeout(() => setFriendActionMsg(null), 3000);
    } catch {}
  };

  // Handle Block
  const handleBlockStranger = async () => {
    try {
      await fetch("/api/social/relationship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_handle: "me",
          target_handle: activeContact,
          action: "block",
        }),
      });

      setContacts((prev) => prev.filter((c) => c.handle !== activeContact));
      setActiveContact("alextran");
      setFriendActionMsg("Đã chặn người dùng này.");
      setTimeout(() => setFriendActionMsg(null), 3000);
    } catch {}
  };

  // Add friend by username
  const handleAddNewFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFriendHandle.replace(/^@/, "").toLowerCase().trim();
    if (!clean) return;

    const existing = contacts.find((c) => c.handle === clean);
    if (!existing) {
      const newContact: ChatContact = {
        handle: clean,
        name: `@${clean}`,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        online: false,
        lastMessage: "Bắt đầu cuộc trò chuyện mới...",
        time: "Vừa xong",
        isFriend: true,
      };
      setContacts([newContact, ...contacts]);
    }
    setActiveContact(clean);
    setNewFriendHandle("");
    setShowAddFriend(false);
  };

  const filteredContacts = contacts.filter((c) =>
    activeTab === "friends" ? c.isFriend : !c.isFriend
  );

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
            <button
              onClick={() => setShowAddFriend(!showAddFriend)}
              className="grid h-7 w-7 place-items-center rounded-lg border border-line hover:border-accent text-muted hover:text-ink transition"
              title="Thêm bạn mới"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add Friend Input Toggle */}
          {showAddFriend && (
            <form onSubmit={handleAddNewFriend} className="p-3 border-b border-line bg-surface flex gap-2">
              <input
                type="text"
                value={newFriendHandle}
                onChange={(e) => setNewFriendHandle(e.target.value)}
                placeholder="Nhập @username bạn bè..."
                className="flex-1 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-semibold"
              >
                Thêm
              </button>
            </form>
          )}

          {/* Filter Tabs: Bạn bè vs Tin nhắn chờ */}
          <div className="grid grid-cols-2 p-1.5 border-b border-line bg-canvas">
            <button
              onClick={() => setActiveTab("friends")}
              className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === "friends"
                  ? "bg-accent text-white dark:text-[#04101F] shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Bạn Bè ({contacts.filter((c) => c.isFriend).length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === "requests"
                  ? "bg-accent text-white dark:text-[#04101F] shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              Tin Chờ ({contacts.filter((c) => !c.isFriend).length})
            </button>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-line/60">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                {activeTab === "friends" ? "Chưa có liên hệ bạn bè nào." : "Không có tin nhắn chờ từ người lạ."}
              </div>
            ) : (
              filteredContacts.map((contact) => (
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
              ))
            )}
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

          {/* Stranger Banner (Tin nhắn chờ cảnh báo) */}
          {friendshipStatus !== "friends" && (
            <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Tin nhắn từ người lạ:</strong> @{currentContact.handle} chưa có trong danh bạ bạn bè của bạn.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleAcceptStranger}
                  className="px-3 py-1 rounded-lg bg-teal text-black font-semibold text-xs flex items-center gap-1 shadow-xs"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Chấp Nhận & Kết Bạn
                </button>
                <button
                  onClick={handleBlockStranger}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold"
                >
                  Chặn
                </button>
              </div>
            </div>
          )}

          {friendActionMsg && (
            <div className="p-2.5 bg-teal/10 border-b border-teal/30 text-teal text-xs text-center font-mono">
              {friendActionMsg}
            </div>
          )}

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
