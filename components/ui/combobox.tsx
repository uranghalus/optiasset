/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useDebounce } from "@/hooks/use-debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, LoaderIcon } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./command";

interface Props<T extends object> {
    title?: string;
    value?: T;
    valueKey: keyof T;
    disabled?: boolean;
    size?: number;
    renderText: (value: T) => string;
    onChange?: (value: T) => void;
    searchFn: (search: string, offset: number, size: number) => Promise<T[]>;
}

export const Combobox = <T extends object>({
    title,
    value,
    valueKey,
    disabled = false,
    size = 25,
    renderText,
    onChange,
    searchFn,
}: Props<T>) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const [options, setOptions] = useState<T[]>([]);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const requestIdRef = useRef(0);

    // 🔥 fetch awal / search
    const getOptions = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setIsLoading(true);

        const result = await searchFn(debouncedSearch || "", 0, size);

        // 🛑 ignore jika request lama
        if (requestId !== requestIdRef.current) return;

        setOptions(result);
        setCanLoadMore(result.length >= size);
        setIsLoading(false);
    }, [debouncedSearch, searchFn, size]);

    // 🔥 load more
    const getMoreOptions = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setIsLoading(true);

        const result = await searchFn(
            debouncedSearch || "",
            options.length,
            size
        );

        if (requestId !== requestIdRef.current) return;

        if (result.length === 0) {
            setCanLoadMore(false);
        } else {
            setOptions((prev) => [...prev, ...result]);
            setCanLoadMore(result.length >= size);
        }

        setIsLoading(false);
    }, [debouncedSearch, searchFn, options.length, size]);

    // 🔥 reset saat search berubah
    useEffect(() => {
        setCanLoadMore(true);
        getOptions();
    }, [getOptions]);

    // 🔥 ensure selected value masuk options
    useEffect(() => {
        if (value) {
            setOptions((prev) => {
                const exists = prev.some(
                    (item) => item[valueKey] === value[valueKey]
                );
                return exists ? prev : [value, ...prev];
            });
        }
    }, [value, valueKey]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <div className="truncate">
                        {value ? renderText(value) : `Select ${title}`}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={`Search ${title}...`}
                        value={search}
                        onValueChange={setSearch}
                    />

                    <CommandList className="w-full">
                        <CommandEmpty>No item found.</CommandEmpty>

                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option[valueKey] as string}
                                    value={option[valueKey] as string}
                                    onSelect={() => {
                                        onChange?.(option);
                                        setOpen(false); // 🔥 close setelah pilih
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            option[valueKey] === value?.[valueKey]
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {renderText(option)}
                                </CommandItem>
                            ))}

                            {canLoadMore && (
                                <CommandItem
                                    onSelect={getMoreOptions}
                                    disabled={isLoading}
                                    className="justify-center"
                                >
                                    {isLoading ? (
                                        <LoaderIcon className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Load More ↓"
                                    )}
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};