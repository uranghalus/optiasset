import { prisma } from "./lib/prisma";

async function test() {
  console.log(
    "Prisma keys:",
    Object.keys(prisma).filter((k) => !k.startsWith("_")),
  );
  // @ts-ignore
  console.log("AssetHistory property:", prisma.assetHistory);
  // @ts-ignore
  console.log("assethistory property:", prisma.assethistory);
}

test();
