const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// สร้างการเชื่อมต่อฐานข้อมูล SQLite
const dbPath = path.join(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database successfully!');
  }
});

// สร้างตารางและเพิ่มข้อมูลเริ่มต้น
const initializeDatabase = () => {
  // สร้างตาราง products
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Products table created successfully!');
      
      // ตรวจสอบว่ามีข้อมูลในตารางหรือไม่
      db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
          console.error('Error checking data:', err.message);
        } else if (row.count === 0) {
          // เพิ่มข้อมูลเริ่มต้น
          insertInitialData();
        }
      });
    }
  });
};

// ฟังก์ชันเพิ่มข้อมูลเริ่มต้น
const insertInitialData = () => {
  const initialProducts = [
    { name: "มือถือ", price: 15000, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
    { name: "แล็ปท็อป", price: 25000, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
    { name: "หูฟัง", price: 2000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
    { name: "เมาส์", price: 500, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop" },
    { name: "คีย์บอร์ด", price: 1500, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop" },
    { name: "กระเป๋า", price: 800, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop" },
    { name: "หนังสือ", price: 300, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop" },
    { name: "ปากกา", price: 50, image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop" },
    { name: "นาฬิกา", price: 3000, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop" },
    { name: "รองเท้า", price: 2500, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop" }
  ];

  const stmt = db.prepare("INSERT INTO products (name, price, image) VALUES (?, ?, ?)");
  
  initialProducts.forEach(product => {
    stmt.run([product.name, product.price, product.image], (err) => {
      if (err) {
        console.error('Error inserting initial data:', err.message);
      }
    });
  });
  
  stmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing statement:', err.message);
    } else {
      console.log('Initial data inserted successfully!');
    }
  });
};

// ฟังก์ชันตรวจสอบข้อมูลสินค้า
const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim() === '') {
    errors.push('ชื่อสินค้าจำเป็น');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('ราคาต้องมากกว่า 0');
  }
  
  return errors;
};

// GET - ดูสินค้าทั้งหมด
app.get('/products', (req, res) => {
  const sql = "SELECT * FROM products ORDER BY id";
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } else {
      res.json(rows);
    }
  });
});

// GET - ดูสินค้าตาม ID
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const sql = "SELECT * FROM products WHERE id = ?";
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching product:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
  });
});

// POST - เพิ่มสินค้าใหม่
app.post('/products', (req, res) => {
  const { name, price, image } = req.body;
  
  // ตรวจสอบข้อมูล
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  const sql = "INSERT INTO products (name, price, image) VALUES (?, ?, ?)";
  const params = [
    name.trim(),
    parseFloat(price),
    image || "https://via.placeholder.com/400x400?text=No+Image"
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error inserting product:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' });
    } else {
      // ดึงข้อมูลสินค้าที่เพิ่งเพิ่ม
      db.get("SELECT * FROM products WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching new product:', err.message);
          res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าใหม่' });
        } else {
          res.status(201).json(row);
        }
      });
    }
  });
});

// PUT - แก้ไขสินค้าทั้งหมด
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, image } = req.body;
  
  // ตรวจสอบข้อมูล
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  // ตรวจสอบว่าสินค้ามีอยู่จริง
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Error checking product:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสินค้า' });
    } else if (!row) {
      res.status(404).json({ error: 'ไม่พบสินค้า' });
    } else {
      // อัพเดทสินค้า
      const sql = "UPDATE products SET name = ?, price = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      const params = [
        name.trim(),
        parseFloat(price),
        image || row.image,
        id
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error updating product:', err.message);
          res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัพเดทสินค้า' });
        } else {
          // ดึงข้อมูลสินค้าที่อัพเดทแล้ว
          db.get("SELECT * FROM products WHERE id = ?", [id], (err, updatedRow) => {
            if (err) {
              console.error('Error fetching updated product:', err.message);
              res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าที่อัพเดท' });
            } else {
              res.json(updatedRow);
            }
          });
        }
      });
    }
  });
});

