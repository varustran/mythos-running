"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  ShieldCheck,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  CheckCircle2,
  ExternalLink,
  Zap,
  TrendingUp,
  Percent,
  Lock,
  Layers,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { localePath, type Locale } from "@/lib/i18n/settings";

const NETWORKS = [
  { id: "bnb", name: "BNB Chain", symbol: "BNB", explorer: "https://bscscan.com", icon: "🟡" },
  { id: "arb", name: "Arbitrum One", symbol: "ETH", explorer: "https://arbiscan.io", icon: "🔵" },
  { id: "polygon", name: "Polygon PoS", symbol: "POL", explorer: "https://polygonscan.com", icon: "🟣" },
  { id: "base", name: "Base", symbol: "ETH", explorer: "https://basescan.org", icon: "🔷" },
  { id: "op", name: "Optimism", symbol: "ETH", explorer: "https://optimistic.etherscan.io", icon: "🔴" },
];

export default function WalletPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [depositAmount, setDepositAmount] = useState("25");
  const [depositing, setDepositing] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.wallet_address) {
      setWalletAddress(profile.wallet_address);
    } else {
      const saved = localStorage.getItem("myso_web3_sim_addr");
      if (saved) setWalletAddress(saved);
    }
  }, [profile]);

  useEffect(() => {
    async function loadLedger() {
      try {
        const res = await fetch("/api/wallet/ledger");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.entries)) {
            setLedgerEntries(data.entries);
          }
        }
      } catch (err) {
        console.error("Failed to load ledger:", err);
      }
    }
    loadLedger();
  }, [profile]);

  const handleConnect = () => {
    const randomHex = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 65536).toString(16).padStart(4, "0")
    ).join("");
    const newAddr = `0x71C${randomHex}4e89`;
    setWalletAddress(newAddr);
    localStorage.setItem("myso_web3_sim_addr", newAddr);
  };

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleDeposit = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để nạp Myso Gold.");
      return;
    }
    setDepositing(true);
    setDepositSuccessMsg(null);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depositAmount,
          network: selectedNetwork.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDepositSuccessMsg(`Nạp thành công +${data.amount} Myso Gold qua ${selectedNetwork.name}!`);
        await refreshProfile();
        // Reload ledger
        const ledgerRes = await fetch("/api/wallet/ledger");
        if (ledgerRes.ok) {
          const lData = await ledgerRes.json();
          setLedgerEntries(lData.entries || []);
        }
      } else {
        alert(data.error || "Nạp thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi hệ thống khi nạp.");
    } finally {
      setDepositing(false);
    }
  };

  return (
    <div className="w-full flex flex-col divide-y divide-[#27272A]/70">
      {/* Header Banner */}
      <div className="p-6 flex flex-col gap-4 bg-gradient-to-b from-[#18181B]/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#FAFAFA] tracking-tight">
                Ví & Doanh Thu Tác Giả
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                Cơ chế thanh toán một chiều Safe-by-Design · Chia sẻ 85/15 qua Smart Contract
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Web2.5 Verified</span>
          </div>
        </div>

        {depositSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span>{depositSuccessMsg}</span>
            <button onClick={() => setDepositSuccessMsg(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Balance Cards & Web3 Connection */}
      <div className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: Myso Gold */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-amber-500/30 shadow-lg flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Myso Gold (USDT)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                1 Gold = 1 USDT
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 tracking-tight">
                {profile?.gold_balance || 0}
              </span>
              <span className="text-xs text-[#A1A1AA]">Gold</span>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Dùng để mở khóa trực tiếp các bài viết, prompt AI và thư viện code bản quyền.
            </p>
          </div>

          {/* Card 2: Myso Points */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-emerald-500/30 shadow-lg flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Myso Points
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Miễn phí
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 tracking-tight">
                {profile?.points_balance || 100}
              </span>
              <span className="text-xs text-[#A1A1AA]">pts</span>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Điểm thưởng tích lũy từ làm nhiệm vụ mỗi ngày hoặc xem tài trợ.
            </p>
          </div>
        </div>

        {/* Web3 Wallet Details */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272A] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Địa chỉ ví Web3
            </h2>
            {/* Network selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {NETWORKS.map((net) => (
                <button
                  key={net.id}
                  onClick={() => setSelectedNetwork(net)}
                  type="button"
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                    selectedNetwork.id === net.id
                      ? "bg-[#27272A] text-white border border-[#3F3F46]"
                      : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  <span>{net.icon}</span>
                  <span className="hidden sm:inline">{net.name}</span>
                </button>
              ))}
            </div>
          </div>

          {walletAddress ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-[#FAFAFA] break-all">
                  {walletAddress}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAddress}
                  className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-[#A1A1AA] hover:text-white transition flex items-center gap-1"
                >
                  {copiedAddr ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedAddr ? "Đã chép" : "Sao chép"}</span>
                </button>
                <a
                  href={`${selectedNetwork.explorer}/address/${walletAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-[#A1A1AA] hover:text-white transition flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Explorer</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
              <span className="text-xs text-[#71717A]">Chưa kết nối ví Web3</span>
              <button
                onClick={handleConnect}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition"
              >
                Kết nối ví ngay
              </button>
            </div>
          )}

          {/* Quick Deposit Section */}
          <div className="pt-2 border-t border-[#27272A] flex flex-col gap-3">
            <span className="text-xs font-bold text-[#FAFAFA]">
              Nạp Myso Gold (Mô phỏng Smart Contract)
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {["10", "25", "50", "100"].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    depositAmount === amt
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/50"
                      : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46]"
                  }`}
                >
                  +{amt} USDT
                </button>
              ))}
            </div>

            <button
              onClick={handleDeposit}
              disabled={depositing}
              className="w-full sm:w-auto self-start mt-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition flex items-center gap-2 shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {depositing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang ký giao dịch trên {selectedNetwork.name}...</span>
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4" />
                  <span>Nạp {depositAmount} Gold ({depositAmount} USDT)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Creator 85/15 Revenue Model Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121215] to-[#18181B] border border-[#27272A] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Percent className="h-4 w-4" />
              <span>Chính sách phân phối doanh thu 85/15</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              Automated by Smart Contract
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Mỗi khi độc giả sử dụng Myso Gold để mở khóa bài viết kỹ thuật, mã nguồn hoặc tài liệu của bạn, hệ thống hợp đồng thông minh tự động chia sẻ <strong className="text-[#FAFAFA]">85% doanh thu</strong> trực tiếp cho tác giả. 15% còn lại được chuyển vào quỹ vận hành máy chủ và phòng vệ rủi ro.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-[#121215] border border-[#27272A] flex flex-col">
              <span className="text-[10px] text-[#71717A]">Tỷ lệ chia sẻ tác giả</span>
              <span className="text-xl font-black text-emerald-400">85.00%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121215] border border-[#27272A] flex flex-col">
              <span className="text-[10px] text-[#71717A]">Phí vận hành nền tảng</span>
              <span className="text-xl font-black text-amber-400">15.00%</span>
            </div>
          </div>
        </div>

        {/* Ledger Transaction History */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272A] flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            Lịch sử giao dịch sổ cái (Ledger Entries)
          </h2>

          {ledgerEntries.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#27272A]/50">
              {ledgerEntries.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        item.direction === "IN"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {item.direction === "IN" ? (
                        <ArrowDownLeft className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#FAFAFA] capitalize">
                        {item.transaction_type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono">
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`font-bold font-mono ${
                        item.direction === "IN" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {item.direction === "IN" ? "+" : "-"}
                      {item.amount} {item.asset_code}
                    </span>
                    {item.tx_hash && (
                      <span className="text-[9px] text-[#71717A] font-mono">
                        {item.tx_hash.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#71717A] py-4 text-center">
              Chưa có giao dịch nào được ghi nhận trên sổ cái.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
