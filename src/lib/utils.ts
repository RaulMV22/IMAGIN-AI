import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función para combinar clases de Tailwind evitando conflictos.
 */
export function cn(...inputs: (string | undefined | boolean)[]) {
  return twMerge(clsx(inputs));
}
