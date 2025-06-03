import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface MediaData {
  url: string;
  prompt: string;
  type: "image" | "video";
}

interface RecentImagesProps {
  latestGenerated?: { imageUrl: string; prompt: string };
}

const RecentImages: React.FC<RecentImagesProps> = ({ latestGenerated }) => {
  const [recentItems, setRecentItems] = useState<MediaData[]>([]);

  useEffect(() => {
    fetch("/api/lastGenerated")
      .then((res) => res.json())
      .then((data) => setRecentItems(data))
      .catch(() => toast.error("Error al cargar los medios"));
  }, []);

  const allItems = latestGenerated
    ? [
        {
          url: latestGenerated.imageUrl,
          prompt: latestGenerated.prompt,
          type: "image",
        },
        ...recentItems.filter((item) => item.url !== latestGenerated.imageUrl),
      ]
    : recentItems;

  const downloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Error al descargar el archivo.");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("¡Enlace copiado!");
  };

  if (allItems.length === 0) return null;

  return (
    <div style={{ marginTop: "60px" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
        Últimos generados
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {allItems.map((item, idx) => (
          <div
            key={idx}
            className="image-container hover-overlay"
            style={{ position: "relative", maxWidth: "180px", textAlign: "center" }}
          >
            {item.type === "video" ? (
              <video src={item.url} controls style={{ borderRadius: "12px", width: "100%" }} />
            ) : (
              <img
                src={item.url}
                alt={`Generado ${idx}`}
                style={{ borderRadius: "12px", width: "100%", display: "block" }}
              />
            )}

            <div className="image-actions">
              <button
                className="action-icon"
                onClick={() => downloadFile(item.url, `generated-${idx}.${item.type === "video" ? "mp4" : "jpg"}`)}
              >
                📥
              </button>
              <button className="action-icon" onClick={() => copyToClipboard(item.url)}>
                🔗
              </button>
            </div>
            <p style={{ fontSize: "0.8rem", marginTop: "8px" }}>{item.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentImages;
