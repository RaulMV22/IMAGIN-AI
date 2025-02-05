import { useState } from "react";

const MainScreen = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert("Por favor ingresa una descripción para generar la imagen.");
      return;
    }

    setLoading(true);
    setStatusMessage("Generando imagen... Esto puede tardar hasta 5 minutos.");

    try {
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log("Respuesta de la API en el frontend:", data);

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setStatusMessage("Imagen generada con éxito.");
      } else {
        console.warn("No se recibió una imagen válida:", data);
        setStatusMessage("No se pudo generar la imagen. Intenta con otro prompt.");
      }
    } catch (error) {
      console.error("Error al generar la imagen:", error);
      setStatusMessage("Hubo un error al generar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Generador de Imágenes con IA</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe la imagen que deseas generar"
        style={{ width: "300px", height: "100px" }}
      />
      <br />
      <button onClick={generateImage} disabled={loading}>
        {loading ? "Generando..." : "Generar Imagen"}
      </button>
      <p>{statusMessage}</p>
      {imageUrl && (
        <div>
          <h2>Imagen Generada:</h2>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default MainScreen;
