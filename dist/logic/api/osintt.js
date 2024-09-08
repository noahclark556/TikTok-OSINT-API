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
exports.OsintX = void 0;
const gpt_client_1 = require("../services/gpt-client");
const browser_1 = require("../services/browser");
const selectors_1 = require("../models/classes/selectors");
const newModels_1 = require("../models/classes/newModels");
const axios_1 = __importDefault(require("axios"));
class OsintX {
    constructor() {
        this.endpoints = new selectors_1.Endpoints();
        // These valid parms need to be in order of dependency
        //   aidescription depends on the data returned from posts, so put it last
        this.validBasics = ['title', 'subtitle', 'bio', 'link', 'followers', 'following', 'likes'];
        this.validAdvanced = ['posts', 'aidescription'];
        // These are global because the ai feature depends on osintProfile object
        this.basicProfile = {};
        this.osintProfile = {
            basicInfo: this.basicProfile,
            advanced: {}
        };
    }
    getElementByXPath(page_1, selector_1) {
        return __awaiter(this, arguments, void 0, function* (page, selector, init = false) {
            try {
                var elem;
                if (selector.includes('STD_SELECTOR')) {
                    selector = selector.split("{?}")[1];
                    elem = init ? yield page.waitForSelector(`${selector}`) : yield page.$(`${selector}`);
                }
                else {
                    elem = init
                        ? yield page.waitForSelector(`::-p-xpath(${selector})`)
                        : yield page.$(`::-p-xpath(${selector})`);
                }
                return elem ? yield page.evaluate(el => el.textContent || '', elem) : '';
            }
            catch (e) {
                console.error('Error getting element by XPath:', e);
                return '';
            }
        });
    }
    getOsintDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield (0, gpt_client_1.sendMessageToGPT4)([
                    { role: 'system', content: 'Your job is to take this information pulled from someones X social media account and profile them. Make inferences and educated guesses about them and provide useful information for someone like an investigator to use. The data im giving you is a stringified json that contains either basic info, a bunch of user posts, or both.' },
                    { role: 'user', content: JSON.stringify(this.osintProfile) },
                ]);
                return response.choices[0].message.content;
            }
            catch (error) {
                console.error('Failed to get a response from GPT-4:', error);
                return '';
            }
        });
    }
    getComments(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
                    }
                });
                // console.log(url);
                let result = response.data;
                console.log(result);
                // let items : Array<any> = result["itemList"];
                // items.forEach(p => {
                //     let post:Post = Post.fromJson(p);
                //     this.getComments(post.commentUrl);
                // });
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
        });
    }
    getPosts(endpoints) {
        return __awaiter(this, void 0, void 0, function* () {
            let posts = [];
            try {
                const response = yield axios_1.default.get(endpoints.posts, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
                    }
                });
                let result = response.data;
                let items = result["itemList"];
                items.forEach(p => {
                    let post = newModels_1.Post.fromJson(p);
                    posts.push(post);
                });
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
            return posts;
        });
    }
    parseAdvanced(page) {
        return __awaiter(this, void 0, void 0, function* () {
            let posts = yield this.getPosts(this.endpoints);
            yield page.goto(posts[0].postUrl, { waitUntil: 'networkidle2' });
            yield new Promise(resolve => setTimeout(resolve, 1000));
            if (this.endpoints.comments.length > 0) {
                yield this.getComments(this.endpoints.comments);
            }
        });
    }
    finalizeEndpoints(browser, page) {
        return __awaiter(this, void 0, void 0, function* () {
            let posts = yield this.getPosts(this.endpoints);
            yield page.goto(posts[0].postUrl);
            yield new Promise(resolve => setTimeout(resolve, 1000));
            yield browser.close();
            posts.forEach((p) => __awaiter(this, void 0, void 0, function* () {
                yield this.getComments(p.commentUrl(this.endpoints.comments, p.id));
            }));
        });
    }
    executeQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://tiktok.com/@joemyheck`;
            const osintBrowser = new browser_1.OsintBrowser(url);
            yield osintBrowser.initialize();
            const page = osintBrowser.page;
            if (page) {
                const requestListener1 = (request) => __awaiter(this, void 0, void 0, function* () {
                    if (request.url().includes('item_list/?WebIdLastTime')) {
                        this.endpoints.posts = request.url();
                        this.finalizeEndpoints(osintBrowser, page);
                        page === null || page === void 0 ? void 0 : page.off('request', requestListener1);
                    }
                });
                const requestListener2 = (request) => __awaiter(this, void 0, void 0, function* () {
                    if (request.url().includes('comment/list/?WebIdLastTime')) {
                        this.endpoints.comments = request.url();
                        page === null || page === void 0 ? void 0 : page.off('request', requestListener2);
                    }
                });
                // Listen for url with validated auth data then store it
                page.on('request', requestListener1);
                page.on('request', requestListener2);
            }
            return {};
        });
    }
    buildQuery(username, q) {
        const basicSelectors = new selectors_1.BasicSelectors();
        const query = {
            username,
            query: {}
        };
        // Object.keys(q).forEach(key => {
        //     const k = key.toLowerCase();
        //     if (this.validBasics.includes(k)) {
        //         query.query[k] = basicSelectors.infoSelectors[k as keyof BasicSelectors['infoSelectors']];
        //     }
        //     if (this.validAdvanced.includes(k)) {
        //         query.query[k] = q[k];
        //     }
        // });
        return query;
    }
}
exports.OsintX = OsintX;
