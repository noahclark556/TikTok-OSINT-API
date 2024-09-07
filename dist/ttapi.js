"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const osintt_1 = require("./logic/api/osintt");
const username = '';
const key = '';
const q = JSON.parse('{"title":true, "subtitle":true, "following":true, "followers":true, "likes":true, "bio":true, "link":true}');
// const q = JSON.parse('{"name":true,"bio":true,"followers":true,"following":true,"posts":5}');
let osintApi = new osintt_1.OsintX();
// getting links will be gathering all data-e2e="user-post-item" > a[1].href
// put all those in a list
// navigate to each with browser, grab data from each.
// or
// navigate to first, use scroll, wait, grab data (better prob)
function getIt() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = osintApi.buildQuery('joemyheck', q);
        const result = yield osintApi.executeQuery(query);
        console.log(result);
    });
}
getIt();
