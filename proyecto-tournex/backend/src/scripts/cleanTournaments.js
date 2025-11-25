import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env') });

// Importar modelos
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import TournamentParticipant from '../models/TournamentParticipant.js';
import MatchReport from '../models/MatchReport.js';
import Evidence from '../models/Evidence.js';

const cleanTournaments = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('\n🗑️  Eliminando datos de torneos...');

    // Contar registros antes de eliminar
    const tournamentsCount = await Tournament.countDocuments();
    const matchesCount = await Match.countDocuments();
    const participantsCount = await TournamentParticipant.countDocuments();
    const reportsCount = await MatchReport.countDocuments();
    const evidenceCount = await Evidence.countDocuments();

    console.log('\n📊 Registros encontrados:');
    console.log(`   - Torneos: ${tournamentsCount}`);
    console.log(`   - Partidos: ${matchesCount}`);
    console.log(`   - Participantes: ${participantsCount}`);
    console.log(`   - Reportes: ${reportsCount}`);
    console.log(`   - Evidencias: ${evidenceCount}`);

    if (tournamentsCount === 0 && matchesCount === 0 && participantsCount === 0) {
      console.log('\n✅ No hay datos para eliminar');
      await mongoose.connection.close();
      return;
    }

    console.log('\n⚠️  Iniciando eliminación en 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Eliminar en orden para evitar problemas de referencias
    console.log('\n🗑️  Eliminando evidencias...');
    await Evidence.deleteMany({});
    console.log('   ✅ Evidencias eliminadas');

    console.log('🗑️  Eliminando reportes de partidos...');
    await MatchReport.deleteMany({});
    console.log('   ✅ Reportes eliminados');

    console.log('🗑️  Eliminando partidos...');
    await Match.deleteMany({});
    console.log('   ✅ Partidos eliminados');

    console.log('🗑️  Eliminando participantes de torneos...');
    await TournamentParticipant.deleteMany({});
    console.log('   ✅ Participantes eliminados');

    console.log('🗑️  Eliminando torneos...');
    await Tournament.deleteMany({});
    console.log('   ✅ Torneos eliminados');

    // Verificar que se eliminaron todos
    const remainingTournaments = await Tournament.countDocuments();
    const remainingMatches = await Match.countDocuments();
    const remainingParticipants = await TournamentParticipant.countDocuments();

    console.log('\n✅ Limpieza completada!');
    console.log('📊 Registros restantes:');
    console.log(`   - Torneos: ${remainingTournaments}`);
    console.log(`   - Partidos: ${remainingMatches}`);
    console.log(`   - Participantes: ${remainingParticipants}`);

    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al limpiar datos:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Ejecutar el script
cleanTournaments();
