import { NextRequest, NextResponse } from "next/server";
import { readFile, existsSync } from "fs";
import { promisify } from "util";
import path from "path";

const readFileAsync = promisify(readFile);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    // En Next.js 15+, params puede ser una Promise
    const resolvedParams = await Promise.resolve(params);
    const { filename } = resolvedParams;
    
    // Validar que el filename sea seguro (sin path traversal)
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 });
    }

    // Usar ruta relativa al proyecto o absoluta dependiendo del entorno
    const storageBase = process.env.STORAGE_PATH || path.join(process.cwd(), "storage");
    const filePath = path.join(storageBase, "security", "pic", filename);
    
    console.log("🖼️ Intentando servir imagen:", {
      filename,
      filePath,
      exists: existsSync(filePath),
      storageBase,
      cwd: process.cwd()
    });

    if (!existsSync(filePath)) {
      console.error("❌ Archivo no encontrado:", filePath);
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
    }

    // Leer el archivo
    const fileBuffer = await readFileAsync(filePath);
    
    // Determinar el tipo MIME basado en la extensión
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
    };
    
    const contentType = mimeTypes[ext] || "image/jpeg";

    console.log("✅ Imagen servida exitosamente:", {
      filename,
      contentType,
      size: fileBuffer.length
    });

    // Devolver la imagen con los headers apropiados
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("❌ Error al servir imagen:", error);
    return NextResponse.json(
      { error: "Error al cargar la imagen" },
      { status: 500 }
    );
  }
}

