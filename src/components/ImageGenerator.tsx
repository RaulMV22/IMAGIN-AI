import { useState, useEffect } from "react";
import "../styles/globals.css";

const ImageGenerator = () => {
  const defaultImage = "/images/default.jpg";
  const defaultPlaceholder = "Insert a description to generate an image.";
  const [prompt, setPrompt] = useState<string>(defaultPlaceholder);
  const [imageUrl, setImageUrl] = useState<string>(defaultImage);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const generateImage = async () => {
    if (!prompt.trim() || prompt === defaultPlaceholder) {
      alert("Please enter a valid description.");
      return;
    }

    setLoading(true);
    setImageUrl(defaultImage);
    setPrompt(defaultPlaceholder);

    try {
      const response = await fetch("/api/imageGenerator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setStatusMessage("No se pudo generar la imagen. Intenta con otro prompt.");
      }
    } catch (error) {
      console.error("Error al generar la imagen:", error);
      setStatusMessage("Hubo un error al generar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  /* Función para limpiar el texto inicial cuando el usuario hace clic */
  const handleFocus = () => {
    if (prompt === defaultPlaceholder) {
      setPrompt("");
    }
  };

  /* Si el usuario deja vacío el textarea, vuelve al placeholder */
  const handleBlur = () => {
    if (prompt.trim() === "") {
      setPrompt(defaultPlaceholder);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !loading) {
      event.preventDefault(); 
      generateImage();
    }
  };

  return (
    <div className="image-generator-container">
      <div className="generator-content">
        {/* Entrada y Botón */}
        <div className="generator-input-area">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={handleFocus}  
            onBlur={handleBlur}    
            className="generator-textarea"
            disabled={loading} 
          />
          <button onClick={generateImage} disabled={loading} className="generate-btn">
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </div>

        {/* Imagen Generada con Bloqueo */}
        <div className="generator-image-area">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}
          <img src={imageUrl} alt="Generated Image" className="generated-image" />
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
