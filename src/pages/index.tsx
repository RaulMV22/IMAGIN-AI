import Head from "next/head";
import { useState } from "react";
import ImageGenerator from "@/components/generators/ImageGenerator";
import VideoGenerator from "@/components/generators/VideoGenerator";
import RecentImages from "@/components/RecentImages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [, setIsGenerating] = useState(false);
  const [latestGenerated, setLatestGenerated] = useState<{
    imageUrl: string;
    prompt: string;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<"image" | "video" | "audio">("image");

  const renderGenerator = () => {
    switch (selectedTab) {
      case "image":
        return (
          <>
            <ImageGenerator
              setIsGenerating={setIsGenerating}
              onImageGenerated={(img) => setLatestGenerated(img)}
            />
            <RecentImages latestGenerated={latestGenerated!} />
          </>
        );
      case "video":
        return <VideoGenerator setIsGenerating={setIsGenerating} />;
      case "audio":
        return <p style={{ marginTop: "2rem" }}>Audio generator coming soon...</p>;
    }
  };

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
          <button
            className={`tab-button ${selectedTab === "image" ? "selected" : ""}`}
            onClick={() => setSelectedTab("image")}
          >
            Image
          </button>
          <button
            className={`tab-button ${selectedTab === "video" ? "selected" : ""}`}
            onClick={() => setSelectedTab("video")}
          >
            Video
          </button>
          <button
            className={`tab-button ${selectedTab === "audio" ? "selected" : ""}`}
            onClick={() => setSelectedTab("audio")}
            disabled
          >
            Audio
          </button>
        </div>

        {renderGenerator()}
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
