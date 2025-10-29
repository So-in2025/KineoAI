
import React from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, previewUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="relative cursor-pointer bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 hover:border-cyan-400 transition-colors duration-300 flex flex-col justify-center items-center h-64 w-full"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="object-contain h-full w-full rounded-md" />
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-slate-400">
              <span className="font-semibold text-cyan-400">Upload a photo</span> to start the scene
            </p>
            <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
          </div>
        )}
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
      </label>
    </div>
  );
};

export default FileUpload;