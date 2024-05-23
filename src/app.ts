import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes";

const app = express();
const port = process.env.PORT || 3000;

const whitelist: string[] = [...(process.env.CORS_DOMAINS?.split(',') || ''), 'localhost']; // add localhost to whitelist

app.use(express.json({ strict: false }))
let corsOptions: cors.CorsOptions

function  corsOptionsDelegate(req: any, callback: any) {

    const origin = req.header('Origin')

    // Validate request from the same VPS
    const isSameVPS = whitelist.some(
        domain => origin?.endsWith(`.${domain}`) || 
        origin?.startsWith(`http://${domain}`) || 
        origin?.startsWith(`https://${domain}`) || 
        origin?.startsWith(`http://www.${domain}`) || 
        origin?.startsWith(`https://www.${domain}`)
    )

    if (origin && isSameVPS) {
        corsOptions = { origin: true };
      } else {
        corsOptions = { origin: false };
    }
}

// Activa cors según el entorno
if (process.env.ENVIRONMENT === 'local') {
  corsOptions = {
    origin: true
  };
  app.use(cors(corsOptions));
} else {
  app.use(cors(corsOptionsDelegate));
}

//All routes is charged into '/api'
app.use('/api', router)

async function main() {
    app.listen(port, () => {
      console.log(`Backend AWS_NODE Running in ${port}`)
    });
}
  
main()