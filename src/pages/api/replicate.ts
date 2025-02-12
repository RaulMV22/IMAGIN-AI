export const generateImage = async (prompt: string): Promise<string | null> => {
  if (!prompt.trim()) {
      console.warn("El prompt está vacío o no es válido.");
      return null;
  }

  try {
      const response = await fetch("/api/replicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
          throw new Error(`Error en la API: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Respuesta de la API:", data);

      return data.imageUrl || null;
  } catch (error) {
      console.error("Error al generar la imagen:", error);
      return null;
  }
};

export default generateImage;
