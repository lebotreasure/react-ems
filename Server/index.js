import express from "express";
import cors from "cors";
import { AdminRouter } from "./Routes/AdminRoute.js";

const app = express();
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
}));
app.use(express.json());

app.use('/auth', AdminRouter);

app.listen(3001, () => {
    console.log("Server is running");
});