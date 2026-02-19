import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { app } from "./app";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`HKids API running on port ${env.PORT}`);
  });
};

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
