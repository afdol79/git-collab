import React, { useState, useEffect } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: "", image: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:3000/products";

  // GET - ดึงข้อมูลสินค้าทั้งหมด
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + error.message);
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  // POST - เพิ่มสินค้าใหม่
  const createProduct = async () => {
    if (!formData.name || !formData.price) {
      setError("กรุณากรอกชื่อสินค้าและราคา");
      return;
    }

    setError("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          image: formData.image || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.errors ? data.errors.join(", ") : "เกิดข้อผิดพลาด"
        );
      }

      setProducts([...products, data]);
      setFormData({ name: "", price: "", image: "" });
      console.log("เพิ่มสินค้าแล้ว:", data);
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเพิ่มสินค้า: " + error.message);
      console.error("Error creating product:", error);
    }
  };

  // PUT - แก้ไขสินค้า
  const updateProduct = async (id) => {
    if (!formData.name || !formData.price) {
      setError("กรุณากรอกชื่อสินค้าและราคา");
      return;
    }

    setError("");
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          image: formData.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.errors ? data.errors.join(", ") : data.error || "เกิดข้อผิดพลาด"
        );
      }

      setProducts(
        products.map((product) => (product.id === id ? data : product))
      );
      setFormData({ name: "", price: "", image: "" });
      setEditingId(null);
      console.log("แก้ไขสินค้าแล้ว:", data);
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการแก้ไขสินค้า: " + error.message);
      console.error("Error updating product:", error);
    }
  };

  // DELETE - ลบสินค้า
  const deleteProduct = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) return;

    setError("");
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      setProducts(products.filter((product) => product.id !== id));
      console.log("ลบสินค้าแล้ว:", data);
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการลบสินค้า: " + error.message);
      console.error("Error deleting product:", error);
    }
  };

  // เริ่มแก้ไข
  const startEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image || "",
    });
    setEditingId(product.id);
    setError("");
  };

  // ยกเลิกแก้ไข
  const cancelEdit = () => {
    setFormData({ name: "", price: "", image: "" });
    setEditingId(null);
    setError("");
  };

  // เรียกใช้เมื่อ component โหลด
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>ระบบจัดการสินค้า</h1>

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="ชื่อสินค้า"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              padding: "8px",
              marginRight: "10px",
              width: "200px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />

          <input
            type="number"
            placeholder="ราคา"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            style={{
              padding: "8px",
              marginRight: "10px",
              width: "100px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="url"
            placeholder="URL รูปภาพ (ไม่จำเป็น)"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            style={{
              padding: "8px",
              width: "320px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        {editingId ? (
          <div>
            <button
              onClick={() => updateProduct(editingId)}
              style={{
                backgroundColor: "#4caf50",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "5px",
              }}
            >
              บันทึกการแก้ไข
            </button>
            <button
              onClick={cancelEdit}
              style={{
                backgroundColor: "#757575",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ยกเลิก
            </button>
          </div>
        ) : (
          <button
            onClick={createProduct}
            style={{
              backgroundColor: "#2196f3",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            เพิ่มสินค้า
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && <p>กำลังโหลด...</p>}

      {/* Product List */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>รายการสินค้า ({products.length} รายการ)</h2>
          <button
            onClick={fetchProducts}
            style={{
              backgroundColor: "#ff9800",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            รีเฟรช
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "15px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x400?text=No+Image";
                  }}
                />
              )}

              <h4 style={{ margin: "0 0 5px 0" }}>{product.name}</h4>
              <p style={{ margin: "0 0 5px 0", color: "#666" }}>
                ID: {product.id}
              </p>
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#2196f3",
                }}
              >
                ฿{product.price.toLocaleString()}
              </p>

              <div>
                <button
                  onClick={() => startEdit(product)}
                  style={{
                    backgroundColor: "#ff9800",
                    color: "white",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "5px",
                    fontSize: "12px",
                  }}
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            ไม่มีสินค้าในระบบ
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
