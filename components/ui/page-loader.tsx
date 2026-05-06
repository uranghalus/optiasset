export function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-background">
      {/* <!-- From Uiverse.io by Javierrocadev -->  */}
      <div className="flex flex-row gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:.7s]"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:.7s]"></div>
      </div>
    </div>
  );
}
