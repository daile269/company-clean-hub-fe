"use client";
import { useState, useEffect, useRef } from "react";
import banksData from "@/utils/binBank.json";

type Bank = {
    shortName: string;
    name: string;
};

interface BankSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export default function BankSelect({ value, onChange }: BankSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState<Bank[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter banks based on search term
    useEffect(() => {
        const term = search.toLowerCase();
        const list = (banksData as any).data.filter((b: Bank) =>
            b.shortName.toLowerCase().includes(term) || b.name.toLowerCase().includes(term)
        );
        setFiltered(list);
    }, [search]);

    const selectedBank = (banksData as any).data.find((b: Bank) => b.shortName === value);

    return (
        <div className="relative" ref={containerRef}>
            {/* Closed state: show selected value or placeholder */}
            <div
                className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50"
                onClick={() => setOpen((prev) => !prev)}
            >
                {value ? selectedBank?.shortName + " - " + selectedBank?.name : "Chọn ngân hàng"}
            </div>

            {/* Open dropdown */}
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                    <input
                        type="text"
                        placeholder="Tìm ngân hàng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded"
                    />
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.map((bank) => (
                            <div
                                key={bank.shortName}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    onChange(bank.shortName);
                                    setOpen(false);
                                    setSearch("");
                                }}
                            >
                                {bank.shortName} - {bank.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
