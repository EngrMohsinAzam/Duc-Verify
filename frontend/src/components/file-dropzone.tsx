"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, X } from "lucide-react";

interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}

export function FileDropzone({ file, onFileChange, error }: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFileChange(accepted[0]);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (file) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">
              {file.name}
            </p>
            <p className="text-sm text-text-secondary">
              {formatSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="rounded-lg p-2 text-text-secondary hover:bg-background"
            aria-label="Remove file"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : error
              ? "border-error bg-error-bg/30"
              : "border-border bg-surface hover:border-primary/50 hover:bg-background"
        }`}
      >
        <input {...getInputProps()} />
        <FileUp
          className="mx-auto text-text-secondary"
          size={36}
          strokeWidth={1.5}
        />
        <p className="mt-4 font-medium text-text-primary">
          Drag and drop your document
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          PDF or image · Max 25 MB
        </p>
        <p className="mt-3 text-sm font-medium text-primary">
          or click to browse
        </p>
      </div>
      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
