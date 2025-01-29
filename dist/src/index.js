"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const serve_static_1 = __importDefault(require("serve-static"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const uploadRouter_1 = __importDefault(require("../router/uploadRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3001;
dotenv_1.default.config();
// parse application/json
app.use(body_parser_1.default.json());
//Setup CORS
app.use((0, cors_1.default)());
// app.use(cors({
//   origin: 'http://paracelis-tourist-app.site/', // Replace with your frontend's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//   credentials: true, // Allow cookies or authorization headers
// }));
app.use((0, serve_static_1.default)(path_1.default.join(__dirname, '../public')));
app.use('/uploader', uploadRouter_1.default);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
