import express from "express";
import userRouter from "./controllers/user.controller.js";
import AdminRouter from "./controllers/admin.controller.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/user", userRouter);
app.use("/admin", AdminRouter);
app.listen(3000, () => { console.log("server running in port 3000"); });
//# sourceMappingURL=index.js.map