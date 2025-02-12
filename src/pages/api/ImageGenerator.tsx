import { useState } from "react";
import { generateImage } from "./replicate";
import "./MainScreen.css";

const ImageGenerator = () => {
  const defaultImage = "/images/default.jpg";
  const defaultPlaceholder = "Insert a description to generate an image.";
  const [prompt, setPrompt] = useState<string>(defaultPlaceholder);
  const [imageUrl, setImageUrl] = useState<string>(defaultImage);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt === defaultPlaceholder) {
      alert("Please enter a valid description.");
      return;
    }

    setLoading(true);
    setImageUrl(defaultImage);
    setPrompt(defaultPlaceholder);

    const generatedImage = await generateImage(prompt);
    if (generatedImage) {
      setImageUrl(generatedImage);
    } else {
      setStatusMessage("No se pudo generar la imagen. Intenta con otro prompt.");
    }
    setLoading(false);
  };

  return (
    <div className="image-generator">
      <div className="input-area">
        <h1 className="title">AI Image Generator</h1>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="textarea"
          disabled={loading}
        />
        <button onClick={handleGenerate} disabled={loading} className="btn">
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
        <img src={imageUrl} alt="Generated" className="generated-image" />
      </div>
    </div>
  );
};

export default ImageGenerator;
