
import { AssetType } from "./generated/prisma/client";

async function test() {
    const dataPromise = Promise.resolve([{ item: { name: "", code: "", assetType: "FIXED" as AssetType } }]);
    const totalPromise = Promise.resolve(10);
    
    const [data, total] = await Promise.all([dataPromise, totalPromise]);
    console.log(data, total);
}
