"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Lock,
  Shield,
  Image as ImageIcon,
  CheckCheck,
  Paperclip,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Inbox,
  Users,
  ArrowLeft,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import Link from "next/link";
import { localePath } from "@/lib/i18n/settings";
import { uploadMediaFile } from "@/lib/storage";

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
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatAttachment, setChatAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const [isUploadingChatFile, setIsUploadingChatFile] = useState(false);
  const [sending, setSending] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<"friends" | "pending" | "stranger">("friends");
  const [newFriendHandle, setNewFriendHandle] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendActionMsg, setFriendActionMsg] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      handle: "alextran",
      name: "Alex Trần",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Kiến trúc hệ thống AI Agent đã hoàn tất!",
      time: "10:45",
      isFriend: true,
    },
    {
      handle: "hoangminh",
      name: "Hoàng Minh",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastMessage: "Bạn xem qua ý tưởng về không gian mở chưa?",
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
      lastMessage: "Chào bạn, tôi muốn trao đổi về giải pháp phân tán.",
      time: "14:20",
      isFriend: false,
    },
  ]);

  // Load chat history
  useEffect(() => {
    async function loadChat() {
      try {
        const res = await fetch(`/api/chat?contact=${activeContact}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            setMessages([
              {
                id: "initial-1",
                sender_handle: activeContact,
                sender_name: contacts.find((c) => c.handle === activeContact)?.name || activeContact,
                recipient_handle: "me",
                encrypted_content:
                  activeContact === "myso_support"
                    ? "Chào mừng bạn đến với kênh trò chuyện bảo mật Myso. Mọi tin nhắn tại đây đều được mã hóa."
                    : `Xin chào! Tôi là @${activeContact}. Rất vui được kết nối trên Myso.`,
                created_at: new Date(Date.now() - 3600000).toISOString(),
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Load chat error:", err);
      }
    }

    loadChat();

    // Check relationship status
    const current = contacts.find((c) => c.handle === activeContact);
    if (current && !current.isFriend) {
      setFriendshipStatus("stranger");
    } else {
      setFriendshipStatus("friends");
    }
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle direct file upload from PC/phone
  const handleChatFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingChatFile(true);
    try {
      const item = await uploadMediaFile(file, "chat");
      setChatAttachment(item);
    } catch (err: any) {
      alert(`Lỗi tải tệp tin: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setIsUploadingChatFile(false);
      e.target.value = "";
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !chatAttachment) return;

    setSending(true);
    const optimisticMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender_handle: "me",
      sender_name: "Bạn",
      recipient_handle: activeContact,
      encrypted_content: inputText.trim(),
      media_url: chatAttachment?.url || null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");
    const sentAttachment = chatAttachment;
    setChatAttachment(null);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_handle: activeContact,
          content: optimisticMessage.encrypted_content,
          media_url: sentAttachment?.url,
        }),
      });
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  // Accept stranger
  const handleAcceptStranger = async () => {
    try {
      await fetch("/api/social/relationship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_handle: "me",
          target_handle: activeContact,
          action: "accept",
        }),
      });

      setContacts((prev) =>
        prev.map((c) => (c.handle === activeContact ? { ...c, isFriend: true } : c))
      );
      setFriendshipStatus("friends");
      setFriendActionMsg("Đã kết bạn thành công! Tin nhắn đã được chuyển sang danh sách bạn bè.");
      setTimeout(() => setFriendActionMsg(null), 3000);
    } catch {}
  };

  // Block stranger
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
    setMobileChatOpen(true);
  };

  const filteredContacts = contacts.filter((c) =>
    activeTab === "friends" ? c.isFriend : !c.isFriend
  );

  const currentContact = contacts.find((c) => c.handle === activeContact) || contacts[0];

  return (
    <div className="container-page py-4 sm:py-8 max-w-6xl">
      {/* Hidden file input for attachments */}
      <input
        type="file"
        ref={chatFileInputRef}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.zip"
        onChange={handleChatFileSelected}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-line bg-surface overflow-hidden shadow-2xl h-[720px] sm:h-[750px]">
        {/* Left Contacts Sidebar (Mobile: toggles, Desktop: 4 cols) */}
        <div
          className={`${
            mobileChatOpen ? "hidden md:flex" : "flex"
          } md:col-span-4 border-r border-line flex-col bg-canvas/40 h-full`}
        >
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
              className="grid h-8 w-8 place-items-center rounded-xl border border-line hover:border-accent text-muted hover:text-ink transition active:scale-95"
              title="Thêm bạn mới"
            >
              <UserPlus className="h-4 w-4" />
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
                className="px-3 py-1.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-semibold active:scale-95"
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
                  onClick={() => {
                    setActiveContact(contact.handle);
                    setMobileChatOpen(true);
                  }}
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

        {/* Right Active Conversation Stream (Mobile: toggles, Desktop: 8 cols) */}
        <div
          className={`${
            !mobileChatOpen ? "hidden md:flex" : "flex"
          } md:col-span-8 flex-col h-full bg-canvas/20`}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-line bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={() => setMobileChatOpen(false)}
                className="md:hidden p-1.5 rounded-lg border border-line bg-canvas text-ink"
                title="Quay lại danh sách"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <img
                src={currentContact.avatar}
                alt={currentContact.name}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border border-line"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-xs sm:text-sm font-bold text-ink">{currentContact.name}</h3>
                  <span className="font-mono text-[0.68rem] sm:text-xs text-muted">@{currentContact.handle}</span>
                </div>
                <div className="flex items-center gap-1 text-[0.65rem] text-teal font-mono">
                  <Lock className="h-3 w-3" />
                  <span>Mã hóa E2EE</span>
                </div>
              </div>
            </div>

            <Link
              href={localePath(locale, "/legal/standards")}
              className="inline-flex items-center gap-1 text-[0.68rem] font-mono text-muted hover:text-ink border border-line rounded-lg px-2.5 py-1"
            >
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Tiêu chuẩn</span>
            </Link>
          </div>

          {/* Stranger Banner */}
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
                        {/\.(mp4|webm|mov)$/i.test(msg.media_url) ? (
                          <video controls src={msg.media_url} className="max-h-60 w-full object-cover" />
                        ) : (
                          <img src={msg.media_url} alt="Attachment" className="max-h-60 w-full object-cover" />
                        )}
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

          {/* Attached Media Preview */}
          {chatAttachment && (
            <div className="p-2.5 mx-3 mb-2 rounded-xl border border-line bg-surface flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="h-4 w-4 text-accent shrink-0" />
                <span className="font-mono text-ink truncate">{chatAttachment.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setChatAttachment(null)}
                className="p-1 rounded-lg text-muted hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {isUploadingChatFile && (
            <div className="p-2 mx-3 mb-2 rounded-xl border border-accent/30 bg-accent/10 flex items-center gap-2 text-xs font-mono text-ink">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              <span>Đang tải tệp lên phòng chat...</span>
            </div>
          )}

          {/* Message Composer Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-line bg-surface flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => chatFileInputRef.current?.click()}
              disabled={isUploadingChatFile}
              className="p-2 rounded-xl text-muted hover:text-accent hover:bg-canvas transition active:scale-95"
              title="Tải ảnh hoặc tệp từ thiết bị"
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
              disabled={sending || (!inputText.trim() && !chatAttachment)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white dark:text-[#04101F] hover:opacity-90 transition disabled:opacity-40 shadow-sm shrink-0 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
