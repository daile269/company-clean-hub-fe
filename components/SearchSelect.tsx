"use client";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcons from "@fortawesome/free-solid-svg-icons";

export interface Option {
  id: string | number;
  label: string;
  subLabel?: string;
}

export interface SearchSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  icon?: any; // FontAwesome icon
  disabled?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
}

export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn giá trị",
  searchPlaceholder = "Tìm kiếm...",
  label,
  icon,
  disabled = false,
  showAllOption = false,
  allOptionLabel = "Tất cả",
  className = "",
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={dropdownRef}>
      {label && (
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider select-none">
          {label}
        </span>
      )}

      {/* Select button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {icon && (
            <FontAwesomeIcon icon={icon} className="text-gray-400 flex-shrink-0 text-xs" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.subLabel && (
            <span className="text-[10px] text-gray-400 truncate hidden sm:inline">
              ({selectedOption.subLabel})
            </span>
          )}
        </div>
        <FontAwesomeIcon
          icon={SolidIcons.faChevronDown}
          className={`text-[10px] text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-64 min-w-[200px]">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50/70">
            <FontAwesomeIcon icon={SolidIcons.faSearch} className="text-gray-400 text-xs ml-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent border-0 focus:outline-hidden text-xs py-1 text-gray-800 placeholder-gray-400"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 text-xs px-1 cursor-pointer"
              >
                <FontAwesomeIcon icon={SolidIcons.faTimes} />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="overflow-y-auto divide-y divide-gray-50 max-h-48">
            {showAllOption && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full px-4 py-2.5 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50/30 flex items-center justify-between cursor-pointer`}
              >
                <span>{allOptionLabel}</span>
                {!value && (
                  <FontAwesomeIcon icon={SolidIcons.faCheck} className="text-[10px] text-blue-600" />
                )}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-gray-400">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.id) === String(value);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected ? "bg-blue-50/30 font-semibold text-blue-600" : ""
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.subLabel && (
                        <span className="text-[10px] text-gray-400 truncate mt-0.5 font-normal">
                          {opt.subLabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <FontAwesomeIcon
                        icon={SolidIcons.faCheck}
                        className="text-[10px] text-blue-600 flex-shrink-0 ml-2"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
