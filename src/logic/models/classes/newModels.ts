export class Author {
    avatarLarger: string;
    avatarMedium: string;
    avatarThumb: string;
    commentSetting: number;
    downloadSetting: number;
    duetSetting: number;
    ftc: boolean;
    id: string;
    isADVirtual: boolean;
    isEmbedBanned: boolean;
    nickname: string;
    openFavorite: boolean;
    privateAccount: boolean;
    relation: number;
    secUid: string;
    secret: boolean;
    signature: string;
    stitchSetting: number;
    uniqueId: string;
    verified: boolean;
  
    constructor(data: any) {
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
  
    static fromJson(json: any): Author {
      return new Author(json);
    }
  }
  
  export class Music {
    authorName: string;
    coverLarge: string;
    coverMedium: string;
    coverThumb: string;
    duration: number;
    id: string;
    original: boolean;
    playUrl: string;
    title: string;
  
    constructor(data: any) {
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
  
    static fromJson(json: any): Music {
      return new Music(json);
    }
  }
  
 export class Stats {
    collectCount: number;
    commentCount: number;
    diggCount: number;
    playCount: number;
    shareCount: number;
  
    constructor(data: any) {
      this.collectCount = data.collectCount;
      this.commentCount = data.commentCount;
      this.diggCount = data.diggCount;
      this.playCount = data.playCount;
      this.shareCount = data.shareCount;
    }
  
    static fromJson(json: any): Stats {
      return new Stats(json);
    }
  }
  
  export class StatsV2 {
    collectCount: string;
    commentCount: string;
    diggCount: string;
    playCount: string;
    repostCount: string;
    shareCount: string;
  
    constructor(data: any) {
      this.collectCount = data.collectCount;
      this.commentCount = data.commentCount;
      this.diggCount = data.diggCount;
      this.playCount = data.playCount;
      this.repostCount = data.repostCount;
      this.shareCount = data.shareCount;
    }
  
    static fromJson(json: any): StatsV2 {
      return new StatsV2(json);
    }
  }
  
export  class Video {
    VQScore: string;
    bitrate: number;
    codecType: string;
    cover: string;
    definition: string;
    downloadAddr: string;
    duration: number;
    dynamicCover: string;
    format: string;
    height: number;
    id: string;
    originCover: string;
    playAddr: string;
    width: number;
  
    constructor(data: any) {
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
  
    static fromJson(json: any): Video {
      return new Video(json);
    }
  }
  
export  class ItemControl {
    can_repost: boolean;
  
    constructor(data: any) {
      this.can_repost = data.can_repost;
    }
  
    static fromJson(json: any): ItemControl {
      return new ItemControl(json);
    }
  }
  
export class Post {
    AIGCDescription: string;
    author: Author;
    backendSourceEventTracking: string;
    challenges: any[];  // Adjust based on your data
    collected: boolean;
    contents: any[];  // Adjust based on your data
    createTime: number;
    desc: string;
    digged: boolean;
    duetDisplay: number;
    duetEnabled: boolean;
    forFriend: boolean;
    id: string;
    itemCommentStatus: number;
    item_control: ItemControl;
    music: Music;
    officalItem: boolean;
    originalItem: boolean;
    privateItem: boolean;
    secret: boolean;
    shareEnabled: boolean;
    stats: Stats;
    statsV2: StatsV2;
    stitchDisplay: number;
    stitchEnabled: boolean;
    textExtra: any[];  // Adjust based on your data
    video: Video;
    postUrl: string;
  
    constructor(data: any) {
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
      this.postUrl = `https://www.tiktok.com/@joemyheck/video/${data.id}`
    }
  
    public commentUrl(url: string, id: string): string {
        // Create a URL object from the input URL
        const urlObj = new URL(url);
      
        // Replace the "aweme_id" parameter in the search query
        urlObj.searchParams.set('aweme_id', id);
      
        // Return the modified URL as a string
        return urlObj.toString();
      }

    static fromJson(json: any): Post {
      return new Post(json);
    }
  }
  