import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Image upload function
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }
    
    // Validate file size (max 3MB)
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 3MB limit" },
        { status: 400 }
      );
    }
    
    // Read file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Get custom filename if provided
    const customFilename = formData.get("filename") as string;
    const isMainBanner = formData.get("isMainBanner") === "true" || customFilename === "mainevent";
    
    // Create filename
    let finalFileName;
    
    // Handle main banner case
    if (isMainBanner) {
      finalFileName = "mainevent.jpg"; // Always use this name for main banner
    } else if (customFilename) {
      // Use custom filename if provided
      finalFileName = customFilename.replace(/\s/g, "-").toLowerCase();
      // Add file extension if not present
      if (!path.extname(finalFileName)) {
        const ext = path.extname(file.name) || '.jpg';
        finalFileName = `${finalFileName}${ext}`;
      }
    } else {
      // Create a simple name without long timestamps or random strings
      const baseName = path.basename(file.name, path.extname(file.name))
                          .replace(/\s/g, "-")
                          .toLowerCase();
      const ext = path.extname(file.name) || '.jpg';
      
      // Add a short date code for uniqueness
      const date = new Date();
      const dateCode = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      
      finalFileName = `${baseName}-${dateCode}${ext}`;
    }
    
    // Create paths
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    const filePath = path.join(publicImagesDir, finalFileName);
    
    try {
      // Ensure the directory exists
      await mkdir(publicImagesDir, { recursive: true });
      
      // Write the file
      await writeFile(filePath, buffer);
      
      // Create a URL that browsers can access
      const url = `/images/${finalFileName}`;
      
      // Success response
      return NextResponse.json(
        { 
          url, 
          size: file.size,
          type: file.type,
          name: finalFileName
        }, 
        { status: 201 }
      );
    } catch (err) {
      console.error("Error saving file:", err);
      return NextResponse.json(
        { error: "Failed to save file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 