import { Injectable, NotFoundException } from "@nestjs/common";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

type UploadResourceType = "map_cover" | "spot_image" | "profile_image";

type UploadTicket = {
  id: string;
  resourceType: UploadResourceType;
  fileName: string;
  contentType: string;
};

@Injectable()
export class UploadsService {
  private readonly uploadRoot = join(process.cwd(), "api", "storage", "uploads");
  private readonly tickets = new Map<string, UploadTicket>();

  async createUpload(resourceType: UploadResourceType, baseUrl: string) {
    await mkdir(this.uploadRoot, { recursive: true });

    const id = `upl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const fileName = `${id}.bin`;
    const ticket: UploadTicket = {
      id,
      resourceType,
      fileName,
      contentType: "application/octet-stream"
    };
    this.tickets.set(id, ticket);

    return {
      upload_url: `${baseUrl}/uploads/${id}`,
      file_url: `${baseUrl}/uploads/${id}/file`
    };
  }

  async storeUpload(uploadId: string, contentType: string | undefined, buffer: Buffer) {
    const ticket = this.tickets.get(uploadId);
    if (!ticket) {
      throw new NotFoundException("Upload ticket not found");
    }

    const normalizedContentType = contentType || "application/octet-stream";
    const extension = this.getExtension(normalizedContentType);
    const fileName = extension ? `${uploadId}${extension}` : ticket.fileName;
    const filePath = join(this.uploadRoot, fileName);
    const metaPath = join(this.uploadRoot, `${uploadId}.json`);

    await writeFile(filePath, buffer);
    await writeFile(
      metaPath,
      JSON.stringify({
        id: uploadId,
        resourceType: ticket.resourceType,
        fileName,
        contentType: normalizedContentType
      })
    );

    this.tickets.set(uploadId, {
      ...ticket,
      fileName,
      contentType: normalizedContentType
    });

    return {
      uploadId,
      fileName
    };
  }

  async getUploadFile(uploadId: string) {
    const metaPath = join(this.uploadRoot, `${uploadId}.json`);
    const rawMeta = await readFile(metaPath, "utf8").catch(() => null);
    if (!rawMeta) {
      throw new NotFoundException("Uploaded file not found");
    }

    const meta = JSON.parse(rawMeta) as UploadTicket;
    const filePath = join(this.uploadRoot, meta.fileName);
    await stat(filePath).catch(() => {
      throw new NotFoundException("Uploaded file not found");
    });

    return {
      stream: createReadStream(filePath),
      contentType: meta.contentType || "application/octet-stream"
    };
  }

  private getExtension(contentType: string) {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp"
    };
    return map[contentType] ?? extname(contentType) ?? "";
  }
}
