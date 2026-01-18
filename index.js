import app from "./src/app.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

// Validação de variáveis de ambiente obrigatórias
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não está configurado no .env");
  process.exit(1);
}

// JWT_SECRET é obrigatório em produção
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET é obrigatório em produção. Configure no .env");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
}).on("error", (err) => {
  console.error("❌ Erro ao iniciar servidor:", err);
  process.exit(1);
});