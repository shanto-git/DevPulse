import config from "./config";
import { initDB } from "./db";
import app from "./app";


const main =async()=>{
   try {
    await initDB();
    console.log("Database initialized successfully!");
    
    app.listen(config.port, () => {
      console.log(`DevPulse Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Server startup failed due to database error:", error);
    process.exit(1);
  }
};


main()
 