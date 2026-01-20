import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no debe superar los 5MB" }, { status: 400 });
    }

    // Crear directorio si no existe
    // Usar ruta relativa al proyecto o absoluta dependiendo del entorno
    const storageBase = process.env.STORAGE_PATH || path.join(process.cwd(), "storage");
    const uploadDir = path.join(storageBase, "security", "pic");
    console.log("📁 Directorio de upload:", uploadDir);
    console.log("📁 Directorio existe:", existsSync(uploadDir));
    console.log("📁 process.cwd():", process.cwd());
    console.log("📁 STORAGE_PATH:", process.env.STORAGE_PATH);
    
    if (!existsSync(uploadDir)) {
      console.log("📁 Creando directorio:", uploadDir);
      await mkdir(uploadDir, { recursive: true });
      console.log("✅ Directorio creado exitosamente");
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;
    const filepath = path.join(uploadDir, filename);
    
    console.log("📝 Información del archivo:", {
      originalName: file.name,
      filename,
      filepath,
      uploadDir
    });

    // Convertir File a Buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Verificar que el archivo se guardó correctamente
    const fileExists = existsSync(filepath);
    console.log("✅ Archivo guardado:", {
      filename,
      filepath,
      uploadDir,
      relativePath: `/api/pictogram/image/${filename}`,
      fullPath: filepath,
      fileExists,
      bufferSize: buffer.length
    });

    if (!fileExists) {
      console.error("⚠️ ADVERTENCIA: El archivo no existe después de guardarlo:", filepath);
    }

    return NextResponse.json({ 
      filename,
      message: "Imagen subida correctamente" 
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}

