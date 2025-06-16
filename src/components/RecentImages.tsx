import { useEffect, useState } from "react";

interface ImageData {
  imageUrl: string;
  prompt: string;
}

const RecentImages = () => {
  const [recentImages, setRecentImages] = useState<ImageData[]>([]);

  useEffect(() => {
    fetch("/api/lastGenerated")
      .then((res) => res.json())
      .then((data) => setRecentImages(data));
  }, []);

  if (recentImages.length === 0) return null;

  return (
    <div style={{ marginTop: "60px" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
        Últimos generados
      </h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        {recentImages.map((img, idx) => (
          <div key={idx} style={{ maxWidth: "180px", textAlign: "center" }}>
            <img src={img.imageUrl} alt={`Generado ${idx}`} style={{ borderRadius: "12px", width: "100%" }} />
            <p style={{ fontSize: "0.8rem", marginTop: "8px" }}>{img.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentImages;
