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
    parseAdvanced(page, type, parm) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("PA");
            const basicSelectors = new selectors_1.BasicSelectors();
            const postSelectors = new selectors_1.PostSelectors();
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
            function getComments() {
                return __awaiter(this, void 0, void 0, function* () {
                    let allComments = [];
                    let standardInfo = [];
                    const commentHolder = yield page.$('.css-1qp5gj2-DivCommentListContainer.ekjxngi3');
                    if (commentHolder) {
                        const commentProfileHolder = yield page.$('.css-1xlna7p-DivProfileWrapper.ekjxngi4');
                        if (commentProfileHolder) {
                            standardInfo.push(yield commentProfileHolder.evaluate((parent) => {
                                var _a, _b, _c;
                                const likeCount = (_a = parent.querySelector(':scope > .css-hlg65e-DivMainContent.e1mecfx01 > .css-184umhf-DivContainer.ehlq8k30 > .css-1452egd-DivFlexCenterRow-StyledWrapper.ehlq8k32 > .css-1d39a26-DivFlexCenterRow.ehlq8k31 > button:nth-of-type(1)')) === null || _a === void 0 ? void 0 : _a.ariaLabel;
                                const commentCount = (_b = parent.querySelector(':scope > .css-hlg65e-DivMainContent.e1mecfx01 > .css-184umhf-DivContainer.ehlq8k30 > .css-1452egd-DivFlexCenterRow-StyledWrapper.ehlq8k32 > .css-1d39a26-DivFlexCenterRow.ehlq8k31 > button:nth-of-type(2) > strong')) === null || _b === void 0 ? void 0 : _b.textContent;
                                const repostCount = (_c = parent.querySelector(':scope > .css-hlg65e-DivMainContent.e1mecfx01 > .css-184umhf-DivContainer.ehlq8k30 > .css-1452egd-DivFlexCenterRow-StyledWrapper.ehlq8k32 > .css-1d39a26-DivFlexCenterRow.ehlq8k31 > button:nth-of-type(3) > strong')) === null || _c === void 0 ? void 0 : _c.textContent;
                                return {
                                    likeCount: likeCount !== null && likeCount !== void 0 ? likeCount : '',
                                    commentCount: commentCount !== null && commentCount !== void 0 ? commentCount : '',
                                    repostCount: repostCount !== null && repostCount !== void 0 ? repostCount : ''
                                };
                            }));
                        }
                        const results = yield commentHolder.evaluate((parent) => {
                            let comments = [];
                            const childComments = parent.querySelectorAll(':scope > .css-1i7ohvi-DivCommentItemContainer.eo72wou0 > .css-ulyotp-DivCommentContentContainer.e1g2efjf0 > .css-1mf23fd-DivContentContainer.e1g2efjf1');
                            childComments.forEach(div => {
                                var _a, _b, _c, _d, _e, _f;
                                let parent = div.closest('.css-ulyotp-DivCommentContentContainer.e1g2efjf0');
                                let comment = (_a = div.querySelector('p')) === null || _a === void 0 ? void 0 : _a.textContent;
                                let posterTag = (_b = div.querySelector('a')) === null || _b === void 0 ? void 0 : _b.href;
                                let posterName = (_c = div.querySelector('a > span')) === null || _c === void 0 ? void 0 : _c.textContent;
                                let likeCount = (_e = (_d = parent === null || parent === void 0 ? void 0 : parent.querySelector('.css-1swe2yf-DivActionContainer.esns4rh0 > .css-114tc9h-DivLikeWrapper.ezxoskx0')) === null || _d === void 0 ? void 0 : _d.ariaLabel) === null || _e === void 0 ? void 0 : _e.toString();
                                comments.push({
                                    comment: comment !== null && comment !== void 0 ? comment : '',
                                    posterTag: posterTag !== null && posterTag !== void 0 ? posterTag : '',
                                    posterName: posterName !== null && posterName !== void 0 ? posterName : '',
                                    likeCount: likeCount ? (_f = likeCount.match(/\d+[KMB]?/)) === null || _f === void 0 ? void 0 : _f.toString() : '' // extract only number and trailing K,M,B
                                });
                            });
                            return comments;
                        });
                        allComments.push(...results);
                    }
                    console.log(standardInfo);
                    console.log(allComments);
                });
            }
            // refresh button (pops up on web page every time is opened)
            const button = yield page.$('::-p-xpath(//*[@id="main-content-others_homepage"]/div/div[2]/main/div/button)');
            if (button) {
                yield button.click();
                yield new Promise(resolve => setTimeout(resolve, 3000));
            }
            // Click the first post to navigate to feed
            const firstPostBtn = yield page.$('div[data-e2e="user-post-item"]');
            if (firstPostBtn) {
                yield firstPostBtn.click();
                yield new Promise(resolve => setTimeout(resolve, 1000));
                // Scroll through posts, i is depth
                for (var i = 0; i < 1; i++) {
                    yield checkGuest();
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                    yield getComments();
                    let nextBtn = yield page.waitForSelector('button[data-e2e="arrow-right"]');
                    // await nextBtn?.click();
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            //   if (element) {
            //     // Find the first anchor tag within the selected div
            //     // const href = await page.evaluate(div => {
            //     //   const anchor = div.querySelector('a'); // Select the first a tag within the div
            //     //   return anchor ? anchor.href : null; // Return the href attribute if the anchor exists
            //     // }, element);
            //     await element.click();
            //     console.log('First href:', href);
            //   } else {
            //     console.log('Element not found');
            //   }
            // basicSelectors.setWaiter(2);
            // if (type === 'posts') {
            //     const maxDepth = parseInt(parm);
            //     let curDepth = 1;
            //     const allPosts: Post[] = [];
            //     try {
            //         await page.waitForSelector(basicSelectors.x(basicSelectors.postHolderWaiter));
            //     } catch (e) {
            //         return ['Unable to locate post content selector. Please lower post waiter value.'];
            //     }
            //     while (curDepth <= maxDepth) {
            //         try {
            //             await page.waitForSelector(basicSelectors.x(basicSelectors.postHolderWaiter));
            //             const postHolder = await page.$(basicSelectors.x(basicSelectors.postHolder));
            //             if (postHolder) {
            //                 const results = await postHolder.evaluate((parent, postSelectors) => {
            //                     const posts: Post[] = [];
            //                     const childDivs = parent.querySelectorAll(':scope > div');
            //                     childDivs.forEach(div => {
            //                         posts.push({
            //                             headingName: div.querySelector(postSelectors.headingSelectors.headingName)?.textContent || 'No Heading',
            //                             headingTag: div.querySelector(postSelectors.headingSelectors.headingTag)?.textContent || 'No Heading',
            //                             headingDate: div.querySelector(postSelectors.headingSelectors.headingDate)?.textContent || 'No Heading',
            //                             caption: div.querySelector(postSelectors.contentSelectors.caption)?.textContent || 'No title',
            //                             commentCount: div.querySelector(postSelectors.metricSelectors.commentCount)?.textContent || 'No Comment Count',
            //                             repostCount: div.querySelector(postSelectors.metricSelectors.repostCount)?.textContent || 'No Repost Count',
            //                             likeCount: div.querySelector(postSelectors.metricSelectors.likeCount)?.textContent || 'No Like Count',
            //                             mediaThumbLink: div.querySelector(postSelectors.contentSelectors.mediaThumbLink)?.getAttribute('poster') || 'No Media',
            //                             imageLink: div.querySelector(postSelectors.contentSelectors.imageLink)?.getAttribute('src') || 'No Image'
            //                         });
            //                     });
            //                     return posts;
            //                 }, postSelectors);
            //                 allPosts.push(...results);
            //             }
            //             await page.evaluate(() => window.scrollBy(0, 500));
            //             await new Promise(resolve => setTimeout(resolve, 2000));
            //             curDepth++;
            //         } catch (e) {
            //             console.error('Error parsing advanced data:', e);
            //             break;
            //         }
            //     }
            //     let filtered = allPosts.filter((post, index, self) =>
            //         index === self.findIndex(p => p.caption === post.caption && p.headingDate === post.headingDate)
            //     );
            //     return filtered;
            // }
            // if (type === 'aidescription') {
            //     let osintDesc = await this.getOsintDescription();
            //     return [osintDesc];
            // }
            return [];
            // return [];
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
                    let tst = yield this.parseAdvanced(page, '', '');
                    if (hasAdvanced.length > 0) {
                        // Order the advanced query parms to match the valid parms list since some depend on previous ones
                        hasAdvanced = hasAdvanced.sort((a, b) => {
                            return this.validAdvanced.indexOf(a) - this.validAdvanced.indexOf(b);
                        });
                        for (const q of hasAdvanced) {
                            this.osintProfile.advanced[q] = yield this.parseAdvanced(page, q, query.query[q].toString());
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
