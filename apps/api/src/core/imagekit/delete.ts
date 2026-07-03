import { imagekit } from "./client.js"

export async function deleteFile(id: string) {
  try {
    await imagekit.files.delete(id)
    return {
      status: "success",
    }
  } catch (error: any) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
