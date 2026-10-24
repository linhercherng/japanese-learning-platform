import {kana} from '../content/kana.mjs';
const pages=new Set(['kana','unit','stroke','write','kana-map','kana-words','kana-guide','confusion']);
/** Input is the actual rendered innerText, so closed reference panels are not scanned. */
export function visibleKanaReference(route,text){return pages.has(route)?kana.filter(k=>String(text).includes(k.glyph)).map(k=>k.id):[];}
