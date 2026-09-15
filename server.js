import "dotenv/config";
import app from "./app.js"
import { connectDB } from "./config/db.connection.js"
import dns from "dns"

if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
  }
}

const PORT = process.env.PORT
connectDB()
.then(() => {
    app.listen(PORT || 3000, () => console.log(`Server Started at http://localhost:${PORT}`))
})
.catch((error) => {
    console.log("Error occurred while starting Server:", error);
    
})