import mongoose from 'mongoose';
import User from '../models/User.js';
import { hashPassword } from '../utils/bcrypt.js';
import { config } from '../config/env.js';

/**
 * Script para crear el primer super admin
 * Ejecutar con: node src/scripts/createSuperAdmin.js
 */

const createSuperAdmin = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un super admin
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Ya existe un super administrador:', existingSuperAdmin.username);
      console.log('Email:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Datos del super admin
    const superAdminData = {
      username: 'superadmin',
      email: 'admin@tournex.com',
      password: await hashPassword('Admin123!'),
      role: 'super_admin',
      isActive: true
    };

    // Crear super admin
    const superAdmin = await User.create(superAdminData);

    console.log('✅ Super administrador creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', superAdmin.username);
    console.log('Email:', superAdmin.email);
    console.log('Password: Admin123!');
    console.log('Role:', superAdmin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear super admin:', error.message);
    process.exit(1);
  }
};

// Ejecutar el script
createSuperAdmin();
