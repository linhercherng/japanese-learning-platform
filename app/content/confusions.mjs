// 字形提示是輔助記憶，不取代實際筆順動畫與詞音。
export const confusionPairs=[
 {id:'shi-tsu',title:'シ／ツ：最後一筆方向',leftId:'k-30b7',rightId:'k-30c4',left:'シ',right:'ツ',conceptId:'c-k-shi-tsu',difference:'シ短點較橫、最後一筆由左下往右上；ツ短點較直、最後一筆由上往左下。先對照起筆，不只看斜度。',memoryTip:'用手沿最後一筆走一次；遮住範字後寫シ與ツ，再讀シャツ。'},
 {id:'so-n',title:'ソ／ン：長筆起點',leftId:'k-30bd',rightId:'k-30f3',left:'ソ',right:'ン',conceptId:'c-k-so-n',difference:'ソ長筆從上方向左下，ン從左下向右上。兩字筆畫數相同，方向與起點才是分辨重點。',memoryTip:'ソ往下、ン往上；把ソファ和パン的音連到各自的字。'},
 {id:'nu-me',title:'ぬ／め：右下小圈',leftId:'h-306c',rightId:'h-3081',left:'ぬ',right:'め',conceptId:'c-k-nu-me',difference:'兩字都有交叉的大曲線；ぬ右下收尾多一個小圈，め沒有。大弧線的比例會變，小圈區別仍需保留。',memoryTip:'寫ぬの後圈出ぬ的小圈；寫め時檢查不要額外繞圈。'},
 {id:'re-ne',title:'れ／ね：伸出還是繞圈',leftId:'h-308c',rightId:'h-306d',left:'れ',right:'ね',conceptId:'c-k-re-ne',difference:'左側直筆相似，右側收尾不同：れ向外伸出，ね在右下繞小圈。先看尾端，不用起頭猜整字。',memoryTip:'ねこ的ね繞圈，れきし的れ伸出；默寫後從右側驗證。'},
 {id:'ha-ho',title:'は／ほ：一橫還是兩橫',leftId:'h-306f',rightId:'h-307b',left:'は',right:'ほ',conceptId:'c-k-ha-ho',difference:'は右側一條橫筆，ほ右側兩條橫筆；兩字右下都有曲線，所以有無小圈不是這組的辨別方式。',memoryTip:'只數右側橫筆，再念はな與ほし；助詞は的wa讀法另外記。'},
 {id:'wa-re',title:'わ／れ：圓弧與外伸尾',leftId:'h-308f',rightId:'h-308c',left:'わ',right:'れ',conceptId:'c-k-wa-re',difference:'わ的右邊有圓弧形肚子，れ的右側向外伸出收尾。不要和ね的小圈混在一起；這裡比較的是大輪廓。',memoryTip:'把わたし與れきし各寫一詞；最後只看右側輪廓是否對上。'},
];
