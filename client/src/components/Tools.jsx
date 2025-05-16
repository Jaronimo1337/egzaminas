import { useState } from 'react';
import FilterRange from './FilterRange';
import Sort from './Sort';

export default function Tools({
    priceRange,
    setPriceRange,
    dateRange,
    setDateRange,
    minDate,
    maxDate,
    onSortChange,
    sortValue,
    resetFilters,
}) {
    const [isToolsVisible, setIsToolsVisible] = useState(false);

    const toggleToolsVisibility = () => {
        setIsToolsVisible((prev) => !prev);
    };

    return (
        <div className="mb-4">
            <button
                onClick={toggleToolsVisibility}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Tools
            </button>

            {isToolsVisible && (
                <div className="">
                    <FilterRange
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                    <Sort onSortChange={onSortChange} sortValue={sortValue} />
                    <button
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
}
