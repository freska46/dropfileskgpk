"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatFileSize, formatDate, getFileCategory, getFileIconByExtension } from "@/lib/constants";
import { useToast } from "@/components/ToastProvider";

interface FileData {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  accessType: string;
  thumbnailPath: string | null;
  shareLinks: ShareLink[];
}

interface ShareLink {
  id: string;
  token: string;
  downloads: number;
  maxDownloads: number | null;
  expiresAt: string | null;
}

interface FolderData {
  id: string;
  name: string;
  _count: { files: number; children: number };
}

interface StorageInfo {
  used: number;
  limit: number;
}

export default function FileDashboard() {
  const toast = useToast();
  const [files, setFiles] = useState<FileData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [storage, setStorage] = useState<StorageInfo>({ used: 0, limit: 0 });
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Поиск
  const [search, setSearch] = useState("");

  // Превью картинки
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = currentFolder ? `?folderId=${currentFolder}` : "";
      const res = await fetch(`/api/files${params}`);
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      setFiles(data.files);
      setFolders(data.folders);
      setStorage(data.storage);
    } catch {
      toast.error("Не удалось загрузить файлы");
    } finally {
      setLoading(false);
    }
  }, [currentFolder, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ===================== UPLOAD =====================
  const uploadFiles = async (fileList: FileList) => {
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) formData.append("folderId", currentFolder);

      try {
        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || `Ошибка загрузки ${file.name}`);
        } else {
          toast.success(`${file.name} загружен`);
        }
      } catch {
        toast.error(`Ошибка загрузки ${file.name}`);
      }

      setUploadProgress(((i + 1) / fileList.length) * 100);
    }

    setUploading(false);
    setUploadProgress(0);
    fetchFiles();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  // ===================== FOLDERS =====================
  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, parentId: currentFolder }),
      });
      if (!res.ok) throw new Error();
      setNewFolderName("");
      setShowNewFolder(false);
      toast.success("Папка создана");
      fetchFiles();
    } catch {
      toast.error("Ошибка создания папки");
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm("Удалить папку и все её содержимое?")) return;
    try {
      const res = await fetch(`/api/folders?id=${folderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.info("Папка удалена");
      fetchFiles();
    } catch {
      toast.error("Ошибка удаления папки");
    }
  };

  // ===================== FILE ACTIONS =====================
  const deleteFile = async (fileId: string) => {
    if (!confirm("Удалить файл?")) return;
    try {
      const res = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.info("Файл удалён");
      fetchFiles();
    } catch {
      toast.error("Ошибка удаления файла");
    }
  };

  const renameFile = async (fileId: string, newName: string) => {
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error();
      toast.success("Файл переименован");
      fetchFiles();
    } catch {
      toast.error("Ошибка переименования");
    }
  };

  // ===================== ACCESS =====================
  const openAccessModal = (file: FileData) => {
    setSelectedFile(file);
    setShowAccessModal(true);
  };

  const generateShareLink = async () => {
    if (!selectedFile) return;
    try {
      const res = await fetch(`/api/files/${selectedFile.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-link" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setShareUrl(data.url);
      toast.success("Ссылка создана");
      fetchFiles();
    } catch {
      toast.error("Ошибка создания ссылки");
    }
  };

  const setAccessType = async (fileId: string, type: string) => {
    try {
      const res = await fetch(`/api/files/${fileId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-access-type", accessType: type }),
      });
      if (!res.ok) throw new Error();
      toast.success("Доступ обновлён");
      fetchFiles();
    } catch {
      toast.error("Ошибка изменения доступа");
    }
  };

  const revokeLink = async (linkId: string) => {
    if (!selectedFile) return;
    try {
      const res = await fetch(`/api/files/${selectedFile.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke-link", linkId }),
      });
      if (!res.ok) throw new Error();
      toast.info("Ссылка отозвана");
      fetchFiles();
    } catch {
      toast.error("Ошибка отзыва ссылки");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Ссылка скопирована в буфер");
  };

  // ===================== FILTERED =====================
  const filteredFiles = files.filter((f) =>
    f.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // ===================== STATS =====================
  const totalFiles = files.length;
  const totalFolders = folders.length;
  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const publicFiles = files.filter((f) => f.accessType === "PUBLIC").length;
  const storagePercent = storage.limit > 0 ? (storage.used / storage.limit) * 100 : 0;

  if (loading && files.length === 0) {
    return <div className="text-center py-20 text-zinc-500">Загрузка файлов...</div>;
  }

  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon="📁" label="Файлы" value={totalFiles.toString()} color="blue" />
        <StatCard icon="📂" label="Папки" value={totalFolders.toString()} color="purple" />
        <StatCard icon="🌐" label="Публичные" value={publicFiles.toString()} color="green" />
        <StatCard icon="💾" label="Размер" value={formatFileSize(totalSize)} color="orange" />
      </div>

      {/* Storage bar */}
      <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>Хранилище</span>
          <span>{formatFileSize(storage.used)} / {formatFileSize(storage.limit)}</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${storagePercent > 90 ? "bg-red-500" : storagePercent > 70 ? "bg-yellow-500" : "bg-blue-500"}`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors text-sm"
        >
          {uploading ? `⏳ ${uploadProgress.toFixed(0)}%` : "⬆️ Загрузить"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />

        <button
          onClick={() => setShowNewFolder(true)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
        >
          📁 Папка
        </button>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Поиск файлов..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="mb-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive ? "border-blue-500 bg-blue-500/5 scale-[1.01]" : "border-zinc-800 bg-zinc-900/50"
        }`}
      >
        <div className="text-zinc-500">
          Перетащите файлы сюда или нажмите кнопку «Загрузить»
        </div>
      </div>

      {/* New folder modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowNewFolder(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">📁 Новая папка</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Название папки"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
            />
            <div className="flex gap-2">
              <button onClick={createFolder} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                Создать
              </button>
              <button onClick={() => setShowNewFolder(false)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {previewFile && (
        <ImagePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Access modal */}
      {showAccessModal && selectedFile && (
        <AccessModal
          file={selectedFile}
          shareUrl={shareUrl}
          onGenerate={generateShareLink}
          onCopy={copyLink}
          onSetType={setAccessType}
          onRevoke={revokeLink}
          onClose={() => { setShowAccessModal(false); setShareUrl(""); setSelectedFile(null); }}
        />
      )}

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="mb-4 text-sm text-zinc-400">
          <button onClick={() => setCurrentFolder(null)} className="hover:text-white">📂 Корень</button>
        </div>
      )}

      {/* Search result info */}
      {search && (
        <div className="mb-4 text-sm text-zinc-400">
          Найдено: {filteredFolders.length} папок, {filteredFiles.length} файлов
        </div>
      )}

      {/* Folders */}
      {filteredFolders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">ПАПКИ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group cursor-pointer relative"
                onDoubleClick={() => setCurrentFolder(folder.id)}
              >
                <div className="text-3xl mb-2">📁</div>
                <div className="text-sm font-medium truncate">{folder.name}</div>
                <div className="text-xs text-zinc-500">{folder._count.files} файлов</div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {filteredFiles.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">ФАЙЛЫ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={deleteFile}
                onRename={renameFile}
                onAccess={() => openAccessModal(file)}
                onPreview={() => setPreviewFile(file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredFiles.length === 0 && filteredFolders.length === 0 && (
        <EmptyState search={search} />
      )}
    </div>
  );
}

// ===================== STAT CARD =====================

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
    green: "from-green-500/20 to-green-500/5 border-green-500/20",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4 animate-fadeIn`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-zinc-400">{label}</div>
    </div>
  );
}

// ===================== FILE CARD =====================

function FileCard({
  file,
  onDelete,
  onRename,
  onAccess,
  onPreview,
}: {
  file: FileData;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAccess: () => void;
  onPreview: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(file.originalName);
  const isImage = file.mimeType.startsWith("image/");
  // Если MIME-тип неизвестный — определяем иконку по расширению
  const isUnknownType = file.mimeType === "application/octet-stream" || !file.mimeType;
  const icon = isUnknownType ? getFileIconByExtension(file.originalName) : getFileCategory(file.mimeType);
  const accessIcon =
    file.accessType === "PUBLIC" ? "🌐" :
    file.accessType === "LINK_ACCESS" ? "🔗" : "🔒";

  const handleRename = () => {
    if (name.trim() && name !== file.originalName) {
      onRename(file.id, name.trim());
    }
    setRenaming(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all group">
      {/* Thumbnail area */}
      <div
        className={`h-28 bg-zinc-800/50 flex items-center justify-center cursor-pointer ${isImage ? "hover:bg-zinc-800" : ""}`}
        onClick={isImage ? onPreview : undefined}
      >
        {isImage ? (
          <div className="text-4xl">{file.thumbnailPath ? "🖼️" : "🖼️"}</div>
        ) : (
          <div className="text-4xl">{icon}</div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          {renaming ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="w-full text-sm bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white"
              autoFocus
            />
          ) : (
            <div className="text-sm font-medium truncate flex-1" title={file.originalName}>
              {file.originalName}
            </div>
          )}
          <span className="text-xs ml-1">{accessIcon}</span>
        </div>

        <div className="text-xs text-zinc-500 mb-2">
          {formatFileSize(file.size)} · {formatDate(new Date(file.createdAt))}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isImage && (
            <button onClick={onPreview} className="p-1 hover:bg-zinc-800 rounded text-xs" title="Превью">
              👁️
            </button>
          )}
          <a href={`/api/files/${file.id}/download`} target="_blank" className="p-1 hover:bg-zinc-800 rounded text-xs" title="Скачать">
            ⬇️
          </a>
          <button onClick={() => setRenaming(true)} className="p-1 hover:bg-zinc-800 rounded text-xs" title="Переименовать">
            ✏️
          </button>
          <button onClick={onAccess} className="p-1 hover:bg-zinc-800 rounded text-xs" title="Доступ">
            🔐
          </button>
          <button onClick={() => onDelete(file.id)} className="p-1 hover:bg-zinc-800 rounded text-xs text-red-400" title="Удалить">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== IMAGE PREVIEW MODAL =====================

function ImagePreviewModal({ file, onClose }: { file: FileData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="max-w-4xl max-h-[90vh] animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium truncate max-w-lg">{file.originalName}</h3>
          <div className="flex gap-2">
            <a
              href={`/api/files/${file.id}/download`}
              target="_blank"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white"
            >
              ⬇️ Скачать
            </a>
            <button onClick={onClose} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white">
              ✕
            </button>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center" style={{ maxHeight: "70vh" }}>
          <img
            src={`/api/files/${file.id}/download`}
            alt={file.originalName}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
        <p className="text-zinc-500 text-xs mt-2 text-center">
          {formatFileSize(file.size)} · {file.mimeType}
        </p>
      </div>
    </div>
  );
}

// ===================== ACCESS MODAL =====================

function AccessModal({
  file,
  shareUrl,
  onGenerate,
  onCopy,
  onSetType,
  onRevoke,
  onClose,
}: {
  file: FileData;
  shareUrl: string;
  onGenerate: () => void;
  onCopy: () => void;
  onSetType: (fileId: string, type: string) => void;
  onRevoke: (linkId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg animate-fadeIn max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">🔐 Доступ к файлу</h3>
        <p className="text-sm text-zinc-400 mb-4 truncate">{file.originalName}</p>

        <div className="mb-6">
          <label className="text-sm font-medium text-zinc-300 mb-2 block">Тип доступа</label>
          <div className="space-y-2">
            {(["PRIVATE", "LINK_ACCESS", "PUBLIC"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`access-${file.id}`}
                  checked={file.accessType === type}
                  onChange={() => onSetType(file.id, type)}
                  className="accent-blue-500"
                />
                <span className="text-sm">
                  {type === "PRIVATE" ? "🔒 Приватный" : type === "LINK_ACCESS" ? "🔗 По ссылке" : "🌐 Публичный"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-300">Секретные ссылки</label>
            <button onClick={onGenerate} className="text-xs text-blue-400 hover:text-blue-300">
              + Создать
            </button>
          </div>

          {shareUrl && (
            <div className="flex gap-2 mb-3">
              <input readOnly value={shareUrl} className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300" />
              <button onClick={onCopy} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                Копировать
              </button>
            </div>
          )}

          {file.shareLinks.length > 0 && (
            <div className="space-y-2">
              {file.shareLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between bg-zinc-800 rounded-lg p-2 text-sm">
                  <div>
                    <div className="text-zinc-300 font-mono text-xs">{link.token.slice(0, 12)}...</div>
                    <div className="text-zinc-500 text-xs">
                      Скачиваний: {link.downloads}{link.maxDownloads ? ` / ${link.maxDownloads}` : ""}
                      {link.expiresAt && ` · ${new Date(link.expiresAt).toLocaleDateString("ru-RU")}`}
                    </div>
                  </div>
                  <button onClick={() => onRevoke(link.id)} className="text-red-400 hover:text-red-300 text-xs">
                    Отозвать
                  </button>
                </div>
              ))}
            </div>
          )}

          {file.shareLinks.length === 0 && !shareUrl && (
            <p className="text-xs text-zinc-500">Нет активных ссылок</p>
          )}
        </div>

        <button onClick={onClose} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">
          Закрыть
        </button>
      </div>
    </div>
  );
}

// ===================== EMPTY STATE =====================

function EmptyState({ search }: { search: string }) {
  if (search) {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-zinc-300 mb-2">Ничего не найдено</h3>
        <p className="text-zinc-500">Попробуйте другой запрос</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 animate-fadeIn">
      <div className="text-6xl mb-4">📂</div>
      <h3 className="text-xl font-semibold text-zinc-300 mb-2">Хранилище пусто</h3>
      <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
        Перетащите файлы сюда или нажмите кнопку «Загрузить», чтобы добавить первый файл
      </p>
      <div className="flex gap-3 justify-center text-sm">
        <div className="px-3 py-1.5 bg-zinc-800 rounded-lg text-zinc-400">Любые файлы</div>
        <div className="px-3 py-1.5 bg-zinc-800 rounded-lg text-zinc-400">Архивы</div>
        <div className="px-3 py-1.5 bg-zinc-800 rounded-lg text-zinc-400">Исполняемые</div>
      </div>
    </div>
  );
}
