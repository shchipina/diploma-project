import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get('MINIO_BUCKET', 'publications');
    this.client = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: Number(this.configService.get('MINIO_PORT', 9000)),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'admin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'password'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code !== 'BucketAlreadyOwnedByYou' &&
        code !== 'BucketAlreadyExists'
      ) {
        throw err;
      }
    }

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };
    try {
      await this.client.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy),
      );
    } catch {
      // Policy might already be set
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const stream = Readable.from(file.buffer);

    await this.client.putObject(this.bucketName, fileName, stream, file.size, {
      'Content-Type': file.mimetype,
    });

    const port = Number(this.configService.get<number>('MINIO_PORT', 9000));
    const endpoint = this.configService.get<string>(
      'MINIO_ENDPOINT',
      'localhost',
    );
    const protocol =
      this.configService.get('MINIO_USE_SSL', 'false') === 'true'
        ? 'https'
        : 'http';

    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const objectName = url.pathname.replace(`/${this.bucketName}/`, '');
      await this.client.removeObject(this.bucketName, objectName);
    } catch {
      // File might not exist or URL is invalid
    }
  }
}
