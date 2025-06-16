import { useState } from "react";
import { toast } from "react-toastify";
import "../../styles/ImageGenerator.css";

interface ImageGeneratorProps {
  setIsGenerating: (value: boolean) => void;
  onImageGenerated: (img: { imageUrl: string; prompt: string }) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ setIsGenerating, onImageGenerated }) => {
  const defaultImage = "/images/default.jpg";
  const defaultPlaceholder = "Describe la imagen que quieres generar...";
  const [prompt, setPrompt] = useState<string>(defaultPlaceholder);
  const [imageUrl, setImageUrl] = useState<string>(defaultImage);
  const [loading, setLoading] = useState<boolean>(false);

  const isGeneratedImage = imageUrl !== defaultImage;

  const generateImage = async () => {
    if (!prompt.trim() || prompt === defaultPlaceholder) {
      toast.error("Por favor, ingresa una descripción válida.");
      return;
    }

    setLoading(true);
    setIsGenerating(true);
    setImageUrl(defaultImage);
    setPrompt(defaultPlaceholder);

    try {
      const res = await fetch("/api/imageGenerator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        onImageGenerated({ imageUrl: data.imageUrl, prompt });
      } else {
        toast.error("No se pudo generar la imagen.");
      }
    } catch (err) {
      toast.error("Error al generar imagen.");
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const handleFocus = () => {
    if (prompt === defaultPlaceholder) setPrompt("");
  };

  const handleBlur = () => {
    if (prompt.trim() === "") setPrompt(defaultPlaceholder);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      generateImage();
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    toast.success("¡Enlace copiado!");
  };

  const downloadImage = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "generated-image.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Error al descargar la imagen.");
    }
  };

  return (
    <div className="generator-grid">
      <div className="generator-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="prompt-input"
        />
        <button onClick={generateImage} disabled={loading} className="generate-button">
          {loading ? "Generando..." : "Generar imagen"}
        </button>
      </div>

      <div className="image-preview">
        <img src={imageUrl} alt="Generated" className={`preview-image ${loading ? "loading" : ""}`} />

        {isGeneratedImage && !loading && (
          <div className="image-overlay">
            <button className="action-icon" onClick={() => downloadImage(imageUrl)}>📥</button>
            <button className="action-icon" onClick={() => copyToClipboard(imageUrl)}>🔗</button>
          </div>
        )}

        {loading && (
          <div className="loading-spinner"></div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
