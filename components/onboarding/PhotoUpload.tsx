"use client";

import { useRef, useState } from "react";

export default function PhotoUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="glass rounded-2xl p-8 border-dashed border-2 border-white/15 hover:border-white/30 hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col items-center text-center"
      >
        {value ? (
          <div className="space-y-3 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Your photo"
              className="rounded-xl mx-auto max-h-64 object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="text-xs text-muted-soft hover:text-foreground"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 size-12 rounded-full bg-white/[0.06] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="font-medium">Drop a photo or click to upload</div>
            <div className="text-xs text-muted-soft mt-1">
              Optional · processed once for this analysis · not stored
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <div className="text-sm text-accent-red">{error}</div>}
    </div>
  );
}
