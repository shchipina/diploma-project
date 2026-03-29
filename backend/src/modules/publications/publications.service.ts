import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { MinioService } from '@modules/minio/minio.service';

const PublicationStatus = {
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
} as const;
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { QueryPublicationDto } from './dto/query-publication.dto';

@Injectable()
export class PublicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async create(
    userId: string,
    dto: CreatePublicationDto,
    image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.minio.uploadFile(image, 'publications');
    }

    const tagConnections = dto.tags?.length
      ? await this.upsertTags(dto.tags)
      : [];

    return this.prisma.publication.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl,
        authorId: userId,
        tags: {
          create: tagConnections.map((tagId) => ({ tagId })),
        },
      },
      include: {
        author: { select: { id: true, email: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  async update(
    userId: string,
    publicationId: string,
    dto: UpdatePublicationDto,
    image?: Express.Multer.File,
  ) {
    const publication = await this.findOneOrFail(publicationId);
    if (publication.authorId !== userId) {
      throw new ForbiddenException('Ви не можете редагувати цю публікацію');
    }

    let imageUrl = publication.imageUrl;
    if (image) {
      if (publication.imageUrl) {
        await this.minio.deleteFile(publication.imageUrl);
      }
      imageUrl = await this.minio.uploadFile(image, 'publications');
    }

    if (dto.tags !== undefined) {
      await this.prisma.publicationTag.deleteMany({
        where: { publicationId },
      });
      if (dto.tags.length > 0) {
        const tagIds = await this.upsertTags(dto.tags);
        await this.prisma.publicationTag.createMany({
          data: tagIds.map((tagId) => ({ publicationId, tagId })),
        });
      }
    }

    return this.prisma.publication.update({
      where: { id: publicationId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        imageUrl,
        status: PublicationStatus.PENDING,
      },
      include: {
        author: { select: { id: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { savedBy: true } },
      },
    });
  }

  async delete(userId: string, publicationId: string) {
    const publication = await this.findOneOrFail(publicationId);
    if (publication.authorId !== userId) {
      throw new ForbiddenException('Ви не можете видалити цю публікацію');
    }

    if (publication.imageUrl) {
      await this.minio.deleteFile(publication.imageUrl);
    }

    await this.prisma.publication.delete({ where: { id: publicationId } });
    return { message: 'Публікацію видалено' };
  }

  async findMyPublications(userId: string, query: QueryPublicationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      authorId: userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, email: true } },
          tags: { include: { tag: true } },
          _count: { select: { savedBy: true } },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPublished(query: QueryPublicationDto) {
    const { page = 1, limit = 20, search, tag } = query;
    const skip = (page - 1) * limit;

    const where = {
      status: PublicationStatus.PUBLISHED,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tag && {
        tags: { some: { tag: { name: tag } } },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, email: true } },
          tags: { include: { tag: true } },
          _count: { select: { savedBy: true } },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPopular(query: QueryPublicationDto) {
    const { page = 1, limit = 20, search, tag } = query;
    const skip = (page - 1) * limit;

    const where = {
      status: PublicationStatus.PUBLISHED,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tag && {
        tags: { some: { tag: { name: tag } } },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ viewCount: 'desc' }, { savedBy: { _count: 'desc' } }],
        include: {
          author: { select: { id: true, email: true } },
          tags: { include: { tag: true } },
          _count: { select: { savedBy: true } },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findForYou(userId: string, query: QueryPublicationDto) {
    const { page = 1, limit = 20, tag } = query;
    const skip = (page - 1) * limit;

    const savedTags = await this.prisma.savedPublication.findMany({
      where: { userId },
      select: {
        publication: {
          select: { tags: { select: { tagId: true } } },
        },
      },
    });

    const tagIds = [
      ...new Set(
        savedTags.flatMap((s) => s.publication.tags.map((t) => t.tagId)),
      ),
    ];

    const tagFilter = tag
      ? { tags: { some: { tag: { name: tag } } } }
      : tagIds.length > 0
        ? { tags: { some: { tagId: { in: tagIds } } } }
        : {};

    const where = {
      status: PublicationStatus.PUBLISHED,
      authorId: { not: userId },
      ...tagFilter,
    };

    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, email: true } },
          tags: { include: { tag: true } },
          _count: { select: { savedBy: true } },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(publicationId: string, userId?: string) {
    const publication = await this.prisma.publication.update({
      where: { id: publicationId },
      data: { viewCount: { increment: 1 } },
      include: {
        author: { select: { id: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { savedBy: true } },
      },
    });

    if (!publication) {
      throw new NotFoundException('Публікацію не знайдено');
    }

    let isSaved = false;
    if (userId) {
      const saved = await this.prisma.savedPublication.findUnique({
        where: {
          userId_publicationId: { userId, publicationId },
        },
      });
      isSaved = !!saved;
    }

    return { ...publication, isSaved };
  }

  async toggleSave(userId: string, publicationId: string) {
    await this.findOneOrFail(publicationId);

    const existing = await this.prisma.savedPublication.findUnique({
      where: {
        userId_publicationId: { userId, publicationId },
      },
    });

    if (existing) {
      await this.prisma.savedPublication.delete({
        where: {
          userId_publicationId: { userId, publicationId },
        },
      });
      return { saved: false };
    }

    await this.prisma.savedPublication.create({
      data: { userId, publicationId },
    });
    return { saved: true };
  }

  async findSaved(userId: string, query: QueryPublicationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [items, total] = await Promise.all([
      this.prisma.savedPublication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { savedAt: 'desc' },
        include: {
          publication: {
            include: {
              author: { select: { id: true, email: true } },
              tags: { include: { tag: true } },
              _count: { select: { savedBy: true } },
            },
          },
        },
      }),
      this.prisma.savedPublication.count({ where }),
    ]);

    return {
      items: items.map((s) => s.publication),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findSavedIds(userId: string): Promise<string[]> {
    const saved = await this.prisma.savedPublication.findMany({
      where: { userId },
      select: { publicationId: true },
    });
    return saved.map((s) => s.publicationId);
  }

  async findPendingForModeration(query: QueryPublicationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      status: PublicationStatus.PENDING,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, email: true } },
          tags: { include: { tag: true } },
          _count: { select: { savedBy: true } },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllForModeration(query: QueryPublicationDto & { status?: string }) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;

    const validStatuses = ['PENDING', 'PUBLISHED', 'REJECTED'] as const;
    const statusValue =
      status && validStatuses.includes(status as (typeof validStatuses)[number])
        ? (status as (typeof validStatuses)[number])
        : undefined;

    const where = {
      ...(statusValue && { status: statusValue }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, email: true } },
          tags: { include: { tag: true } },
          _count: { select: { savedBy: true } },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async moderatePublication(
    publicationId: string,
    status: 'PUBLISHED' | 'REJECTED',
  ) {
    const publication = await this.findOneOrFail(publicationId);

    return this.prisma.publication.update({
      where: { id: publication.id },
      data: { status },
      include: {
        author: { select: { id: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { savedBy: true } },
      },
    });
  }

  async getModerationStats() {
    const [pending, published, rejected, total] = await Promise.all([
      this.prisma.publication.count({
        where: { status: PublicationStatus.PENDING },
      }),
      this.prisma.publication.count({
        where: { status: PublicationStatus.PUBLISHED },
      }),
      this.prisma.publication.count({
        where: { status: PublicationStatus.REJECTED },
      }),
      this.prisma.publication.count(),
    ]);

    return { pending, published, rejected, total };
  }

  async getAllTags() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { publications: true } } },
    });
  }

  private async findOneOrFail(publicationId: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { id: publicationId },
    });
    if (!publication) {
      throw new NotFoundException('Публікацію не знайдено');
    }
    return publication;
  }

  private async upsertTags(tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];

    for (const name of tagNames) {
      const normalized = name.trim();
      if (!normalized) continue;

      const tag = await this.prisma.tag.upsert({
        where: { name: normalized },
        update: {},
        create: { name: normalized },
      });
      tagIds.push(tag.id);
    }

    return tagIds;
  }
}
