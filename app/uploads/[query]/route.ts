import {__DEV__} from "@heroui/shared-utils";
import path from "path";


export async function GET(request: Request, { params }: { params: Promise<{ query: string }> }) {

    const p = await params;
    const fileQuery = p.query;


    // try to load the file from the filesystem under /uploads/[query]
    // if it exists, return the file content
    // if it does not exist, return a 404 error
    const fs = require('fs');
    const path = require('path');
    const fullPath = __DEV__ ? path.join(process.cwd(), `/public/${fileQuery}`) : `/uploads/${fileQuery}`;
    if (!fs.existsSync(fullPath)) {
        return new Response(
            JSON.stringify({
                error: "File not found",
                filePath: fullPath
            }),
            {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
    // If the file exists, read its content and return it as an image response
    const fileContent = fs.readFileSync(fullPath);
    const fileExtension = path.extname(fullPath).toLowerCase();
    let contentType = "application/octet-stream"; // Default content type
    if (fileExtension === ".jpg" || fileExtension === ".jpeg") {
        contentType = "image/jpeg";
    } else if (fileExtension === ".png") {
        contentType = "image/png";
    } else if (fileExtension === ".gif") {
        contentType = "image/gif";
    } else if (fileExtension === ".webp") {
        contentType = "image/webp";
    }
    else if (fileExtension === ".svg") {
        contentType = "image/svg+xml";
    }
    return new Response(fileContent, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        },
    });
}


// Note: This code assumes that the file paths are safe and do not allow directory traversal attacks.
// now create POST method to upload files to the /uploads/[query] directory
export async function POST(request: Request, { params }: { params: Promise<{ query: string }> }) {
    const p = await params;
    const fileQuery = p.query;

    // Parse the incoming request as form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return new Response(
            JSON.stringify({ error: "No file provided" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Define the upload path
    const uploadPath = __DEV__ ? path.join(process.cwd(), `/public/_uploads/${fileQuery}`) : `/uploads/${fileQuery}`;

    // Ensure the directory exists
    const fs = require('fs');
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

    // Write the file to the filesystem
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(uploadPath, Buffer.from(buffer));



    return new Response(
        JSON.stringify({ message: "File uploaded successfully", filePath: uploadPath }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}

// Here is sample usage of the POST method from the client side:
// async function uploadFile(file) {
//     const formData = new FormData();
//     formData.append('file', file);
//     const response = await fetch(`/uploads/${file.name}`, {
//         method: 'POST',
//         body: formData,
//     });
//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(`Upload failed: ${errorData.error}`);
//     }
//     const data = await response.json();
//     console.log(data.message, data.filePath);
//     return data.filePath;
// }
