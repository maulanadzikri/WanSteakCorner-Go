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
        // 1. Ubah flex-col agar di mobile elemen membentang ke bawah dengan rapi
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Bagian Kiri: Limit Data (Rata tengah di mobile) */}
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-center w-full md:w-auto">
                <span>Tampilkan</span>
                <select 
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:border-red-500 bg-white"
                >
                    {limitOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <span>dari {totalData} data</span>
            </div>

            {/* Bagian Kanan: Tombol Navigasi (Flex-1 agar tombol tidak gepeng) */}
            <div className="flex items-center justify-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    // Tambahkan whitespace-nowrap agar teks tidak turun baris
                    className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap flex-1 md:flex-none text-center ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                    Sebelumnya
                </button>
                
                {/* Teks Halaman (Lebih compact di mobile) */}
                <span className="px-2 py-2 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Hal {page} dari {totalPages || 1}
                </span>
                
                <button
                    onClick={() => onPageChange(page + 1)} 
                    disabled={page === totalPages || totalPages === 0}
                    // Tambahkan whitespace-nowrap agar teks tidak turun baris
                    className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap flex-1 md:flex-none text-center ${page === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                    Selanjutnya
                </button>
            </div>
            
        </div>
    )
};

export default Pagination;