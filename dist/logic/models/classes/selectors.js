"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSelectors = exports.BasicSelectors = void 0;
class BasicSelectors {
    constructor(waitFor = 5) {
        this.waiter = waitFor;
        this.postHolder = '/html/body/div[1]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/section/div/div';
        this.postHolderWaiter = `${this.postHolder}/div[${this.waiter.toString()}]`;
        this.infoSelectors = {
            title: 'STD_SELECTOR{?}h1[data-e2e="user-title"]',
            subtitle: 'STD_SELECTOR{?}h2[data-e2e="user-subtitle"]',
            bio: 'STD_SELECTOR{?}h2[data-e2e="user-bio"]',
            link: 'STD_SELECTOR{?}a[data-e2e="user-link"]',
            following: 'STD_SELECTOR{?}strong[data-e2e="following-count"]',
            followers: 'STD_SELECTOR{?}strong[data-e2e="followers-count"]',
            likes: 'STD_SELECTOR{?}strong[data-e2e="likes-count"]',
        };
    }
    setWaiter(waitFor) {
        this.waiter = waitFor;
        this.postHolderWaiter = `${this.postHolder}/div[${this.waiter.toString()}]`;
    }
    x(path) {
        return `::-p-xpath(${path})`;
    }
}
exports.BasicSelectors = BasicSelectors;
class PostSelectors {
    constructor() {
        this.postContent = 'article > div > div > div:nth-of-type(2)';
        this.headingBlock = `${this.postContent} > div:nth-of-type(2) > div:nth-of-type(1)`;
        this.postMetricsBlock = `${this.postContent} > div:nth-of-type(2) > div:nth-of-type(4) > div > div`;
        this.headingSelectors = {
            headingName: `${this.headingBlock} > div > div > div > div > div > div > a > div > div > span > span`,
            headingTag: `${this.headingBlock} > div > div > div > div > div:nth-of-type(2) > div > div`,
            headingDate: `${this.headingBlock} > div > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > a > time`
        };
        this.contentSelectors = {
            caption: `${this.postContent} > div:nth-of-type(2) > div:nth-of-type(2) > div`,
            mediaThumbLink: `${this.postContent} > div:nth-of-type(2) > div:nth-of-type(3) > div > div > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > div > video`,
            imageLink: `${this.postContent} > div:nth-of-type(2) > div:nth-of-type(3) > div > div > div > div > div > div > a > div > div:nth-of-type(2) > div > img`
        };
        this.metricSelectors = {
            commentCount: `${this.postMetricsBlock} > div > button > div > div:nth-of-type(2) > span > span`,
            repostCount: `${this.postMetricsBlock} > div:nth-of-type(2) > button > div > div:nth-of-type(2)`,
            likeCount: `${this.postMetricsBlock} > div:nth-of-type(3) > button > div > div:nth-of-type(2)`
        };
    }
}
exports.PostSelectors = PostSelectors;
