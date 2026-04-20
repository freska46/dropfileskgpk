// ===================== CONSTANTS =====================

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "524288000", 10); // 500MB
export const DEFAULT_STORAGE_LIMIT = BigInt(process.env.DEFAULT_STORAGE_LIMIT || "1073741824"); // 1GB

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
  "text/plain": [".txt"],
  "video/mp4": [".mp4"],
  "audio/mpeg": [".mp3"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

export const ALLOWED_EXTENSIONS = Object.values(ALLOWED_MIME_TYPES).flat();

export const THUMBNAIL_DIR = "./uploads/thumbnails";

// ===================== FILE TYPE CATEGORIES =====================

export const FILE_TYPE_ICONS: Record<string, string> = {
  "image": "🖼️",
  "video": "🎬",
  "audio": "🎵",
  "application/pdf": "📄",
  "application/zip": "📦",
  "application/x-zip-compressed": "📦",
  "text/plain": "📝",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📝",
  "application/vnd.ms-excel": "📊",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "application/vnd.rar": "📦",
  "application/x-rar-compressed": "📦",
  "application/x-7z-compressed": "📦",
  "application/gzip": "📦",
  "application/x-tar": "📦",
  "text/html": "🌐",
  "text/css": "🎨",
  "text/javascript": "⚡",
  "application/javascript": "⚡",
  "application/x-python": "🐍",
  "text/x-python": "🐍",
  "application/json": "📋",
  "application/xml": "📋",
  "application/octet-stream": "📦",
  "default": "📦",
};

export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return FILE_TYPE_ICONS[mimeType] || "default";
}

// Получение иконки по расширению (для файлов с неизвестным MIME-типом)
export function getFileIconByExtension(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const iconMap: Record<string, string> = {
    // Архивы
    "zip": "📦", "rar": "📦", "7z": "📦", "tar": "📦", "gz": "📦", "bz2": "📦", "xz": "📦",
    // Документы
    "pdf": "📄", "doc": "📝", "docx": "📝", "odt": "📝", "rtf": "📝", "txt": "📝",
    "xls": "📊", "xlsx": "📊", "ods": "📊", "csv": "📊",
    "ppt": "📽️", "pptx": "📽️", "odp": "📽️",
    // Код
    "py": "🐍", "js": "⚡", "ts": "⚡", "html": "🌐", "css": "🎨",
    "json": "📋", "xml": "📋", "yml": "⚙️", "yaml": "⚙️",
    "java": "☕", "cpp": "⚡", "c": "⚡", "h": "⚡", "cs": "⚡",
    "php": "🐘", "rb": "💎", "go": "🔷", "rs": "🦀",
    // Изображения
    "jpg": "🖼️", "jpeg": "🖼️", "png": "🖼️", "gif": "🖼️", "webp": "🖼️", "svg": "🖼️",
    "bmp": "🖼️", "ico": "🖼️", "tiff": "🖼️", "psd": "🎨", "ai": "🎨",
    // Видео/аудио
    "mp4": "🎬", "avi": "🎬", "mov": "🎬", "mkv": "🎬", "flv": "🎬", "webm": "🎬",
    "mp3": "🎵", "wav": "🎵", "flac": "🎵", "ogg": "🎵", "aac": "🎵", "wma": "🎵",
    // Исполняемые
    "exe": "💻", "msi": "💻", "dmg": "💻", "apk": "📱", "ipa": "📱",
    "deb": "📦", "rpm": "📦", "sh": "⚡", "bat": "⚡", "cmd": "⚡",
    // Базы данных
    "db": "🗄️", "sql": "🗄️", "sqlite": "🗄️",
    // Шрифты
    "ttf": "🔤", "otf": "🔤", "woff": "🔤", "woff2": "🔤",
    // Другое
    "iso": "💿", "img": "💿", "torrent": "🔗", "key": "🔑", "pem": "🔑",
  };
  return iconMap[ext] || "📦";
}

// ===================== HELPERS =====================

export function formatFileSize(bytes: bigint | number): string {
  const numBytes = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (numBytes < 1024) return `${numBytes} Б`;
  if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} КБ`;
  if (numBytes < 1024 * 1024 * 1024) return `${(numBytes / (1024 * 1024)).toFixed(1)} МБ`;
  return `${(numBytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
