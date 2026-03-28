interface HeaderProps {
  title: string;
  userInitials: string;
  onAvatarClick?: () => void;
}

export function Header({ title, userInitials, onAvatarClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5 px-4 h-[68px] flex items-center justify-between shadow-sm max-w-[420px] mx-auto">
      <h1 className="text-[18px] font-semibold text-content-primary tracking-tight">
        {title}
      </h1>
      
      <button 
        onClick={onAvatarClick}
        className="size-[40px] rounded-full bg-white flex items-center justify-center text-bg-primary font-bold text-[14px] shadow-card active:scale-95 transition-transform"
      >
        <span>{userInitials}</span>
      </button>
    </header>
  );
}

export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[390px] animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass p-4 rounded-[20px] h-[200px] flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="h-5 w-40 bg-white/10 rounded-md" />
            <div className="h-5 w-20 bg-white/10 rounded-full" />
          </div>
          <div className="h-4 w-32 bg-white/10 rounded-md" />
          <div className="h-4 w-48 bg-white/10 rounded-md" />
          <div className="mt-auto h-8 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}
