import Head from "next/head";
import { useState } from "react";
import ImageGenerator from "@/components/generators/ImageGenerator";
import RecentImages from "@/components/RecentImages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [, setIsGenerating] = useState(false);
  const [latestGenerated, setLatestGenerated] = useState<{
    imageUrl: string;
    prompt: string;
  } | null>(null);

  return (
    <>
      <Head>
        <title>IMAGIN-AI</title>
        <meta name="description" content="Generador IA" />
      </Head>

      <main style={{ padding: "2rem", textAlign: "center", maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
          AI Content Generator
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "3rem" }}>
          <button className="tab-button selected">Image</button>
          <button className="tab-button" disabled>Video</button>
          <button className="tab-button" disabled>Audio</button>
        </div>

        <ImageGenerator
          setIsGenerating={setIsGenerating}
          onImageGenerated={(img) => setLatestGenerated(img)}
        />

        <RecentImages latestGenerated={latestGenerated!} />
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
