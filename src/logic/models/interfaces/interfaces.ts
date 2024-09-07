interface OsintProfile {
    basicInfo?: BasicProfile;
    advanced?: { [key: string]: any };
}

interface BasicProfile {
    name?: string;
    bio?: string;
    following?: string;
    followers?: string;
}

interface Post {
    headingName?: string;
    headingTag?: string;
    headingDate?: string;
    caption?: string;
    commentCount?: string;
    repostCount?: string;
    likeCount?: string;
    mediaThumbLink?: string;
    imageLink?: string;
}

interface Query {
    username: string;
    query: { [key: string]: any };
}