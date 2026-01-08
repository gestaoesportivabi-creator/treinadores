import React from 'react';
import { Dumbbell } from 'lucide-react';

export const Academia: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="bg-black p-6 rounded-3xl border border-zinc-900 shadow-lg">
                <div className="flex items-center justify-center flex-col py-16">
                    <Dumbbell size={64} className="text-[#00f0ff] mb-6 opacity-50" />
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide mb-4">
                        Academia
                    </h2>
                    <p className="text-zinc-500 text-sm font-bold text-center max-w-md">
                        Esta funcionalidade estará disponível em breve.
                    </p>
                </div>
            </div>
        </div>
    );
};

