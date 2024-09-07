function escapeQueryJson(url: string): string {
    let spl = url.split("=");
    let enc = encodeURIComponent(spl[3]);
    return `${spl[0]}=${spl[1]}=${spl[2]}=${enc}`;
}

const originalUrl = 'http://localhost:8080/osintx?username=realdonaldtrump&apikey=noahclark556&query={"bio":true,"name":true,"following":true,"followers":true,"posts":5,"aidescription":true}';
const escapedUrl = escapeQueryJson(originalUrl);

console.log(`curl -X GET "${escapedUrl}"`);

