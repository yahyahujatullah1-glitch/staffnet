import { X } from "lucide-react";

export const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-surface border border-border w-full max-w-lg rounded-xl shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-border bg-white/5">
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);
