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

    private async parseAdvanced(page: Page, scrollDepth: number): Promise<Array<any>> {
        const basicSelectors = new BasicSelectors();
        const postSelectors = new PostSelectors();
        let posts: Array<Post> = [];

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

        async function getPostData(postSelectors: PostSelectors): Promise<Post> {
            let post: Post = {
                postNumber: posts.length + 1,
                postUrl: page.url(),
                likeCount: '',
                commentCount: '',
                repostCount: '',
                caption: '',
                comments: []
            };

            const commentHolder = await page.$(postSelectors.commentBlockSelectors.commentHolder);
            if (commentHolder) {
                const commentProfileHolder = await page.$(postSelectors.commentBlockSelectors.commentProfileHolder);

                if (commentProfileHolder) {
                    post = await commentProfileHolder.evaluate((parent, postSelectors, post) => {
                        const likeCount = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.likeCount}`)?.ariaLabel;
                        const commentCount = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.commentCount}`)?.textContent;
                        const repostCount = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.repostCount}`)?.textContent;
                        const caption = parent.querySelector(`:scope > ${postSelectors.commentHeadingSelectors.caption}`)?.textContent;
                        post.likeCount = likeCount ?? '';
                        post.commentCount = commentCount ?? '';
                        post.repostCount = repostCount ?? '';
                        post.caption = caption ?? ''
                        return post;
                    }, postSelectors, post);

                }

                const results = await commentHolder.evaluate((parent, postSelectors) => {
                    let comments: Array<PostComment> = [];
                    const childComments = parent.querySelectorAll(`:scope > ${postSelectors.commentDataSelectors.commentItem}`);
                    childComments.forEach(div => {
                        let parent = div.closest(postSelectors.commentDataSelectors.parentHolder);
                        let comment = div.querySelector(postSelectors.commentDataSelectors.comment)?.textContent;
                        let posterTag = (div.querySelector(postSelectors.commentDataSelectors.posterTag) as HTMLAnchorElement)?.href;
                        let posterName = div.querySelector(postSelectors.commentDataSelectors.posterName)?.textContent;
                        let likeCount = parent?.querySelector(postSelectors.commentDataSelectors.likeCount)?.ariaLabel?.toString().match(/\d+[KMB]?/)?.toString();
                        comments.push({
                            comment: comment ?? '',
                            posterTag: posterTag ?? '',
                            posterName: posterName ?? '',
                            likeCount: likeCount ?? ''
                        });
                    });

                    return comments;
                }, postSelectors);
                post.comments = results;
            }
            return post;
        }
        

        // refresh button (pops up on web page every time is opened)
        const button = await page.$(postSelectors.refreshBtn);
        if (button) {
            await button.click()
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Click the first post to navigate to feed
        const firstPostBtn = await page.$(postSelectors.firstPostBtn);
        if (firstPostBtn) {
            await firstPostBtn.click();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Scroll through posts, i is depth
            for (var i = 0; i <= scrollDepth; i++) {
                await checkGuest();
                await new Promise(resolve => setTimeout(resolve, 1000));
                posts.push(await getPostData(postSelectors));
                let nextBtn = await page.waitForSelector(postSelectors.nextPostBtn); //css-13if7zh-DivCommentContainer ekjxngi0
                break;
                await nextBtn?.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        const divPosition = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            element?.scrollBy(10, 500);
            const rect = element!.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,  // X coordinate at the middle of the div
                y: rect.top + rect.height / 2   // Y coordinate at the middle of the div
            };
        }, '.css-1qjw4dg-DivContentContainer.e1mecfx00');
    
        // Move the mouse to the div's position
        await page.mouse.move(divPosition.x, divPosition.y);
    
        // Press the mouse button down to start dragging
        await page.mouse.down();
    
        // Drag the mouse down by 200 pixels
        await page.mouse.move(divPosition.x, divPosition.y + 200, { steps: 10 });
    
        // Release the mouse button to complete the drag
        await page.mouse.up();
    
        return posts;
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
                let posts: Array<Post> = await this.parseAdvanced(page!, 2);

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
                        this.osintProfile.advanced![q] = await this.parseAdvanced(page!, 5);
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