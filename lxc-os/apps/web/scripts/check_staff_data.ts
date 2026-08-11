
import { prisma } from "../lib/prisma";

async function main() {
  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: ["account", "transport", "hostel", "library", "driver", "academics", "staff"]
      }
    },
    take: 5
  });
  console.log(JSON.stringify(staff, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
