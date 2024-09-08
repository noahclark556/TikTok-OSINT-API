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

interface PostComment {
    comment:string;
    posterTag:string;
    posterName:string;
    likeCount:string;
}

// interface Post {
//     postNumber:number;
//     postUrl:string;
//     likeCount:string;
//     commentCount:string;
//     repostCount:string;
//     caption:string;
//     comments:Array<PostComment>
// }

interface Query {
    username: string;
    query: { [key: string]: any };
}