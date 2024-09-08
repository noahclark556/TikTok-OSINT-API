import { Page } from 'puppeteer';
import { sendMessageToGPT4 } from '../services/gpt-client';
import { OsintBrowser } from '../services/browser'
import { BasicSelectors, Endpoints, PostSelectors } from '../models/classes/selectors';
import { Post, PostComment } from '../models/classes/newModels';

import axios from 'axios';

export class OsintX {
    private validBasics;
    private validAdvanced;
    private basicProfile: BasicProfile;
    private osintProfile: OsintProfile;
    private endpoints = new Endpoints();

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

    private async getComments(url:string) : Promise<Array<PostComment>>{
        let comments: Array<PostComment> = [];
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
                }
            });
            // console.log(url);
            let result = response.data;
            console.log(result);
            let items : Array<any> = result["comments"];
            items.forEach(p => {
                let comment:PostComment = PostComment.fromJson(p);
                comments.push(comment);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        return comments;
    }

    private async getPosts(endpoints:Endpoints):Promise<Array<Post>>{
        let posts : Array<Post> = [];
        try {
            const response = await axios.get(endpoints.posts, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
                }
            });
            let result = response.data;
            let items : Array<any> = result["itemList"];
            items.forEach(p => {
                let post:Post = Post.fromJson(p);
                posts.push(post);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        return posts;
    }

    private async parseAdvanced(page:Page) {
        let posts : Array<Post> = await this.getPosts(this.endpoints);
        await page.goto(posts[0].postUrl, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        if(this.endpoints.comments.length > 0){
            await this.getComments(this.endpoints.comments);
        }
    }

    public async finalizeEndpoints(browser:OsintBrowser, page:Page){
        let posts : Array<Post> = await this.getPosts(this.endpoints);
        await page.goto(posts[0].postUrl);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await browser.close();
        posts.forEach(async p => {
            await this.getComments(p.commentUrl(this.endpoints.comments, p.id));
        });
    }

    public async executeQuery(query: Query): Promise<OsintProfile> {
        const url = `https://tiktok.com/@joemyheck`;
        const osintBrowser = new OsintBrowser(url);
        await osintBrowser.initialize();
        const page = osintBrowser.page;

        if(page){
            // Listen for request for post data, store validated url
            const requestListener1 = async (request: any) => {
                if (request.url().includes('item_list/?WebIdLastTime')) {
                  this.endpoints.posts = request.url();
                  this.finalizeEndpoints(osintBrowser, page);
                  page?.off('request', requestListener1);
                }
              };
              // Listen for request for comment data, store validated url
              const requestListener2 = async (request: any) => {
                if (request.url().includes('comment/list/?WebIdLastTime')) {
                  this.endpoints.comments = request.url();
                  page?.off('request', requestListener2);
                }
              };
            // Listen for url with validated auth data then store it
            page.on('request', requestListener1);
            page.on('request', requestListener2);
        }
        return {};
    }

    public buildQuery(username: string, q: { [key: string]: any }): Query {
        const basicSelectors = new BasicSelectors();
        const query: Query = {
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