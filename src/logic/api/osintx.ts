import { Page } from 'puppeteer';
import { sendMessageToGPT4 } from '../services/gpt-client';
import { OsintBrowser } from '../services/browser'
import { BasicSelectors, PostSelectors } from '../models/classes/selectors';

export class OsintX {
    private validBasics;
    private validAdvanced;
    private basicProfile: BasicProfile;
    private osintProfile: OsintProfile;

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

    private async getElementByXPath(page: Page, selector: string, init = false): Promise<string> {
        try {
            var elem;
            if (selector.includes('STD_SELECTOR')) {
                selector = selector.split("{?}")[1];
                elem = init ? await page.waitForSelector(`${selector}`) : await page.$(`${selector}`);
            } else {
                elem = init
                    ? await page.waitForSelector(`::-p-xpath(${selector})`)
                    : await page.$(`::-p-xpath(${selector})`);
            }

            return elem ? await page.evaluate(el => el.textContent || '', elem) : '';
        } catch (e) {
            console.error('Error getting element by XPath:', e);
            return '';
        }
    }

    private async getOsintDescription(): Promise<string> {
        try {
            let response = await sendMessageToGPT4([
                { role: 'system', content: 'Your job is to take this information pulled from someones X social media account and profile them. Make inferences and educated guesses about them and provide useful information for someone like an investigator to use. The data im giving you is a stringified json that contains either basic info, a bunch of user posts, or both.' },
                { role: 'user', content: JSON.stringify(this.osintProfile) },
            ]);
            return response.choices[0].message.content;
        } catch (error) {
            console.error('Failed to get a response from GPT-4:', error);
            return '';
        }
    }

