// Temporary fix for Prisma types not being recognized
// This file can be deleted once VSCode picks up the types correctly

export * from '@prisma/client';

declare module '@prisma/client' {
  // This forces TypeScript to re-evaluate the module
}