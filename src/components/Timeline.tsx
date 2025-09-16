interface TimelineProps {
  startDate?: Date;
  days?: number;
}

export function Timeline({ startDate = new Date(), days = 7 }: TimelineProps) {
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="min-w-max">
      {/* Date headers */}
      <div className="flex border-b border-gray-300">
        {dates.map((date, i) => (
          <div key={i} className="w-96 px-4 py-3 border-r border-gray-300 bg-white">
            <div className="font-semibold text-gray-800">
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Hour grid */}
      <div className="flex">
        {dates.map((date, dayIndex) => (
          <div key={dayIndex} className="w-96 border-r border-gray-300">
            {/* Hour markers */}
            <div className="grid grid-cols-24 h-20">
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className="border-r border-gray-200 text-xs text-gray-500 p-1"
                  style={{ borderRightStyle: hour % 6 === 5 ? 'solid' : 'dotted' }}
                >
                  {hour % 6 === 0 && `${hour}:00`}
                </div>
              ))}
            </div>

            {/* Content area for blocks */}
            <div className="relative h-96 bg-gray-50">
              {/* Vertical hour lines */}
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-l border-gray-200"
                  style={{
                    left: `${(hour / 24) * 100}%`,
                    borderLeftStyle: hour % 6 === 0 ? 'solid' : 'dotted'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}