import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ImageData {
  imageUrl: string;
  prompt: string;
}

interface RecentImagesProps {
  latestGenerated?: ImageData;
}

const RecentImages: React.FC<RecentImagesProps> = ({ latestGenerated }) => {
  const [recentImages, setRecentImages] = useState<ImageData[]>([]);

  useEffect(() => {
    fetch("/api/lastGenerated")
      .then((res) => res.json())
      .then((data) => setRecentImages(data));
  }, []);

  const copyToClipboard = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    toast.success("¡Enlace copiado!");
  };

  const allImages = latestGenerated
    ? [latestGenerated, ...recentImages.filter(img => img.imageUrl !== latestGenerated.imageUrl)]
    : recentImages;

  if (allImages.length === 0) return null;

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


  return (
    <div style={{ marginTop: "60px" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
        Últimos generados
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", width: "100%", }}
>
        {allImages.map((img, idx) => (
          <div
            key={idx}
            className="image-container hover-overlay"
            style={{ position: "relative", maxWidth: "180px", textAlign: "center" }}
          >
            <img
              src={img.imageUrl}
              alt={`Generado ${idx}`}
              style={{ borderRadius: "12px", width: "100%", display: "block" }}
            />
            <div className="image-actions">
              <button
                className="action-icon"
                onClick={() => downloadImage(img.imageUrl, `generated-${idx}.jpg`)}

              >
                📥
              </button>
              <button
                className="action-icon"
                onClick={() => copyToClipboard(img.imageUrl)}
              >
                🔗
              </button>
            </div>
            <p style={{ fontSize: "0.8rem", marginTop: "8px" }}>{img.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentImages;
