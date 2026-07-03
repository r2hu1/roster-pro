import { toFile } from "@imagekit/nodejs"
import { imagekit } from "./client.js"

export async function uploadFile(file: Buffer, fileName: string) {
  try {
    const uploadResult = await imagekit.files.upload({
      file: await toFile(file, fileName),
      fileName,
    })
    return {
      status: "success",
      url: uploadResult.url,
      id: uploadResult.fileId,
    }
  } catch (error: any) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      url: null,
      id: null,
    }
  }
}
