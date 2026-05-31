import config from "./config";
import { initDB } from "./db";
import app from "./app";


const main =async()=>{
   await initDB()
}



app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`);
});

main()
 