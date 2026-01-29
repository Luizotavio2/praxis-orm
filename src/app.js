import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { healthCheck } from "./controllers/healthController.js";

const app = express();

// Middlewares
// Configurar CORS: em produção usa FRONTEND_URL, em desenvolvimento permite todas as origens
const isDevelopment = process.env.NODE_ENV !== 'production';
const frontendOrigin = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

app.use(cors({
  origin: isDevelopment ? '*' : frontendOrigin,
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/health", healthCheck);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: "Rota não encontrada",
    path: req.path 
  });
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Em produção, não expor stack traces ou detalhes técnicos
  if (isDevelopment) {
    console.error("Erro não tratado:", err);
  } else {
    console.error("Erro não tratado:", err.message);
  }
  
  // Se a resposta já foi enviada, delegar para o handler padrão do Express
  if (res.headersSent) {
    return next(err);
  }

  // Erro de validação
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      error: "Erro de validação",
      details: isDevelopment ? err.message : undefined
    });
  }

  // Erro do Prisma
  if (err.code && err.code.startsWith("P")) {
    return res.status(400).json({ 
      error: "Erro no banco de dados",
      message: isDevelopment ? err.message : undefined
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({ 
    error: isDevelopment ? err.message : "Erro interno do servidor"
  });
});

export default app;