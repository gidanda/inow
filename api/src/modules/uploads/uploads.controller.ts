import { Body, Controller, Get, Header, Param, Post, Put, Req, Res } from "@nestjs/common";
import { z } from "zod";

import { parseBody } from "../../common/validation";
import { UploadsService } from "./uploads.service";

@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  async createUpload(@Body() body: Record<string, unknown>, @Req() request: any) {
    const input = parseBody(
      z.object({
        resource_type: z.enum(["map_cover", "spot_image", "profile_image"])
      }),
      body
    );

    const baseUrl = `${request.protocol}://${request.get("host")}/api/v1`;
    return this.uploadsService.createUpload(input.resource_type, baseUrl);
  }

  @Put(":uploadId")
  async putUpload(@Param("uploadId") uploadId: string, @Req() request: any) {
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    await this.uploadsService.storeUpload(
      uploadId,
      typeof request.headers["content-type"] === "string" ? request.headers["content-type"] : undefined,
      Buffer.concat(chunks)
    );

    return { uploaded: true, upload_id: uploadId };
  }

  @Get(":uploadId/file")
  @Header("Cache-Control", "public, max-age=31536000, immutable")
  async getUploadFile(@Param("uploadId") uploadId: string, @Res() response: any) {
    const file = await this.uploadsService.getUploadFile(uploadId);
    response.setHeader("Content-Type", file.contentType);
    file.stream.pipe(response);
  }
}
