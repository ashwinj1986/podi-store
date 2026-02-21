"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import type { Product, Sku } from "@/types";

type ProductWithSkus = Product & { skus: Sku[] };

const EMPTY_PRODUCT = { name: "", slug: "", description: "", ingredients: "", shelf_life: "", category: "podi", image_url: "" };
const EMPTY_SKU = { sku_code: "", label: "", price: "", compare_at_price: "", stock_quantity: "", weight_grams: "", is_available: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithSkus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<ProductWithSkus | null>(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [showProductForm, setShowProductForm] = useState(false);
  const [skuForm, setSkuForm] = useState({ ...EMPTY_SKU, product_id: "" });
  const [addingSkuFor, setAddingSkuFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  function startAddProduct() {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setImageFile(null);
    setShowProductForm(true);
  }

  function startEditProduct(p: ProductWithSkus) {
    setEditingProduct(p);
    setProductForm({
      name: p.name, slug: p.slug, description: p.description ?? "",
      ingredients: p.ingredients ?? "", shelf_life: p.shelf_life ?? "",
      category: p.category ?? "podi", image_url: p.image_url ?? "",
    });
    setImageFile(null);
    setShowProductForm(true);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let imageUrl = productForm.image_url;

    // Upload new image if selected
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("bucket", "product-images");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const { url } = await uploadRes.json();
      imageUrl = url;
    }

    const body = { ...productForm, image_url: imageUrl };

    if (editingProduct) {
      await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setShowProductForm(false);
    await loadProducts();
    setSaving(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product and all its SKUs?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await loadProducts();
  }

  async function saveSku(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/skus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...skuForm,
        price: parseFloat(skuForm.price),
        compare_at_price: skuForm.compare_at_price ? parseFloat(skuForm.compare_at_price) : null,
        stock_quantity: parseInt(skuForm.stock_quantity) || 0,
        weight_grams: parseInt(skuForm.weight_grams) || 0,
      }),
    });
    setAddingSkuFor(null);
    setSkuForm({ ...EMPTY_SKU, product_id: "" });
    await loadProducts();
    setSaving(false);
  }

  async function toggleSkuAvailability(sku: Sku) {
    await fetch(`/api/skus/${sku.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !sku.is_available }),
    });
    await loadProducts();
  }

  async function deleteSku(id: string) {
    if (!confirm("Delete this SKU?")) return;
    await fetch(`/api/skus/${id}`, { method: "DELETE" });
    await loadProducts();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Products</h1>
        <button type="button" onClick={startAddProduct} className="btn-primary">
          + Add Product
        </button>
      </div>

      {/* Product form modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-stone-800">
              {editingProduct ? "Edit Product" : "New Product"}
            </h2>
            <form onSubmit={saveProduct} className="space-y-3">
              <input className="input" placeholder="Product Name" value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                required />
              <input className="input" placeholder="Slug (e.g. idli-podi)" value={productForm.slug}
                onChange={(e) => setProductForm((f) => ({ ...f, slug: e.target.value }))} required />
              <textarea className="input min-h-[80px] resize-none" placeholder="Description"
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} />
              <input className="input" placeholder="Ingredients" value={productForm.ingredients}
                onChange={(e) => setProductForm((f) => ({ ...f, ingredients: e.target.value }))} />
              <input className="input" placeholder="Shelf Life (e.g. 6 months)" value={productForm.shelf_life}
                onChange={(e) => setProductForm((f) => ({ ...f, shelf_life: e.target.value }))} />
              <input className="input" placeholder="Category (e.g. podi)" value={productForm.category}
                onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))} />
              <div>
                <p className="mb-1 text-xs font-medium text-stone-600">Product Image</p>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-stone-500 file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand-700" />
                {productForm.image_url && !imageFile && (
                  <p className="mt-1 text-xs text-stone-400 truncate">Current: {productForm.image_url}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => setShowProductForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products list */}
      {loading ? (
        <p className="text-stone-400">Loading...</p>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-stone-400">
          <p className="text-4xl mb-3">🌶️</p>
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <div key={product.id} className="card p-5">
              {/* Product header */}
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-stone-800">{product.name}</h2>
                  <p className="text-xs text-stone-400">/products/{product.slug}</p>
                  {product.description && (
                    <p className="mt-1 text-sm text-stone-500 line-clamp-2">{product.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => startEditProduct(product)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button type="button" onClick={() => deleteProduct(product.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>

              {/* SKUs */}
              <div className="mb-3">
                <p className="mb-2 text-xs font-semibold uppercase text-stone-400">SKUs</p>
                {product.skus.length === 0 ? (
                  <p className="text-xs text-stone-400">No SKUs yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-stone-700">
                      <thead>
                        <tr className="text-stone-400 text-left">
                          <th className="pr-4 pb-1">Code</th>
                          <th className="pr-4 pb-1">Label</th>
                          <th className="pr-4 pb-1">Price</th>
                          <th className="pr-4 pb-1">Stock</th>
                          <th className="pr-4 pb-1">Available</th>
                          <th className="pb-1"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {product.skus.map((sku) => (
                          <tr key={sku.id}>
                            <td className="pr-4 py-1 font-mono">{sku.sku_code}</td>
                            <td className="pr-4 py-1">{sku.label}</td>
                            <td className="pr-4 py-1">₹{sku.price}</td>
                            <td className="pr-4 py-1">{sku.stock_quantity}</td>
                            <td className="pr-4 py-1">
                              <button
                                type="button"
                                onClick={() => toggleSkuAvailability(sku)}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${sku.is_available ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}
                              >
                                {sku.is_available ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="py-1">
                              <button type="button" onClick={() => deleteSku(sku.id)} className="text-red-400 hover:text-red-600">✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add SKU */}
              {addingSkuFor === product.id ? (
                <form onSubmit={saveSku} className="rounded-xl bg-stone-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-stone-600 mb-2">Add SKU</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input text-sm" placeholder="SKU Code (e.g. IDLI-100G)" required
                      value={skuForm.sku_code}
                      onChange={(e) => setSkuForm((f) => ({ ...f, sku_code: e.target.value, product_id: product.id }))} />
                    <input className="input text-sm" placeholder="Label (e.g. 100g)" required
                      value={skuForm.label}
                      onChange={(e) => setSkuForm((f) => ({ ...f, label: e.target.value }))} />
                    <input className="input text-sm" placeholder="Price (₹)" type="number" required
                      value={skuForm.price}
                      onChange={(e) => setSkuForm((f) => ({ ...f, price: e.target.value }))} />
                    <input className="input text-sm" placeholder="Compare-at Price (optional)" type="number"
                      value={skuForm.compare_at_price}
                      onChange={(e) => setSkuForm((f) => ({ ...f, compare_at_price: e.target.value }))} />
                    <input className="input text-sm" placeholder="Stock Qty" type="number"
                      value={skuForm.stock_quantity}
                      onChange={(e) => setSkuForm((f) => ({ ...f, stock_quantity: e.target.value }))} />
                    <input className="input text-sm" placeholder="Weight (grams)" type="number"
                      value={skuForm.weight_grams}
                      onChange={(e) => setSkuForm((f) => ({ ...f, weight_grams: e.target.value }))} />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="btn-primary text-sm px-4 py-2">
                      {saving ? "Saving..." : "Add SKU"}
                    </button>
                    <button type="button" onClick={() => setAddingSkuFor(null)} className="btn-secondary text-sm px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAddingSkuFor(product.id); setSkuForm({ ...EMPTY_SKU, product_id: product.id }); }}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  + Add SKU
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
