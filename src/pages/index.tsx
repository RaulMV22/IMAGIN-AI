import Head from "next/head";
import { useState } from "react";
import ImageGenerator from "@/components/generators/ImageGenerator";
import RecentImages from "@/components/RecentImages";

export default function Home() {
  const [, setIsGenerating] = useState(false);

  return (
    <>
      <Head>
        <title>IMAGIN-AI</title>
        <meta name="description" content="Generador IA" />
      </Head>

      <main style={{ padding: "2rem", textAlign: "center", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Selector de tipo */}
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
          AI Content Generator
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "3rem" }}>
          <button className="tab-button selected">Image</button>
          <button className="tab-button" disabled>Video</button>
          <button className="tab-button" disabled>Audio</button>
        </div>

        {/* Generador activo */}
        <ImageGenerator setIsGenerating={setIsGenerating} />

        {/* Últimos generados (SIEMPRE abajo del todo) */}
        <RecentImages />
      </main>
    </>
  );
}
