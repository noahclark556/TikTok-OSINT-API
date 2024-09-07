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
exports.OsintBrowser = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
class OsintBrowser {
    constructor(url) {
        this.url = url;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.buildBrowser();
        });
    }
    buildBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            // These args tell puppeteer to use the bundled chrome. This is safe for deploying to cloud run
            this.browser = yield puppeteer_extra_1.default.launch({
                headless: false,
                defaultViewport: null,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            this.page = yield this.browser.newPage();
            yield this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
            yield this.page.goto(this.url, { waitUntil: 'networkidle2' });
            this.page.on('console', msg => {
                msg.args().forEach(arg => console.log(arg));
            });
            console.log("Browser Built");
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                console.log("Browser Closed");
                // await this.browser.close();
            }
        });
    }
}
exports.OsintBrowser = OsintBrowser;
