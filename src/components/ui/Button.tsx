import { clsx } from "clsx";

export const Button = ({ children, variant = 'primary', className, ...props }: any) => {
  const styles = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20",
    secondary: "bg-surface border border-border hover:bg-white/5 text-gray-300",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
  };
  
  return (
    <button 
      className={clsx("px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 active:scale-95", styles[variant as keyof typeof styles], className)} 
      {...props}
    >
      {children}
    </button>
  );
};
