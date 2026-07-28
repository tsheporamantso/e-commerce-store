import { prisma } from "../lib/prisma";
import products from "./products.json" with { type: "json" };

async function main() {
  await prisma.product.createMany({
    data: products,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
