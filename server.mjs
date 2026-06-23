import { createApp } from "./src/app.mjs";

const port = Number(process.env.PORT || 3024);
const host = process.env.HOST || (process.env.RENDER ? "0.0.0.0" : "127.0.0.1");
const app = createApp();

app.listen(port, host, () => {
  console.log(`brand_bis_er_gesteht läuft auf http://${host}:${port}`);
});
