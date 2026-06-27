'use client';

import { useCallback, useRef, useState } from 'react';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

interface UploadZoneProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

export function UploadZone({ files, onChange }: UploadZoneProps) {
  const [draggingOver, setDraggingOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
      const entries: UploadedFile[] = imageFiles.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      onChange([...files, ...entries]);
    },
    [files, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDraggingOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const handleReorderDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleReorderDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...files];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const removeFile = (id: string) => {
    onChange(files.filter(f => f.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          draggingOver
            ? 'border-accent bg-accent/5'
            : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files) addFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3v10M6 7l4-4 4 4M4 14h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1a1 1 0 011-1z"
                stroke="#A8A8A8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-ink-700">
              {draggingOver ? 'Drop screens here' : 'Drop screens here or click to browse'}
            </p>
            <p className="text-xs text-ink-400 mt-1">PNG, JPG, WebP · Add in flow order</p>
          </div>
        </div>
      </div>

      {/* Screen grid with drag-to-reorder */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">
            {files.length} screen{files.length !== 1 ? 's' : ''} — drag to reorder
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {files.map((f, i) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => handleReorderDragStart(i)}
                onDragOver={e => handleReorderDragOver(e, i)}
                onDrop={e => handleReorderDrop(e, i)}
                onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                className={[
                  'group relative aspect-[9/16] rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing',
                  'transition-all duration-150',
                  draggedIndex === i ? 'opacity-40 scale-95 border-accent' : 'border-transparent',
                  dragOverIndex === i && draggedIndex !== i ? 'border-accent scale-105' : '',
                  'hover:border-ink-300',
                  'screen-card-entrance',
                ].join(' ')}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <img
                  src={f.preview}
                  alt={`Screen ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Index badge */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-mono flex items-center justify-center">
                  {i + 1}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeFile(f.id); }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  aria-label="Remove screen"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
