import React from "react";
import { HiOutlineExclamation } from 'react-icons/hi'

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Ya, Yakin", cancelText = "Batal" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all animate-fade-in-up">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineExclamation className="text-red-600 text-4xl" />
                </div>

                <h3 className="font-bold text-gray-800 text-xl mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-6">{message}</p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 tansition w-full"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition w-full"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
};

export default ConfirmModal;