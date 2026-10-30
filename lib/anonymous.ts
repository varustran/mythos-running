// Automatic Anonymous Guest Identity Generator for Myso Community

const ADJECTIVES = [
  "Bí Ẩn", "Nhanh Nhẹn", "Thông Thái", "Hào Hiệp", "Trầm Lặng",
  "Nhiệt Huyết", "Sáng Tạo", "Vui Vẻ", "Dũng Cảm", "Tinh Anh"
];

const NOUNS = [
  "Hải Âu", "Cáo Bạc", "Phượng Hoàng", "Cá Voi", "Gấu Trúc",
  "Đại Bàng", "Mèo Rừng", "Sói Xám", "Sư Tử", "Hạc Trắng"
];

export interface AnonymousIdentity {
  displayName: string;
  handle: string;
  avatarSeed: string;
}

export function getOrCreateAnonymousIdentity(): AnonymousIdentity {
  if (typeof window === "undefined") {
    return {
      displayName: "Thành viên Ẩn danh #1024",
      handle: "guest_1024",
      avatarSeed: "guest_1024",
    };
  }

  const stored = localStorage.getItem("myso_anon_identity");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  // Generate new consistent identity
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const code = Math.floor(1000 + Math.random() * 9000);

  const identity: AnonymousIdentity = {
    displayName: `${noun} ${adj} #${code}`,
    handle: `guest_${code}`,
    avatarSeed: `${noun}_${code}`,
  };

  try {
    localStorage.setItem("myso_anon_identity", JSON.stringify(identity));
  } catch {}

  return identity;
}
