import { ProductCatalog } from "@/components/store/product-catalog";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  return (
    <main className="page-wrap py-5">
      <ProductCatalog
        title="Product Store"
        description="Visitors can browse available products and choose one to review."
      />
    </main>
  );
}
