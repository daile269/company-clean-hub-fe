'use client';

import React from 'react';

export interface ImageUploaderProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  helpText?: string;
  aspectRatio?: 'square' | 'video'; // square = aspect-square, video = aspect-video
  width?: string; // width class like 'w-7/12', 'w-full'
  multiple?: boolean;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onChange,
  isLoading = false,
  loadingText = 'Đang tải...',
  emptyText = 'Chưa có hình ảnh',
  helpText = 'Click để chọn hoặc kéo thả ảnh',
  aspectRatio = 'video',
  width = 'w-7/12',
  multiple = true,
  disabled = false,
}) => {
  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div className="flex items-center justify-center p-4 relative">
      <label
        className={`${width} ${aspectClass} border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50 relative ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={onChange}
          disabled={isLoading || disabled}
          className="hidden"
        />

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-xs font-medium text-gray-600">{loadingText}</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isLoading ? loadingText : emptyText}
          </p>
          <p className="text-xs text-gray-500">
            {isLoading ? '' : helpText}
          </p>
        </div>
      </label>
    </div>
  );
};
