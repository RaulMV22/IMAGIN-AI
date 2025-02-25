"use client"

import { useState } from "react"
import { Image, Video, AudioLines, Sparkles } from "lucide-react"
import ImageGenerator from "../src/components/ImageGenerator"

const generators = [
  { type: "image", Icon: Image, description: "Generate stunning images with AI", color: "from-blue-500 to-cyan-500" },
  { type: "video", Icon: Video, description: "Create amazing videos with AI", color: "from-pink-500 to-rose-500" },
  { type: "audio", Icon: AudioLines, description: "Produce realistic audio with AI", color: "from-green-500 to-emerald-500" },
]

export default function ClientPage() {
  const [selectedGenerator, setSelectedGenerator] = useState(generators[0].type)
  const [isGenerating, setIsGenerating] = useState(false) // ✅ Estado para bloquear botones

  const selectedGen = generators.find((g) => g.type === selectedGenerator)

  return (
    <div className="container">
      <h1 className="title">
        AI Content Generator 
        <Sparkles className="sparkle-icon" />
      </h1>

      {/* Selector de generadores */}
      <div className="generator-selector">
        {generators.map((generator) => (
          <button
            key={generator.type}
            className={`generator-btn ${selectedGenerator === generator.type ? "active" : ""} ${
              isGenerating ? "disabled" : "" /* ✅ Oscurecer y deshabilitar botones */
            }`}
            onClick={() => !isGenerating && setSelectedGenerator(generator.type)} // ✅ Bloquea clicks
            disabled={isGenerating} // ✅ Deshabilita el botón
          >
            <generator.Icon className="generator-icon" />
            {generator.type.charAt(0).toUpperCase() + generator.type.slice(1)}
          </button>
        ))}
      </div>

      {/* Contenido dinámico según selección */}
      <div className="generator-card">
        <div className="generator-header">
          <h2 className="generator-title">
            {selectedGen && <selectedGen.Icon className="generator-title-icon" />}
            {selectedGenerator.charAt(0).toUpperCase() + selectedGenerator.slice(1)} Generator
          </h2>
          <p className="generator-description">{selectedGen?.description}</p>
        </div>
        <div className="generator-content">
          {selectedGenerator === "image" ? (
            <ImageGenerator setIsGenerating={setIsGenerating} /> // ✅ Pasa el estado al generador
          ) : (
            <p className="placeholder-section">
              The {selectedGenerator} generator is coming soon! 
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