    private async parseAdvanced(page: Page, type: string, parm: string): Promise<Array<any>> {
        console.log("PA");
        const basicSelectors = new BasicSelectors();
        const postSelectors = new PostSelectors();

        // await page.evaluate(() => window.scrollBy(0, 500));
        // await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for "continue as guest" modal and click it.
        async function checkGuest() {
            page.setDefaultTimeout(1000);
            let guest = await page.$('.css-txolmk-DivGuestModeContainer.exd0a435 > div > div:nth-child(2)');
            if (guest) {
                await guest.click();
                return true;
            }
            return false;
        }

        async function getComments(){
            let allComments = [];
            let standardInfo = [];
            const commentHolder = await page.$('.css-1qp5gj2-DivCommentListContainer.ekjxngi3');
                    if (commentHolder) {
                        
                        const commentProfileHolder = await page.$('.css-1xlna7p-DivProfileWrapper.ekjxngi4');
                        if(commentProfileHolder){
                            standardInfo.push(await commentProfileHolder.evaluate((parent) => {
                                const likeCount = parent.querySelector(':scope > .css-hlg65e-DivMainContent.e1mecfx01 > .css-184umhf-DivContainer.ehlq8k30 > .css-1452egd-DivFlexCenterRow-StyledWrapper.ehlq8k32 > .css-1d39a26-DivFlexCenterRow.ehlq8k31 > button:nth-of-type(1)')?.ariaLabel;
                                const commentCount = parent.querySelector(':scope > .css-hlg65e-DivMainContent.e1mecfx01 > .css-184umhf-DivContainer.ehlq8k30 > .css-1452egd-DivFlexCenterRow-StyledWrapper.ehlq8k32 > .css-1d39a26-DivFlexCenterRow.ehlq8k31 > button:nth-of-type(2) > strong')?.textContent;
                                const repostCount = parent.querySelector(':scope > .css-hlg65e-DivMainContent.e1mecfx01 > .css-184umhf-DivContainer.ehlq8k30 > .css-1452egd-DivFlexCenterRow-StyledWrapper.ehlq8k32 > .css-1d39a26-DivFlexCenterRow.ehlq8k31 > button:nth-of-type(3) > strong')?.textContent;
                                return {
                                    likeCount: likeCount ?? '',
                                    commentCount: commentCount ?? '',
                                    repostCount: repostCount ?? ''
                                };
                            }));

                        }

                        const results = await commentHolder.evaluate((parent) => {
                            let comments: object[] = [];
                            const childComments = parent.querySelectorAll(':scope > .css-1i7ohvi-DivCommentItemContainer.eo72wou0 > .css-ulyotp-DivCommentContentContainer.e1g2efjf0 > .css-1mf23fd-DivContentContainer.e1g2efjf1');
                            childComments.forEach(div => {
                                let parent = div.closest('.css-ulyotp-DivCommentContentContainer.e1g2efjf0');
                                let comment = div.querySelector('p')?.textContent;
                                let posterTag = div.querySelector('a')?.href;
                                let posterName = div.querySelector('a > span')?.textContent;
                                let likeCount = parent?.querySelector('.css-1swe2yf-DivActionContainer.esns4rh0 > .css-114tc9h-DivLikeWrapper.ezxoskx0')?.ariaLabel?.toString();
                                comments.push({
                                    comment: comment ?? '',
                                    posterTag: posterTag ?? '',
                                    posterName: posterName ?? '',
                                    likeCount:likeCount ? likeCount.match(/\d+[KMB]?/)?.toString() : '' // extract only number and trailing K,M,B
                                });
                            });
                            return comments;
                        });
                        allComments.push(...results);
                    }
            console.log(standardInfo);
            console.log(allComments);
        }

        // refresh button (pops up on web page every time is opened)
        const button = await page.$('::-p-xpath(//*[@id="main-content-others_homepage"]/div/div[2]/main/div/button)');
        if (button) {
            await button.click()
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Click the first post to navigate to feed
        const firstPostBtn = await page.$('div[data-e2e="user-post-item"]');
        if (firstPostBtn) {
            await firstPostBtn.click();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Scroll through posts, i is depth
            for (var i = 0; i < 1; i++) {
                await checkGuest();
                await new Promise(resolve => setTimeout(resolve, 1000));
                await getComments();
                let nextBtn = await page.waitForSelector('button[data-e2e="arrow-right"]');
                // await nextBtn?.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
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
    }

    public async executeQuery(query: Query): Promise<OsintProfile> {
        const url = `https://tiktok.com/@${query.username}`;
        const osintBrowser = new OsintBrowser(url);
        await osintBrowser.initialize();
        const page = osintBrowser.page;

        if (page) {
            try {
                let hasAdvanced: string[] = [];

                for (const key of Object.keys(query.query)) {
                    const k = key.toLowerCase();
                    const isFirstKey = k === Object.keys(query.query)[0];

                    if (this.validAdvanced.includes(k)) {
                        hasAdvanced.push(k);
                    } else if (this.validBasics.includes(k)) {
                        this.basicProfile[key as keyof BasicProfile] = await this.getElementByXPath(page!, query.query[k], isFirstKey);
                    } else {
                        console.log('Invalid Query Parameter');
                    }
                }

                this.osintProfile.basicInfo = this.basicProfile;
                let tst = await this.parseAdvanced(page!, '', '');


                if (hasAdvanced.length > 0) {
                    // Order the advanced query parms to match the valid parms list since some depend on previous ones
                    hasAdvanced = hasAdvanced.sort((a, b) => {
                        return this.validAdvanced.indexOf(a) - this.validAdvanced.indexOf(b);
                    });

                    for (const q of hasAdvanced) {
                        this.osintProfile.advanced![q] = await this.parseAdvanced(page!, q, query.query[q].toString());
                    }
                }

                return this.osintProfile;
            } catch (e) {
                console.error('Error executing query:', e);
                return { basicInfo: {}, advanced: {} };
            } finally {
                if (osintBrowser.browser) await osintBrowser.close();
            }
        }
        return {};
    }

    public buildQuery(username: string, q: { [key: string]: any }): Query {
        const basicSelectors = new BasicSelectors();
        const query: Query = {
            username,
            query: {}
        };

        Object.keys(q).forEach(key => {
            const k = key.toLowerCase();
            if (this.validBasics.includes(k)) {
                query.query[k] = basicSelectors.infoSelectors[k as keyof BasicSelectors['infoSelectors']];
            }
            if (this.validAdvanced.includes(k)) {
                query.query[k] = q[k];
            }
        });

        return query;
    }
}