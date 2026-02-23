import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <main className="page-wrap py-5">
      <div className="mx-auto max-w-4xl">
        <ProductForm
          mode="create"
          initialData={{
            name: "",
            slug: "",
            description: "",
            image: "",
            category: "",
            isActive: true,
            categories: [{ name: "", displayOrder: 0, options: [{ label: "", displayOrder: 0 }] }],
          }}
        />
      </div>
    </main>
  );
}
