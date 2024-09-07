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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsintX = void 0;
const gpt_client_1 = require("../services/gpt-client");
const browser_1 = require("../services/browser");
const selectors_1 = require("../models/classes/selectors");
class OsintX {
    constructor() {
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
    parseAdvanced(page, scrollDepth) {
        return __awaiter(this, void 0, void 0, function* () {
            const basicSelectors = new selectors_1.BasicSelectors();
            const postSelectors = new selectors_1.PostSelectors();
            let posts = [];
            // await page.evaluate(() => window.scrollBy(0, 500));
            // await new Promise(resolve => setTimeout(resolve, 2000));
            // Check for "continue as guest" modal and click it.
            function checkGuest() {
                return __awaiter(this, void 0, void 0, function* () {
                    page.setDefaultTimeout(1000);
                    let guest = yield page.$('.css-txolmk-DivGuestModeContainer.exd0a435 > div > div:nth-child(2)');
                    if (guest) {
                        yield guest.click();
                        return true;
                    }
                    return false;
                });
            }
            function getPostData(postSelectors) {
                return __awaiter(this, void 0, void 0, function* () {
                    let post = {
                        postNumber: posts.length + 1,
                        postUrl: page.url(),
                        likeCount: '',
                        commentCount: '',
                        repostCount: '',
                        caption: '',
                        comments: []
                    };
                    const commentHolder = yield page.$(postSelectors.commentBlockSelectors.commentHolder);
                    if (commentHolder) {
                        const commentProfileHolder = yield page.$(postSelectors.commentBlockSelectors.commentProfileHolder);
                        if (commentProfileHolder) {
                            post = yield commentProfileHolder.evaluate((parent, postSelectors, post) => {
                                var _a, _b, _c, _d;
                                const likeCount = (_a = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.likeCount}`)) === null || _a === void 0 ? void 0 : _a.ariaLabel;
                                const commentCount = (_b = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.commentCount}`)) === null || _b === void 0 ? void 0 : _b.textContent;
                                const repostCount = (_c = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.repostCount}`)) === null || _c === void 0 ? void 0 : _c.textContent;
                                const caption = (_d = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.caption}`)) === null || _d === void 0 ? void 0 : _d.textContent;
                                post.likeCount = likeCount !== null && likeCount !== void 0 ? likeCount : '';
                                post.commentCount = commentCount !== null && commentCount !== void 0 ? commentCount : '';
                                post.repostCount = repostCount !== null && repostCount !== void 0 ? repostCount : '';
                                post.caption = caption !== null && caption !== void 0 ? caption : '';
                                return post;
                            }, postSelectors, post);
                        }
                        const results = yield commentHolder.evaluate((parent, postSelectors) => {
                            let comments = [];
                            const childComments = parent.querySelectorAll(`:scope > ${postSelectors.commentDataSelectors.commentItem}`);
                            childComments.forEach(div => {
                                var _a, _b, _c, _d, _e, _f;
                                let parent = div.closest(postSelectors.commentDataSelectors.parentHolder);
                                let comment = (_a = div.querySelector(postSelectors.commentDataSelectors.comment)) === null || _a === void 0 ? void 0 : _a.textContent;
                                let posterTag = (_b = div.querySelector(postSelectors.commentDataSelectors.posterTag)) === null || _b === void 0 ? void 0 : _b.href;
                                let posterName = (_c = div.querySelector(postSelectors.commentDataSelectors.posterName)) === null || _c === void 0 ? void 0 : _c.textContent;
                                let likeCount = (_f = (_e = (_d = parent === null || parent === void 0 ? void 0 : parent.querySelector(postSelectors.commentDataSelectors.likeCount)) === null || _d === void 0 ? void 0 : _d.ariaLabel) === null || _e === void 0 ? void 0 : _e.toString().match(/\d+[KMB]?/)) === null || _f === void 0 ? void 0 : _f.toString();
                                comments.push({
                                    comment: comment !== null && comment !== void 0 ? comment : '',
                                    posterTag: posterTag !== null && posterTag !== void 0 ? posterTag : '',
                                    posterName: posterName !== null && posterName !== void 0 ? posterName : '',
                                    likeCount: likeCount !== null && likeCount !== void 0 ? likeCount : ''
                                });
                            });
                            return comments;
                        }, postSelectors);
                        post.comments = results;
                    }
                    return post;
                });
            }
            // refresh button (pops up on web page every time is opened)
            const button = yield page.$(postSelectors.refreshBtn);
            if (button) {
                yield button.click();
                yield new Promise(resolve => setTimeout(resolve, 3000));
            }
            // Click the first post to navigate to feed
            const firstPostBtn = yield page.$(postSelectors.firstPostBtn);
            if (firstPostBtn) {
                yield firstPostBtn.click();
                yield new Promise(resolve => setTimeout(resolve, 1000));
                // Scroll through posts, i is depth
                for (var i = 0; i <= scrollDepth; i++) {
                    yield checkGuest();
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                    posts.push(yield getPostData(postSelectors));
                    let nextBtn = yield page.waitForSelector(postSelectors.nextPostBtn); //css-13if7zh-DivCommentContainer ekjxngi0
                    break;
                    yield (nextBtn === null || nextBtn === void 0 ? void 0 : nextBtn.click());
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            const divPosition = yield page.evaluate((selector) => {
                const element = document.querySelector(selector);
                element === null || element === void 0 ? void 0 : element.scrollBy(10, 500);
                const rect = element.getBoundingClientRect();
                return {
                    x: rect.left + rect.width / 2, // X coordinate at the middle of the div
                    y: rect.top + rect.height / 2 // Y coordinate at the middle of the div
                };
            }, '.css-1qjw4dg-DivContentContainer.e1mecfx00');
            // Move the mouse to the div's position
            yield page.mouse.move(divPosition.x, divPosition.y);
            // Press the mouse button down to start dragging
            yield page.mouse.down();
            // Drag the mouse down by 200 pixels
            yield page.mouse.move(divPosition.x, divPosition.y + 200, { steps: 10 });
            // Release the mouse button to complete the drag
            yield page.mouse.up();
            return posts;
        });
    }
    executeQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://tiktok.com/@${query.username}`;
            const osintBrowser = new browser_1.OsintBrowser(url);
            yield osintBrowser.initialize();
            const page = osintBrowser.page;
            if (page) {
                try {
                    let hasAdvanced = [];
                    for (const key of Object.keys(query.query)) {
                        const k = key.toLowerCase();
                        const isFirstKey = k === Object.keys(query.query)[0];
                        if (this.validAdvanced.includes(k)) {
                            hasAdvanced.push(k);
                        }
                        else if (this.validBasics.includes(k)) {
                            this.basicProfile[key] = yield this.getElementByXPath(page, query.query[k], isFirstKey);
                        }
                        else {
                            console.log('Invalid Query Parameter');
                        }
                    }
                    this.osintProfile.basicInfo = this.basicProfile;
                    let posts = yield this.parseAdvanced(page, 2);
                    posts.forEach(post => {
                        console.log(post.postNumber);
                        console.log(post.postUrl);
                        console.log(post.likeCount);
                        console.log(post.commentCount);
                        console.log(post.repostCount);
                        console.log(post.caption);
                        post.comments.forEach(cmt => {
                            console.log(cmt);
                        });
                    });
                    if (hasAdvanced.length > 0) {
                        // Order the advanced query parms to match the valid parms list since some depend on previous ones
                        hasAdvanced = hasAdvanced.sort((a, b) => {
                            return this.validAdvanced.indexOf(a) - this.validAdvanced.indexOf(b);
                        });
                        for (const q of hasAdvanced) {
                            this.osintProfile.advanced[q] = yield this.parseAdvanced(page, 5);
                        }
                    }
                    return this.osintProfile;
                }
                catch (e) {
                    console.error('Error executing query:', e);
                    return { basicInfo: {}, advanced: {} };
                }
                finally {
                    if (osintBrowser.browser)
                        yield osintBrowser.close();
                }
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
        Object.keys(q).forEach(key => {
            const k = key.toLowerCase();
            if (this.validBasics.includes(k)) {
                query.query[k] = basicSelectors.infoSelectors[k];
            }
            if (this.validAdvanced.includes(k)) {
                query.query[k] = q[k];
            }
        });
        return query;
    }
}
exports.OsintX = OsintX;
