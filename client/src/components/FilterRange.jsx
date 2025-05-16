import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

export default function FilterRange({
    priceRange,
    setPriceRange,
    dateRange,
    setDateRange,
    minDate,
    maxDate,
}) {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 p-4">
            <div className="flex flex-col items-center">
                <label className="mb-2 font-semibold text-lg text-gray-700 text-center">
                    Price Range: {priceRange[0]} - {priceRange[1]}
                </label>
                <RangeSlider
                    className="w-full max-w-md"
                    min={0}
                    max={5000}
                    value={priceRange}
                    onInput={setPriceRange}
                />
            </div>
            <div className="flex flex-col items-center">
                <label className="mb-2 font-semibold text-lg text-gray-700 text-center">
                    Date Range: {new Date(dateRange[0]).toLocaleDateString()} -{' '}
                    {new Date(dateRange[1]).toLocaleDateString()}
                </label>
                <RangeSlider
                    className="w-full max-w-md"
                    min={minDate}
                    max={maxDate}
                    value={dateRange}
                    onInput={(newValue) => {
                        setDateRange([
                            Math.max(newValue[0], minDate),
                            Math.min(newValue[1], maxDate),
                        ]);
                    }}
                />
            </div>
        </div>
    );
}
