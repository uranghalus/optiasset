"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/logger";

/* =======================
   TYPES
   ======================= */
export type LoanArgs = {
  page?: number;
  pageSize?: number;
  assetId?: string;
  status?: string;
};

/* =======================
   GET ALL LOANS
   ======================= */
export async function getAllLoans({
  page = 1,
  pageSize = 10,
  assetId,
  status,
}: LoanArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const where: any = { organizationId: activeOrgId };
  if (assetId) where.assetId = assetId;
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.assetLoan.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        asset: {
          select: {
            barcode: true,
            item: { select: { name: true, code: true, serialNumber: true } },
          },
        },
        borrower: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.assetLoan.count({ where }),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

/* =======================
   REQUEST LOAN
   ======================= */
export async function requestLoanAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const assetId = formData.get("assetId")?.toString();
  const borrowerId = formData.get("borrowerId")?.toString();
  const dueDateStr = formData.get("dueDate")?.toString();
  const conditionOnLoan = formData.get("conditionOnLoan")?.toString() || null;
  const notes = formData.get("notes")?.toString() || null;

  if (!assetId || !borrowerId)
    throw new Error("Asset and Borrower are required");

  // Verify asset exists in this organization
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, organizationId: activeOrgId },
  });

  if (!asset) throw new Error("Asset not found");
  if (asset.status === "LOANED") throw new Error("Asset is already loaned");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Loan Record in PENDING state
    const loan = await tx.assetLoan.create({
      data: {
        assetId,
        borrowerId,
        requestedById: session.user.id,
        organizationId: activeOrgId,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        conditionOnLoan,
        notes,
        status: "PENDING",
      },
    });

    // 2. Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: "CREATE",
      entityType: "ASSET",
      entityId: assetId,
      entityInfo: `${asset.barcode || "N/A"} - ${asset.itemId || "N/A"}`,
      details: {
        action: "LOAN_REQUEST",
        borrowerId,
        dueDate: dueDateStr,
      },
      tx,
    });

    return loan;
  });

  revalidatePath("/assets");
  revalidatePath("/asset-loans");
  return result;
}

/* =======================
   APPROVE LOAN
   ======================= */
export async function approveLoanAction(loanId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const loan = await prisma.assetLoan.findFirst({
    where: { id: loanId, organizationId: activeOrgId },
    include: { asset: true },
  });

  if (!loan) throw new Error("Loan record not found");
  if (loan.status !== "PENDING")
    throw new Error("Loan is not in pending state");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Asset Status to LOANED
    await tx.asset.update({
      where: { id: loan.assetId },
      data: { status: "LOANED" },
    });

    // 2. Update Loan Record to BORROWED
    const updatedLoan = await tx.assetLoan.update({
      where: { id: loanId },
      data: {
        status: "BORROWED",
        approvedById: session.user.id,
        loanDate: new Date(),
      },
    });

    // 3. Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: "UPDATE",
      entityType: "ASSET",
      entityId: loan.assetId,
      entityInfo: `${loan.asset.barcode || "N/A"} - ${loan.asset.itemId || "N/A"}`,
      details: {
        action: "LOAN_APPROVED",
        loanId,
        approvedBy: session.user.name,
      },
      tx,
    });

    return updatedLoan;
  });

  revalidatePath("/assets");
  revalidatePath("/asset-loans");
  return result;
}

/* =======================
   REJECT LOAN
   ======================= */
export async function rejectLoanAction(loanId: string, reason: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const loan = await prisma.assetLoan.findFirst({
    where: { id: loanId, organizationId: activeOrgId },
    include: { asset: true },
  });

  if (!loan) throw new Error("Loan record not found");
  if (loan.status !== "PENDING")
    throw new Error("Loan is not in pending state");

  const result = await prisma.$transaction(async (tx) => {
    // Update Loan Record to REJECTED
    const updatedLoan = await tx.assetLoan.update({
      where: { id: loanId },
      data: {
        status: "REJECTED",
        approvedById: session.user.id,
        rejectionReason: reason,
      },
    });

    // Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: "UPDATE",
      entityType: "ASSET",
      entityId: loan.assetId,
      entityInfo: `${loan.asset.barcode || "N/A"} - ${loan.asset.itemId || "N/A"}`,
      details: {
        action: "LOAN_REJECTED",
        loanId,
        reason,
      },
      tx,
    });

    return updatedLoan;
  });

  revalidatePath("/asset-loans");
  return result;
}

/* =======================
   RETURN ASSET
   ======================= */
export async function returnAssetAction(loanId: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const conditionOnReturn =
    formData.get("conditionOnReturn")?.toString() || null;
  const notes = formData.get("notes")?.toString() || null;

  const loan = await prisma.assetLoan.findFirst({
    where: { id: loanId, organizationId: activeOrgId },
    include: { asset: true },
  });

  if (!loan) throw new Error("Loan record not found");
  if (loan.status === "RETURNED") throw new Error("Asset is already returned");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Asset Status
    await tx.asset.update({
      where: { id: loan.assetId },
      data: { status: "ACTIVE" },
    });

    // 2. Update Loan Record
    const updatedLoan = await tx.assetLoan.update({
      where: { id: loanId },
      data: {
        returnDate: new Date(),
        conditionOnReturn,
        notes: notes || loan.notes,
        status: "RETURNED",
      },
    });

    // 3. Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: "UPDATE",
      entityType: "ASSET",
      entityId: loan.assetId,
      entityInfo: `${loan.asset.barcode || "N/A"} - ${loan.asset.itemId || "N/A"}`,
      details: {
        action: "RETURN",
        loanId,
        conditionOnReturn,
      },
      tx,
    });

    return updatedLoan;
  });

  revalidatePath("/assets");
  revalidatePath("/asset-loans");
  return result;
}
