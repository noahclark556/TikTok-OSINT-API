import {OsintX} from './logic/api/osintt'
const username = '';
const key = '';
const q = JSON.parse('{"title":true, "subtitle":true, "following":true, "followers":true, "likes":true, "bio":true, "link":true}');
// const q = JSON.parse('{"name":true,"bio":true,"followers":true,"following":true,"posts":5}');
let osintApi = new OsintX();

// getting links will be gathering all data-e2e="user-post-item" > a[1].href
// put all those in a list
// navigate to each with browser, grab data from each.
// or
// navigate to first, use scroll, wait, grab data (better prob)

async function getIt(){
    const query = osintApi.buildQuery('joemyheck', q);
    const result = await osintApi.executeQuery(query);
    console.log(result);
}

getIt();
