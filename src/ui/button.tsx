import { cn } from "../lib/utils";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md text-white font-bold transition-all duration-300 ease-in-out hover:opacity-80",
        className
      )}
      {...props}
    />
  )
}
