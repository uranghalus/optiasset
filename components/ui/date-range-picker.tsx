"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({
    onChange,
}: {
    onChange?: (range: DateRange | undefined) => void
}) {
    const [date, setDate] = React.useState<DateRange | undefined>()

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range)
        onChange?.(range)
    }

    return (
        <Popover>
            <PopoverTrigger asChild className="w-full">
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "dd MMM yyyy")} -{" "}
                                {format(date.to, "dd MMM yyyy")}
                            </>
                        ) : (
                            format(date.from, "dd MMM yyyy")
                        )
                    ) : (
                        <span>Pilih range tanggal</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0">
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                    className=""
                />
            </PopoverContent>
        </Popover>
    )
}