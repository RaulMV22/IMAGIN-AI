/** 
 * Import the PrismaClient from the Prisma library to interact with the database.
 */
import { PrismaClient } from "@prisma/client"; 

/** 
 * Import the types for Next.js API request and response objects.
 */
import type { NextApiRequest, NextApiResponse } from "next"; 

/** 
 * Create an instance of the PrismaClient to perform database operations.
 */
const prisma = new PrismaClient(); 

/** 
 * Define an asynchronous API route handler function to manage incoming requests.
 * 
 * @param req - The incoming HTTP request object.
 * @param res - The outgoing HTTP response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
  try {
    /** 
     * Retrieve the latest 25 generated images from the database, 
     * ordering them by their creation date in descending order.
     */
    const images = await prisma.generatedImage.findMany({ 
      orderBy: { createdAt: "desc" }, // Sort images by creation date.
      take: 25, // Limit the results to 25 records.
    });

    /** 
     * Send a successful response (HTTP 200) with the retrieved images in JSON format. 
     */
    return res.status(200).json(images); 
  } catch (error) {
    /** 
     * Log any errors that occur during the database operation to the console.
     */
    console.error("Error al obtener las imágenes:", error); 

    /** 
     * Send an error response (HTTP 500) indicating that there was an issue loading the images. 
     */
    return res.status(500).json({ error: "Error al cargar las imágenes" }); 
  } 
}
