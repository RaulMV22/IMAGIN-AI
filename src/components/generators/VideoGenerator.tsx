import { useState } from "react";
import { toast } from "react-toastify";
import "../../styles/globals.css";

interface VideoGeneratorProps {
  setIsGenerating: (value: boolean) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ setIsGenerating }) => {
  const defaultImage = "/images/default.jpg";
  const defaultPlaceholder = "Describe what the video should show";
  const [prompt, setPrompt] = useState(defaultPlaceholder);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateVideo = async () => {
    if (!prompt.trim() || prompt === defaultPlaceholder) {
      toast.error("Please enter a valid description.");
      return;
    }

    setLoading(true);
    setIsGenerating(true);
    setVideoUrl(null);
    setPrompt(defaultPlaceholder);

    try {
      const res = await fetch("/api/videoGenerator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        toast.error("No se pudo generar el video.");
      }
    } catch (error) {
      console.error("Error generando video:", error);
      toast.error("Error al generar el video.");
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !loading) {
      event.preventDefault();
      generateVideo();
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
          <button onClick={generateVideo} disabled={loading} className="generate-btn">
            {loading ? "Generating..." : "Generate Video"}
          </button>
        </div>

        <div className="generator-image-area">
          {videoUrl ? (
            <video controls className="generated-image" style={{ borderRadius: "12px" }}>
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta el video.
            </video>
          ) : (
            <img
              src={defaultImage}
              alt="Default placeholder"
              className={`generated-image ${loading ? "loading" : ""}`}
            />
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

export default VideoGenerator;
