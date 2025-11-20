import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/db.json');

// Estructura inicial de la base de datos
const initialDB = {
  users: [],
  tournaments: [],
  teams: [],
  matches: [],
  notifications: [],
  messages: [],
  comments: []
};

class LocalDB {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    try {
      const dataDir = path.join(__dirname, '../../data');
      await fs.mkdir(dataDir, { recursive: true });
      
      try {
        const fileContent = await fs.readFile(DB_PATH, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        // Si no existe el archivo, crear uno nuevo
        this.data = { ...initialDB };
        await this.save();
      }
      
      console.log('✅ Local JSON database initialized');
    } catch (err) {
      console.error('❌ Error initializing local database:', err);
      this.data = { ...initialDB };
    }
  }

  async save() {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ Error saving database:', err);
    }
  }

  // Métodos helpers para simular Mongoose
  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  async find(collection, query = {}) {
    const items = this.collection(collection);
    if (Object.keys(query).length === 0) return items;
    
    return items.filter(item => {
      return Object.entries(query).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  async findById(collection, id) {
    const items = this.collection(collection);
    return items.find(item => item._id === id);
  }

  async create(collection, data) {
    const items = this.collection(collection);
    const newItem = {
      ...data,
      _id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    items.push(newItem);
    await this.save();
    return newItem;
  }

  async updateById(collection, id, updates) {
    const items = this.collection(collection);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date()
    };
    await this.save();
    return items[index];
  }

  async deleteById(collection, id) {
    const items = this.collection(collection);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    const deleted = items.splice(index, 1)[0];
    await this.save();
    return deleted;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const db = new LocalDB();
export default db;
