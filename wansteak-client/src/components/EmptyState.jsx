import React from "react";

const EmptyState = ({ icon: Icon, title, message }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                {Icon && <Icon className="text-5xl text-gray-400" />}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                {message}
            </p>
        </div>
    );
};

export default EmptyState;