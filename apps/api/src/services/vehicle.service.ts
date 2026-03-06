import { Decimal } from "@prisma/client/runtime/library";
import { ProfitParticipantType } from "@prisma/client";
import { prisma } from "../lib/prisma";

interface ProfitShareInput {
  participantType: ProfitParticipantType;
  investorId?: string | null;
  percentage: number;
}

interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  profitShares: ProfitShareInput[];
}

interface UpdateVehicleInput {
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  status?: string;
  profitShares?: ProfitShareInput[];
}

function validateProfitShares(shares: ProfitShareInput[]) {
  const hasBeepz = shares.some((s) => s.participantType === "BEEPZ");
  if (!hasBeepz) {
    throw new Error("Every vehicle must have a BEEPZ profit share");
  }

  for (const share of shares) {
    if (share.participantType === "BEEPZ" && share.investorId) {
      throw new Error("BEEPZ participant must not have an investorId");
    }
    if (share.participantType === "INVESTOR" && !share.investorId) {
      throw new Error("INVESTOR participant must have an investorId");
    }
  }

  const investorIds = shares
    .filter((s) => s.participantType === "INVESTOR")
    .map((s) => s.investorId);
  const uniqueIds = new Set(investorIds);
  if (uniqueIds.size !== investorIds.length) {
    throw new Error("The same investor cannot appear twice for the same vehicle");
  }

  const total = shares.reduce((sum, s) => sum + s.percentage, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Profit shares must total 100%, got ${total}%`);
  }
}

export class VehicleService {
  async list() {
    return prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      include: { profitShares: { include: { investor: true } } },
    });
  }

  async getById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: { profitShares: { include: { investor: true } } },
    });
  }

  async create(input: CreateVehicleInput) {
    validateProfitShares(input.profitShares);

    return prisma.vehicle.create({
      data: {
        make: input.make,
        model: input.model,
        year: input.year,
        licensePlate: input.licensePlate,
        vin: input.vin,
        profitShares: {
          create: input.profitShares.map((s) => ({
            participantType: s.participantType,
            investorId: s.investorId || null,
            percentage: new Decimal(s.percentage),
          })),
        },
      },
      include: { profitShares: { include: { investor: true } } },
    });
  }

  async update(id: string, input: UpdateVehicleInput) {
    const { profitShares, ...vehicleData } = input;

    if (profitShares) {
      validateProfitShares(profitShares);
    }

    return prisma.$transaction(async (tx) => {
      if (Object.keys(vehicleData).length > 0) {
        await tx.vehicle.update({ where: { id }, data: vehicleData as any });
      }

      if (profitShares) {
        await tx.vehicleProfitShare.deleteMany({ where: { vehicleId: id } });
        await tx.vehicleProfitShare.createMany({
          data: profitShares.map((s) => ({
            vehicleId: id,
            participantType: s.participantType,
            investorId: s.investorId || null,
            percentage: new Decimal(s.percentage),
          })),
        });
      }

      return tx.vehicle.findUnique({
        where: { id },
        include: { profitShares: { include: { investor: true } } },
      });
    });
  }

  async delete(id: string) {
    return prisma.vehicle.delete({ where: { id } });
  }
}

export const vehicleService = new VehicleService();
