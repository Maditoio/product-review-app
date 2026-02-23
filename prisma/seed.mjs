import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const juiceCategoryTemplates = [
  {
    name: "Taste & Flavour",
    options: [
      "Authentic",
      "Fresh fruit taste",
      "Natural sweetness (sweetness feels fruit-derived)",
      "Balanced flavor",
      "Bright and refreshing",
      "Smells fresh and floral",
    ],
  },
  {
    name: "Ingredient Quality",
    options: [
      "No artificial colors or preservatives",
      "No synthetic flavor enhancers",
      "No synthetic sweeteners",
      "Clear labeling and transparency",
    ],
  },
  {
    name: "Texture & Freshness",
    options: [
      "Smooth with enjoyable light acidity",
      "Not thick or overly pulpy",
      "Perfectly refreshing when served cold",
      "Refrigerator storage",
    ],
  },
  {
    name: "Packaging & Presentation",
    options: [
      "Eco-conscious packaging",
      "Secure sealing",
      "Clear nutritional information",
      "Comfortable for both everyday use and special occasions",
    ],
  },
  {
    name: "Value for Money",
    options: [
      "Premium natural product",
      "Higher fruit concentration",
      "Absence of additives",
      "The unique taste justifies a higher price point",
    ],
  },
];

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function upsertProduct({ name, slug, description, category, isActive, categories }) {
  await prisma.product.upsert({
    where: { slug },
    create: {
      name,
      slug,
      description,
      category,
      isActive,
      categories: {
        create: categories.map((cat, catIdx) => ({
          name: cat.name,
          displayOrder: catIdx,
          options: {
            create: cat.options.map((label, optIdx) => ({
              label,
              displayOrder: optIdx,
            })),
          },
        })),
      },
    },
    update: {
      name,
      description,
      category,
      isActive,
      categories: {
        deleteMany: {},
        create: categories.map((cat, catIdx) => ({
          name: cat.name,
          displayOrder: catIdx,
          options: {
            create: cat.options.map((label, optIdx) => ({
              label,
              displayOrder: optIdx,
            })),
          },
        })),
      },
    },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || (await hash("admin12345", 10));

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  for (let i = 1; i <= 5; i++) {
    const name = `Juice ${i}`;
    await upsertProduct({
      name,
      slug: slugify(name),
      description: "Seasonal fresh fruit juice crafted for balanced flavor.",
      category: "JUICES",
      isActive: true,
      categories: juiceCategoryTemplates,
    });
  }

  await upsertProduct({
    name: "Beignets",
    slug: "beignets",
    description: "Classic beignets evaluated for texture and frying quality.",
    category: "BEIGNETS",
    isActive: true,
    categories: [
      {
        name: "Quality Indicators",
        options: [
          "Minimal oil absorption",
          "Freshly fried",
          "Light and airy",
          "Properly fermented",
          "Lightly crisp outside",
          "Cloud-soft inside",
          "Uniform puffing",
          "No dark or bitter spots",
          "Clean fry — no residual oil flavor",
        ],
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