// PATCH - แก้ไขสินค้าบางส่วน
app.patch('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // ตรวจสอบว่าสินค้ามีอยู่จริง
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Error checking product:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสินค้า' });
    } else if (!row) {
      res.status(404).json({ error: 'ไม่พบสินค้า' });
    } else {
      const updates = [];
      const params = [];
      
      // ตรวจสอบและเพิ่มฟิลด์ที่ต้องการอัพเดท
      if (req.body.name !== undefined) {
        if (req.body.name.trim() === '') {
          return res.status(400).json({ error: 'ชื่อสินค้าไม่สามารถว่างได้' });
        }
        updates.push('name = ?');
        params.push(req.body.name.trim());
      }
      
      if (req.body.price !== undefined) {
        if (req.body.price <= 0) {
          return res.status(400).json({ error: 'ราคาต้องมากกว่า 0' });
        }
        updates.push('price = ?');
        params.push(parseFloat(req.body.price));
      }
      
      if (req.body.image !== undefined) {
        updates.push('image = ?');
        params.push(req.body.image);
      }
      
      if (updates.length === 0) {
        return res.json(row); // ไม่มีการเปลี่ยนแปลง
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      
      const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error updating product:', err.message);
          res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัพเดทสินค้า' });
        } else {
          // ดึงข้อมูลสินค้าที่อัพเดทแล้ว
          db.get("SELECT * FROM products WHERE id = ?", [id], (err, updatedRow) => {
            if (err) {
              console.error('Error fetching updated product:', err.message);
              res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าที่อัพเดท' });
            } else {
              res.json(updatedRow);
            }
          });
        }
      });
    }
  });
});

// DELETE - ลบสินค้า
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // ดึงข้อมูลสินค้าก่อนลบ
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Error checking product:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสินค้า' });
    } else if (!row) {
      res.status(404).json({ error: 'ไม่พบสินค้า' });
    } else {
      // ลบสินค้า
      db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
        if (err) {
          console.error('Error deleting product:', err.message);
          res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบสินค้า' });
        } else {
          res.json({ 
            message: 'ลบสินค้าเรียบร้อยแล้ว', 
            product: row 
          });
        }
      });
    }
  });
});

// DELETE - ลบสินค้าทั้งหมด
app.delete('/products', (req, res) => {
  // นับจำนวนสินค้าก่อนลบ
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      console.error('Error counting products:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการนับสินค้า' });
    } else {
      const deletedCount = row.count;
      
      // ลบสินค้าทั้งหมด
      db.run("DELETE FROM products", [], function(err) {
        if (err) {
          console.error('Error deleting all products:', err.message);
          res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบสินค้าทั้งหมด' });
        } else {
          res.json({ 
            message: `ลบสินค้าทั้งหมดเรียบร้อยแล้ว (${deletedCount} รายการ)` 
          });
        }
      });
    }
  });
});

// เริ่มต้นฐานข้อมูล
initializeDatabase();

// ปิดการเชื่อมต่อฐานข้อมูลเมื่อปิดแอพ
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ทำงานที่ http://localhost:${PORT}`);
  console.log(`Database file: ${dbPath}`);
  console.log('\n--- API Endpoints ---');
  console.log('GET    /products       - ดูสินค้าทั้งหมด');
  console.log('GET    /products/:id   - ดูสินค้าตาม ID');
  console.log('POST   /products       - เพิ่มสินค้าใหม่');
  console.log('PUT    /products/:id   - แก้ไขสินค้าทั้งหมด');
  console.log('PATCH  /products/:id   - แก้ไขสินค้าบางส่วน');
  console.log('DELETE /products/:id   - ลบสินค้าตาม ID');
  console.log('DELETE /products       - ลบสินค้าทั้งหมด');
  console.log(`\nลองเข้า: http://localhost:${PORT}/products`);
});

// Export สำหรับ testing
module.exports = app;