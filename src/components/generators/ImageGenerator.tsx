import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/globals.css";

interface ImageGeneratorProps {
  setIsGenerating: (value: boolean) => void;
  onImageGenerated: (img: { imageUrl: string; prompt: string }) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ setIsGenerating, onImageGenerated }) => {
  const defaultImage = "/images/default.jpg";
  const defaultPlaceholder = "Insert a description to generate an image.";
  const [prompt, setPrompt] = useState<string>(defaultPlaceholder);
  const [imageUrl, setImageUrl] = useState<string>(defaultImage);
  const [loading, setLoading] = useState<boolean>(false);

  const generateImage = async () => {
    if (!prompt.trim() || prompt === defaultPlaceholder) {
      toast.error("Please enter a valid description.");
      return;
    }

    setLoading(true);
    setIsGenerating(true);
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
        onImageGenerated({ imageUrl: data.imageUrl, prompt });
      } else {
        toast.error("No se pudo generar la imagen. Intenta con otro prompt.");
      }
    } catch (error) {
      console.error("Error al generar la imagen:", error);
      toast.error("Hubo un error al generar la imagen.");
    } finally {
      setLoading(false);
      setIsGenerating(false);
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

  const copyToClipboard = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    toast.success("¡Enlace copiado!");
  };

  const downloadImage = async (url: string, filename = "generated-image.jpg") => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error al descargar la imagen:", error);
    toast.error("Error al descargar la imagen.");
  }
};


  const isGeneratedImage = imageUrl !== defaultImage;

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

        <div className={`generator-image-area ${isGeneratedImage ? "hover-overlay" : ""}`}>
          <img
            src={imageUrl}
            alt="Generated Image"
            className={`generated-image ${loading ? "loading" : ""}`}
          />
          {isGeneratedImage && (
            <div className="image-actions">
              <button
                className="action-icon"
                onClick={() => downloadImage(imageUrl, "generated-image.jpg")}

              >
                📥
              </button>
              <button
                className="action-icon"
                onClick={() => copyToClipboard(imageUrl)}
              >
                🔗
              </button>
            </div>
          )}
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
