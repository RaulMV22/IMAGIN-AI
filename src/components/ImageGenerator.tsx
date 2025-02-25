import { useState, useEffect } from "react";
import "../styles/globals.css";

interface ImageGeneratorProps {
  setIsGenerating: (value: boolean) => void; // ✅ Especificamos el tipo correctamente
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ setIsGenerating }) => {
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
    setIsGenerating(true); // ✅ Bloquea la selección del generador mientras carga
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
      setIsGenerating(false); // ✅ Permite cambiar de generador cuando termine
    }
  };

  const handleFocus = () => {
    if (prompt === defaultPlaceholder) {
      setPrompt("");
    }
  };

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
        <div className="generator-input-area">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="generator-textarea"
            disabled={loading}
          />
          <button onClick={generateImage} disabled={loading} className="generate-btn">
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </div>

        {/* Imagen Generada con Bloqueo */}
        <div className="generator-image-area">
          <img 
            src={imageUrl} 
            alt="Generated Image" 
            className={`generated-image ${loading ? "loading" : ""}`} 
          />
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
