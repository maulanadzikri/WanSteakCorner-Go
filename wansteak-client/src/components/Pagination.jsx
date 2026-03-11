import React from "react";

const Pagination = ({
    page,
    limit,
    totalPages,
    totalData,
    onPageChange,
    onLimitChange,
    limitOptions = [5, 10, 20, 30, 50, 80]
}) => {
    return (
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Tampilkan</span>
                <select 
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-red-500"
                >
                    {limitOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-600">dari {totalData} data</span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                    Sebelumnya
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                    Hal {page} dari {totalPages || 1}
                </span>
                <button
                    onClick={() => onPageChange(page + 1)} 
                    disabled={page === totalPages || totalPages === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${page === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                    Selanjutnya
                </button>
            </div>
        </div>
    )
};

export default Pagination;