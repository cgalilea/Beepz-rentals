import { env } from "./lib/env";
import app from "./app";

app.listen(env.PORT, () => {
  console.log(`Beepz API running on http://localhost:${env.PORT}`);
});
