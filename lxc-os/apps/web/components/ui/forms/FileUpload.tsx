import React, { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "react-hot-toast";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onClear?: () => void;
  label?: string;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  defaultValue?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onClear,
  label,
  accept = ".pdf,.doc,.docx,.jpg,.png,.jpeg",
  maxSize = 10,
  defaultValue = ""
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    await uploadToCloudinary(selectedFile);
  };

  const uploadToCloudinary = async (fileToUpload: File) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const response = await axios.post("/api/v1/dashboard/teacher/homework/upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      const uploadedUrl = response.data.url;
      setUrl(uploadedUrl);
      onUploadComplete(uploadedUrl);
      toast.success("File uploaded successfully");
    } catch (err: any) {
      console.error("Upload error", err);
      setError(err.response?.data?.message || "Failed to upload file");
      toast.error(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUrl("");
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-black uppercase tracking-widest text-gray-400">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
          url 
            ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10" 
            : "border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-indigo-400/50",
          error && "border-rose-500 bg-rose-50/30 dark:bg-rose-900/10"
        )}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          accept={accept}
          ref={fileInputRef}
          disabled={uploading}
        />

        <div className="p-6 flex flex-col items-center justify-center text-center space-y-3">
          {!url && !uploading && !error && (
            <>
              <div className="h-12 w-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  Click or drag to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, Images, or Documents (Max {maxSize}MB)
                </p>
              </div>
            </>
          )}

          {uploading && (
            <div className="w-full space-y-4 py-2">
              <div className="flex items-center justify-center">
                 <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-indigo-500">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {url && !uploading && (
            <div className="flex items-center gap-4 w-full">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                  {file?.name || "File attached"}
                </p>
                <p className="text-xs text-emerald-500 font-medium tracking-wide uppercase">
                  Ready to submit
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500 shadow-sm border border-gray-100 dark:border-white/5 transition-colors z-20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && !uploading && (
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <p className="text-sm font-bold text-rose-500">{error}</p>
              <button 
                type="button"
                onClick={clearFile}
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-colors z-20"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline"
        >
          <Paperclip className="h-3 w-3" />
          Preview Attachment
        </a>
      )}
    </div>
  );
};
