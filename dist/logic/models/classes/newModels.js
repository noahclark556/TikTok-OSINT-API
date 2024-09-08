"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.ItemControl = exports.Video = exports.StatsV2 = exports.Stats = exports.Music = exports.Author = void 0;
class Author {
    constructor(data) {
        this.avatarLarger = data.avatarLarger;
        this.avatarMedium = data.avatarMedium;
        this.avatarThumb = data.avatarThumb;
        this.commentSetting = data.commentSetting;
        this.downloadSetting = data.downloadSetting;
        this.duetSetting = data.duetSetting;
        this.ftc = data.ftc;
        this.id = data.id;
        this.isADVirtual = data.isADVirtual;
        this.isEmbedBanned = data.isEmbedBanned;
        this.nickname = data.nickname;
        this.openFavorite = data.openFavorite;
        this.privateAccount = data.privateAccount;
        this.relation = data.relation;
        this.secUid = data.secUid;
        this.secret = data.secret;
        this.signature = data.signature;
        this.stitchSetting = data.stitchSetting;
        this.uniqueId = data.uniqueId;
        this.verified = data.verified;
    }
    static fromJson(json) {
        return new Author(json);
    }
}
exports.Author = Author;
class Music {
    constructor(data) {
        this.authorName = data.authorName;
        this.coverLarge = data.coverLarge;
        this.coverMedium = data.coverMedium;
        this.coverThumb = data.coverThumb;
        this.duration = data.duration;
        this.id = data.id;
        this.original = data.original;
        this.playUrl = data.playUrl;
        this.title = data.title;
    }
    static fromJson(json) {
        return new Music(json);
    }
}
exports.Music = Music;
class Stats {
    constructor(data) {
        this.collectCount = data.collectCount;
        this.commentCount = data.commentCount;
        this.diggCount = data.diggCount;
        this.playCount = data.playCount;
        this.shareCount = data.shareCount;
    }
    static fromJson(json) {
        return new Stats(json);
    }
}
exports.Stats = Stats;
class StatsV2 {
    constructor(data) {
        this.collectCount = data.collectCount;
        this.commentCount = data.commentCount;
        this.diggCount = data.diggCount;
        this.playCount = data.playCount;
        this.repostCount = data.repostCount;
        this.shareCount = data.shareCount;
    }
    static fromJson(json) {
        return new StatsV2(json);
    }
}
exports.StatsV2 = StatsV2;
class Video {
    constructor(data) {
        this.VQScore = data.VQScore;
        this.bitrate = data.bitrate;
        this.codecType = data.codecType;
        this.cover = data.cover;
        this.definition = data.definition;
        this.downloadAddr = data.downloadAddr;
        this.duration = data.duration;
        this.dynamicCover = data.dynamicCover;
        this.format = data.format;
        this.height = data.height;
        this.id = data.id;
        this.originCover = data.originCover;
        this.playAddr = data.playAddr;
        this.width = data.width;
    }
    static fromJson(json) {
        return new Video(json);
    }
}
exports.Video = Video;
class ItemControl {
    constructor(data) {
        this.can_repost = data.can_repost;
    }
    static fromJson(json) {
        return new ItemControl(json);
    }
}
exports.ItemControl = ItemControl;
class Post {
    constructor(data) {
        this.AIGCDescription = data.AIGCDescription;
        this.author = Author.fromJson(data.author);
        this.backendSourceEventTracking = data.backendSourceEventTracking;
        this.challenges = data.challenges;
        this.collected = data.collected;
        this.contents = data.contents;
        this.createTime = data.createTime;
        this.desc = data.desc;
        this.digged = data.digged;
        this.duetDisplay = data.duetDisplay;
        this.duetEnabled = data.duetEnabled;
        this.forFriend = data.forFriend;
        this.id = data.id;
        this.itemCommentStatus = data.itemCommentStatus;
        this.item_control = ItemControl.fromJson(data.item_control);
        this.music = Music.fromJson(data.music);
        this.officalItem = data.officalItem;
        this.originalItem = data.originalItem;
        this.privateItem = data.privateItem;
        this.secret = data.secret;
        this.shareEnabled = data.shareEnabled;
        this.stats = Stats.fromJson(data.stats);
        this.statsV2 = StatsV2.fromJson(data.statsV2);
        this.stitchDisplay = data.stitchDisplay;
        this.stitchEnabled = data.stitchEnabled;
        this.textExtra = data.textExtra;
        this.video = Video.fromJson(data.video);
        this.postUrl = `https://www.tiktok.com/@joemyheck/video/${data.id}`;
    }
    commentUrl(url, id) {
        // Create a URL object from the input URL
        const urlObj = new URL(url);
        // Replace the "aweme_id" parameter in the search query
        urlObj.searchParams.set('aweme_id', id);
        // Return the modified URL as a string
        return urlObj.toString();
    }
    static fromJson(json) {
        return new Post(json);
    }
}
exports.Post = Post;
