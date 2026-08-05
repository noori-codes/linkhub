import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { ensureThemes } from "./utils/ensureThemes.js";

// 1. Handle synchronous errors
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥");
  console.error(err);
  process.exit(1);
});

async function startServer() {
  try {
    await connectDB();
    await ensureThemes();

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // 2. Handle rejected promises
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥");
      console.error(err);

      server.close(() => {
        process.exit(1);
      });
    });
  } catch (err) {
    console.error("Failed to start server");
    console.error(err);
    process.exit(1);
  }
}

startServer();
