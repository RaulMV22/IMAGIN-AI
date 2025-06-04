// Importa el manejador de la API para la ruta especificada
import handler from "@/pages/api/lastGenerated";
// Importa la función para crear mocks de solicitudes HTTP
import { createMocks } from "node-mocks-http";

// Mock de Prisma para simular el comportamiento de la base de datos
jest.mock("@prisma/client", () => {
  return {
    // Crea una implementación simulada del cliente de Prisma
    PrismaClient: jest.fn().mockImplementation(() => ({
      // Simula el método findMany para obtener imágenes generadas
      generatedImage: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1, // ID de la imagen
            prompt: "Imagen test", // Prompt asociado a la imagen
            imageUrl: "https://example.com/image.jpg", // URL de la imagen generada
            createdAt: new Date("2024-01-01"), // Fecha de creación de la imagen
          },
        ]),
      },
      // Simula el método findMany para obtener videos generados
      generatedVideo: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 2, // ID del video
            prompt: "Video test", // Prompt asociado al video
            videoUrl: "https://example.com/video.mp4", // URL del video generado
            createdAt: new Date("2024-01-02"), // Fecha de creación del video
          },
        ]),
      },
    })),
  };
});

// Describe el conjunto de pruebas para la API /api/lastGenerated
describe("API /api/lastGenerated", () => {
  // Define una prueba para verificar la respuesta de la API
  it("devuelve 200 y lista combinada de imágenes y videos", async () => {
    // Crea mocks para la solicitud y respuesta
    const { req, res } = createMocks({ method: "GET" });
    // Llama al manejador de la API con la solicitud y respuesta mockeadas
    await handler(req, res);

    // Verifica que el código de estado de la respuesta sea 200
    expect(res._getStatusCode()).toBe(200);

    // Parsea los datos de la respuesta
    const data = JSON.parse(res._getData());
    // Verifica que la longitud de los datos sea 2 (1 video y 1 imagen)
    expect(data.length).toBe(2);
    // Verifica que el primer elemento sea un video
    expect(data[0].type).toBe("video");
    // Verifica que el segundo elemento sea una imagen
    expect(data[1].type).toBe("image");
  });

  // ❌ Test eliminado o comentado
});
