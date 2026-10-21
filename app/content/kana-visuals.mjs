import {kana} from './kana.mjs';
import {memoryFor} from './kana-memory.mjs';
// Original vector associations. These are learning aids, not historical character origins.
const motifs=[
 [/雨傘/, '傘面與傘柄',['M18 62 Q64 4 110 62 Z','M64 25 V99 Q64 116 48 108']],
 [/耳朵/, '一對長短耳朵',['M29 100 Q18 27 36 15 Q51 15 48 98','M77 100 Q72 40 89 32 Q108 39 99 101']],
 [/海浪/, '一層一層的海浪',['M10 48 Q25 20 43 48 T78 48 T114 48','M10 78 Q25 50 43 78 T78 78 T114 78']],
 [/箭頭|指示/, '折角箭頭',['M22 99 L92 29','M48 29 H92 V73']],
 [/釣鉤|鉤/, '鉤子與收尾',['M80 16 V78 Q80 114 48 106 Q25 96 38 75','M80 16 L66 33']],
 [/小盒子|盒子|書架/, '盒子的開口與邊框',['M24 27 H102 V102 H24','M24 66 H91']],
 [/山|屋頂|屋簷/, '山峰與斜屋簷',['M12 97 L61 28 L114 97','M35 69 H91']],
 [/鳥嘴|折角/, '張開的折角',['M100 20 L26 65 L101 109']],
 [/笑臉|笑/, '向上收起的笑臉',['M23 48 Q28 114 69 104 Q101 95 107 49','M32 24 V33','M97 24 V33']],
 [/風/, '向外散開的風',['M10 41 H73 Q104 41 91 22 Q81 11 72 23','M10 64 H105','M12 85 H63 Q91 86 79 107']],
 [/交叉/, '交叉處與獨立小筆',['M20 27 L97 103','M100 23 L25 105','M105 50 L117 64']],
 [/小圈|彎圈|圈|環/, '彎線末端的小圈',['M18 24 Q107 4 90 68 Q72 119 42 90 Q20 60 70 59 Q119 62 104 109']],
 [/柱|橫桿|橫筆/, '柱子與橫桿',['M65 16 V112','M22 42 H105','M28 70 H99']],
 [/嘴/, '上下張開的嘴',['M18 40 Q65 16 111 40','M18 88 Q65 112 111 88']],
 [/彎|弧|路/, '彎路與轉折',['M20 18 L95 33 L45 66 Q17 91 79 112']],
 [/.*/, '短筆與長線的方向',['M23 26 L52 44','M95 20 Q36 70 104 111']]
];
export function mnemonicMotif(id){
 const k=kana.find(k=>k.id===id);if(!k)return null;
 const base=Array.from(k.glyph.normalize('NFD'))[0],parent=kana.find(x=>x.script===k.script&&x.glyph===base)||k;
 const tip=memoryFor(parent.id).tip,match=motifs.find(([pattern])=>pattern.test(tip));
 return {label:match[1],paths:match[2],mark:k.group==='voiced'?'dots':k.group==='semivoiced'?'circle':k.group==='contracted'?'small':null};
}
