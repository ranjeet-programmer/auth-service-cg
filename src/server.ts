import app from "./app";
import { Config } from "./config";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });
    } catch (error) {
        console.log("error", error);
        process.exit(1);
    }
};

startServer();
