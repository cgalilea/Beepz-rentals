import { prisma } from "../lib/prisma";

export class InvestorService {
  async list() {
    return prisma.investor.findMany({ orderBy: { createdAt: "desc" } });
  }

  async getById(id: string) {
    return prisma.investor.findUnique({
      where: { id },
      include: { profitShares: { include: { vehicle: true } } },
    });
  }

  async create(data: { name: string; email: string; phone: string }) {
    return prisma.investor.create({ data });
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string }) {
    return prisma.investor.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.investor.delete({ where: { id } });
  }
}

export const investorService = new InvestorService();
