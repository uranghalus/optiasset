import { prisma } from "../lib/prisma";

async function getNextItemCode(assetType: "FIXED" | "SUPPLY") {
  const prefix = assetType === "FIXED" ? "F-ITM-" : "S-ITM-";

  const lastItem = await prisma.item.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  let nextNumber = 1;
  if (lastItem) {
    // Extract number from code (e.g., F-ITM-001 -> 001)
    const match = lastItem.code.slice(prefix.length);
    const parsed = parseInt(match, 10);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
}

async function test() {
  console.log("Testing FIXED...");
  const fixed = await getNextItemCode("FIXED");
  console.log("Next FIXED Code:", fixed);

  console.log("Testing SUPPLY...");
  const supply = await getNextItemCode("SUPPLY");
  console.log("Next SUPPLY Code:", supply);
}

test().catch(console.error);
