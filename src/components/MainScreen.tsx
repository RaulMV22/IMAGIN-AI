import { useState, useEffect } from "react";
import './MainScreen.css';

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

  // Desaparecer el mensaje de estado después de 5 segundos
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  return (
    <div className="main-container">
      <div className="input-area">
        <h1 className="title">Generador de Imágenes con IA</h1>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe la imagen que deseas generar"
          className="textarea"
        />
        <br />
        <button onClick={generateImage} disabled={loading} className="btn">
          {loading ? "Generando..." : "Generar Imagen"}
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
      <div className="image-area">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Imagen generada"
            className="generated-image"
          />
        )}
      </div>
    </div>
  );
};

export default MainScreen;      