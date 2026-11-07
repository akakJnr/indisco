import type {
  ProviderDeleteFileDTO,
  ProviderFileResultDTO,
  ProviderGetFileDTO,
  ProviderUploadFileDTO,
} from "@medusajs/framework/types"
import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import { v2 as cloudinary } from "cloudinary"

type Options = {
  cloud_name: string
  api_key: string
  api_secret: string
  folder?: string
}

/**
 * Stores uploaded files (product images, etc.) in Cloudinary.
 * A file's key is its Cloudinary public id.
 */
class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary"

  protected options_: Options

  static validateOptions(options: Record<string, unknown>) {
    for (const key of ["cloud_name", "api_key", "api_secret"]) {
      if (!options[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Cloudinary option "${key}" is required.`
        )
      }
    }
  }

  constructor(_container: Record<string, unknown>, options: Options) {
    super()
    this.options_ = options
    cloudinary.config({
      cloud_name: options.cloud_name,
      api_key: options.api_key,
      api_secret: options.api_secret,
      secure: true,
    })
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    const baseName = file.filename.replace(/\.[^.]+$/, "")
    const result = await cloudinary.uploader.upload(
      `data:${file.mimeType};base64,${file.content}`,
      {
        folder: this.options_.folder ?? "indisco",
        public_id: `${baseName}-${Date.now()}`,
        resource_type: "auto",
        overwrite: false,
      }
    )

    return { url: result.secure_url, key: result.public_id }
  }

  async delete(
    files: ProviderDeleteFileDTO | ProviderDeleteFileDTO[]
  ): Promise<void> {
    const list = Array.isArray(files) ? files : [files]
    await Promise.all(
      list.map((file) =>
        cloudinary.uploader.destroy(file.fileKey, { resource_type: "image" })
      )
    )
  }

  async getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
    return cloudinary.url(fileData.fileKey, { secure: true })
  }
}

export default CloudinaryFileProviderService
