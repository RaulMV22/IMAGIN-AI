import { useState, useEffect } from "react";
import "./MainScreen.css";

const MainScreen = () => {
  const defaultImage = "/images/default.jpg"; // Imagen por defecto
  const defaultPlaceholder = "Insert a description to generate an image."; // Texto por defecto
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
    setImageUrl(defaultImage); // Reinicia la imagen a la por defecto
    setPrompt(defaultPlaceholder); // Restablece el texto del textarea

    try {
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log("Respuesta de la API en el frontend:", data);

      if (data.imageUrl) {
        setImageUrl(data.imageUrl); // Carga la nueva imagen cuando se recibe
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

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Manejar el evento cuando el usuario hace clic en el textarea
  const handleFocus = () => {
    if (prompt === defaultPlaceholder) {
      setPrompt("");
    }
  };

  // Manejar cuando el usuario deja de escribir y no puso nada
  const handleBlur = () => {
    if (prompt.trim() === "") {
      setPrompt(defaultPlaceholder);
    }
  };

  // Manejar la tecla "Enter" en el textarea
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !loading) {
      event.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="main-container">
      <div className="input-area">
        <h1 className="title">AI Image Generator</h1>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={handleFocus} 
          onBlur={handleBlur} 
          onKeyDown={handleKeyDown} 
          className="textarea"
          disabled={loading} 
        />
        <button onClick={generateImage} disabled={loading} className="btn">
          {loading ? "Generating..." : "Generate Image"}
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>

      <div className="image-area">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <img src={imageUrl} alt="Generated Image" className={`generated-image ${loading ? "blurred" : ""}`} />
      </div>
    </div>
  );
};

export default MainScreen;
