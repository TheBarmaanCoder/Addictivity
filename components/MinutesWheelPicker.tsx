import React, { useRef, useEffect, useCallback } from 'react';
import { selectionChanged } from '../lib/haptics';

const ROW_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const VIEWPORT_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PADDING_Y = ROW_HEIGHT * 2;

const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => i); // 0..23
const MINUTES_OPTIONS = Array.from({ length: 60 }, (_, i) => i); // 0..59 (1 min increments)

interface WheelColumnProps {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
}

const WheelColumn: React.FC<WheelColumnProps> = ({ options, value, onChange, label, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIndexRef = useRef<number>(() => {
    const i = options.indexOf(value);
    return i >= 0 ? i : 0;
  });

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, options.length - 1));
    el.scrollTop = clamped * ROW_HEIGHT;
  }, [options.length]);

  useEffect(() => {
    const idx = options.indexOf(value);
    if (idx >= 0) {
      lastIndexRef.current = idx;
      scrollToIndex(idx);
    }
  }, [value, options, scrollToIndex]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(index, options.length - 1));
    const newValue = options[clamped];
    if (clamped !== lastIndexRef.current) {
      lastIndexRef.current = clamped;
      onChange(newValue);
      selectionChanged();
    }
  }, [onChange, options]);

  return (
    <div className={`relative flex flex-col items-center ${className}`} style={{ height: VIEWPORT_HEIGHT }}>
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-[88px] bg-gradient-to-b from-surface to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[88px] bg-gradient-to-t from-surface to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 right-0 z-0 border-y border-forest-green/20 bg-forest-green/5"
        style={{ top: ROW_HEIGHT * 2, height: ROW_HEIGHT }}
        aria-hidden
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory no-scrollbar w-full"
        style={{
          height: VIEWPORT_HEIGHT,
          scrollSnapType: 'y mandatory',
          paddingTop: PADDING_Y,
          paddingBottom: PADDING_Y,
        }}
        role="listbox"
        aria-label={label}
      >
        {options.map((opt) => {
          const isSelected = opt === value;
          return (
            <div
              key={opt}
              className="flex items-center justify-center snap-center transition-all duration-100"
              style={{ height: ROW_HEIGHT }}
              role="option"
              aria-selected={isSelected}
            >
              <span
                className={`font-semibold transition-all duration-100 ${
                  isSelected ? 'text-forest-green text-2xl scale-110' : 'text-txt-secondary text-lg opacity-50'
                }`}
              >
                {opt}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface MinutesWheelPickerProps {
  value: number;
  onChange: (totalMinutes: number) => void;
  className?: string;
}

const MinutesWheelPicker: React.FC<MinutesWheelPickerProps> = ({ value, onChange, className = '' }) => {
  const hours = Math.min(23, Math.floor(value / 60));
  const minutes = Math.min(59, value % 60);

  const handleHoursChange = useCallback(
    (h: number) => {
      onChange(h * 60 + minutes);
    },
    [minutes, onChange]
  );

  const handleMinutesChange = useCallback(
    (m: number) => {
      onChange(hours * 60 + m);
    },
    [hours, onChange]
  );

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <WheelColumn
        options={HOURS_OPTIONS}
        value={hours}
        onChange={handleHoursChange}
        label="Hours"
        className="flex-1 max-w-[72px]"
      />
      <span className="text-xl font-semibold text-txt-secondary pb-2">h</span>
      <WheelColumn
        options={MINUTES_OPTIONS}
        value={minutes}
        onChange={handleMinutesChange}
        label="Minutes"
        className="flex-1 max-w-[72px]"
      />
      <span className="text-xl font-semibold text-txt-secondary pb-2">m</span>
    </div>
  );
};

export default MinutesWheelPicker;
