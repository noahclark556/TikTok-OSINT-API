"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const osintt_1 = require("./logic/api/osintt");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.get('/ttosint', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.query.username;
        const key = req.query.apikey;
        const q = JSON.parse(req.query.query);
        if (!key || (key && key != 'customapikey')) {
            res.json({ error: 'Invalid API Key' });
            console.log('Invalid API Key');
            return;
        }
        let osintApi = new osintt_1.OsintX();
        const query = osintApi.buildQuery(username, q);
        const result = yield osintApi.executeQuery(query);
        res.json({ data: result });
    }
    catch (error) {
        console.error('Error in /ttosint:', error);
        res.json({ error: 'Failed to fetch user data' });
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
