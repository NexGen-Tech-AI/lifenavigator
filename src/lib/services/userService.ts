import { prisma } from "@/lib/db";
import { hash } from "bcrypt";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
}

export const userService = {
  async createUser({ name, email, password }: CreateUserInput) {
    const hashedPassword = await hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    // Create default settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });
    
    return user;
  },
  
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });
    
    return user;
  },
  
  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    return user;
  },
  
  async updateUser(id: string, data: UpdateUserInput) {
    let updateData = { ...data };
    
    // If password is being updated, hash it
    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    return user;
  },
  
  async updateUserSettings(userId: string, settings: any) {
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings,
      },
    });
    
    return updatedSettings;
  },
};