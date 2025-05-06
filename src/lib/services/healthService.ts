import { prisma } from "@/lib/db";

// Health record types
export interface CreateHealthRecordInput {
  userId: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string;
  medications?: string;
}

export interface UpdateHealthRecordInput {
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string;
  medications?: string;
}

// Vital sign types
export interface CreateVitalSignInput {
  healthRecordId: string;
  type: string;
  value: string;
  unit: string;
  recordedAt: Date;
  notes?: string;
}

export interface UpdateVitalSignInput {
  type?: string;
  value?: string;
  unit?: string;
  recordedAt?: Date;
  notes?: string;
}

// Medical appointment types
export interface CreateMedicalAppointmentInput {
  healthRecordId: string;
  doctor: string;
  specialty?: string;
  date: Date;
  reason?: string;
  notes?: string;
  completed?: boolean;
}

export interface UpdateMedicalAppointmentInput {
  doctor?: string;
  specialty?: string;
  date?: Date;
  reason?: string;
  notes?: string;
  completed?: boolean;
}

export const healthService = {
  // Health Records
  async getHealthRecord(userId: string) {
    const record = await prisma.healthRecord.findFirst({
      where: { userId },
      include: {
        vitalSigns: {
          orderBy: { recordedAt: 'desc' },
        },
        appointments: {
          orderBy: { date: 'asc' },
        },
      },
    });
    
    return record;
  },
  
  async createHealthRecord(data: CreateHealthRecordInput) {
    const record = await prisma.healthRecord.create({
      data,
      include: {
        vitalSigns: true,
        appointments: true,
      },
    });
    
    return record;
  },
  
  async updateHealthRecord(id: string, data: UpdateHealthRecordInput) {
    const record = await prisma.healthRecord.update({
      where: { id },
      data,
      include: {
        vitalSigns: true,
        appointments: true,
      },
    });
    
    return record;
  },
  
  // Vital Signs
  async getVitalSigns(healthRecordId: string) {
    const vitalSigns = await prisma.vitalSign.findMany({
      where: { healthRecordId },
      orderBy: { recordedAt: 'desc' },
    });
    
    return vitalSigns;
  },
  
  async getVitalSignsByType(healthRecordId: string, type: string) {
    const vitalSigns = await prisma.vitalSign.findMany({
      where: { 
        healthRecordId,
        type,
      },
      orderBy: { recordedAt: 'desc' },
    });
    
    return vitalSigns;
  },
  
  async createVitalSign(data: CreateVitalSignInput) {
    const vitalSign = await prisma.vitalSign.create({
      data,
    });
    
    return vitalSign;
  },
  
  async updateVitalSign(id: string, data: UpdateVitalSignInput) {
    const vitalSign = await prisma.vitalSign.update({
      where: { id },
      data,
    });
    
    return vitalSign;
  },
  
  async deleteVitalSign(id: string) {
    await prisma.vitalSign.delete({
      where: { id },
    });
    
    return true;
  },
  
  // Medical Appointments
  async getMedicalAppointments(healthRecordId: string) {
    const appointments = await prisma.medicalAppointment.findMany({
      where: { healthRecordId },
      orderBy: { date: 'asc' },
    });
    
    return appointments;
  },
  
  async getUpcomingAppointments(healthRecordId: string) {
    const now = new Date();
    
    const appointments = await prisma.medicalAppointment.findMany({
      where: { 
        healthRecordId,
        date: { gte: now },
        completed: false,
      },
      orderBy: { date: 'asc' },
    });
    
    return appointments;
  },
  
  async getMedicalAppointmentById(id: string) {
    const appointment = await prisma.medicalAppointment.findUnique({
      where: { id },
    });
    
    return appointment;
  },
  
  async createMedicalAppointment(data: CreateMedicalAppointmentInput) {
    const appointment = await prisma.medicalAppointment.create({
      data,
    });
    
    return appointment;
  },
  
  async updateMedicalAppointment(id: string, data: UpdateMedicalAppointmentInput) {
    const appointment = await prisma.medicalAppointment.update({
      where: { id },
      data,
    });
    
    return appointment;
  },
  
  async deleteMedicalAppointment(id: string) {
    await prisma.medicalAppointment.delete({
      where: { id },
    });
    
    return true;
  },
};