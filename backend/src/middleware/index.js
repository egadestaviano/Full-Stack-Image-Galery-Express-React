import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import router from "../routes/index.js";

const appMiddleware = express();

// CORS configuration
appMiddleware.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  })
);
appMiddleware.options("*", cors());

// Body parser
appMiddleware.use(express.json());
appMiddleware.use(express.urlencoded({ extended: true }));

// File upload configuration
appMiddleware.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
    createParentPath: true,
    limits: { fileSize: Number(process.env.FILE_MAX_SIZE) || 2 * 1024 * 1024 },
    abortOnLimit: true,
  })
);

// API routes
appMiddleware.use("/api", router);

// Static file serving (images, uploads, etc.)
appMiddleware.use(express.static("public"));

// Optional: log every request in dev mode
if (process.env.NODE_ENV === "development") {
  appMiddleware.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

export default appMiddleware;
