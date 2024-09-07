"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSelectors = exports.BasicSelectors = void 0;
class BasicSelectors {
    constructor(waitFor = 5) {
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
    x(path) {
        return `::-p-xpath(${path})`;
    }
}
exports.BasicSelectors = BasicSelectors;
class PostSelectors {
    constructor() {
        // Clicked to refresh page to evade bot detect
        this.refreshBtn = '::-p-xpath(//*[@id="main-content-others_homepage"]/div/div[2]/main/div/button)';
        // Click to navigate to scrollable feed
        this.firstPostBtn = 'div[data-e2e="user-post-item"]';
        // Click to scroll to next post
        this.nextPostBtn = 'button[data-e2e="arrow-right"]';
        this.commentBlockSelectors = {
            // Checked to make sure comment side widget is on screen
            commentHolder: '.css-1qp5gj2-DivCommentListContainer.ekjxngi3',
            // Holds the profile data of poster on comment section
            commentProfileHolder: '.css-1xlna7p-DivProfileWrapper.ekjxngi4',
            // Children of commentProfileHolder
            // Like count, repost count, etc
            commentProfileMetricBlock: '.css-hlg65e-DivMainContent.e1mecfx01 > .css-184umhf-DivContainer.ehlq8k30 > .css-1452egd-DivFlexCenterRow-StyledWrapper.ehlq8k32 > .css-1d39a26-DivFlexCenterRow.ehlq8k31',
            // Caption, music, etc
            commentProfileDataBlock: '.css-pcqxr7-DivDescriptionContentWrapper.e1mecfx011 > .css-1nst91u-DivMainContent.e1mecfx01'
        };
        this.commentHeadingSelectors = {
            likeCount: `${this.commentBlockSelectors.commentProfileMetricBlock} > button:nth-of-type(1)`,
            commentCount: `${this.commentBlockSelectors.commentProfileMetricBlock} > button:nth-of-type(2) > strong`,
            repostCount: `${this.commentBlockSelectors.commentProfileMetricBlock} > button:nth-of-type(3) > strong`,
            caption: `${this.commentBlockSelectors.commentProfileDataBlock} > .css-bs495z-DivWrapper.e1mzilcj0 > .css-1rhses0-DivText.e1mzilcj1 > div:nth-of-type(2) > .css-1wdx3tj-DivContainer.ejg0rhn0 > span`
        };
        this.commentDataSelectors = {
            // Children of comment holder
            // Used in query selector all to get all comments
            commentItem: '.css-1i7ohvi-DivCommentItemContainer.eo72wou0 > .css-ulyotp-DivCommentContentContainer.e1g2efjf0 > .css-1mf23fd-DivContentContainer.e1g2efjf1',
            // Used to jump up to parent to grab like count
            parentHolder: '.css-ulyotp-DivCommentContentContainer.e1g2efjf0',
            // Child of parentHolder
            likeCount: '.css-1swe2yf-DivActionContainer.esns4rh0 > .css-114tc9h-DivLikeWrapper.ezxoskx0',
            // Children of holder
            comment: 'p',
            posterTag: 'a',
            posterName: 'a > span'
        };
    }
}
exports.PostSelectors = PostSelectors;
