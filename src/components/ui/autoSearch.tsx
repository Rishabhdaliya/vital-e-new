"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AutoSearchProps {
  cities: string[];
  onSelect: (city: string) => void;
  disabled?: boolean;
  defaultValue?: string;
}

export function AutoSearch({
  cities,
  onSelect,
  defaultValue = "",
  disabled = false,
}: AutoSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between -mt-1 bg-white"
        >
          {value || "Select City..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-white">
        <Command>
          <CommandInput placeholder="Search city..." className="h-9 " />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {cities.map((currentCity) => (
                <CommandItem
                  key={currentCity}
                  value={currentCity}
                  onSelect={() => {
                    setValue(currentCity);
                    onSelect(currentCity);
                    setOpen(false);
                  }}
                >
                  <span>{currentCity}</span>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === currentCity ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
