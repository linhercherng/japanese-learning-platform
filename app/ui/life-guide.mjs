import {heading,back,primary,note,escapeHtml as e} from './shared.mjs';
export const lifeGuideSteps=[
 {title:'選一個真的會用到的場景',how:'挑現在需要的程度與場景。一次只看三句，先連起意思與聲音；需要時才展開日文、讀音或原音。',next:'不用一次背完三句。先挑一句，再進逐句回想卡；日文和參考音會留下提示紀錄。',links:[['選生活場景與逐句卡','life-memory'],['今天怎麼練','life-path']]},
 {title:'收起答案，換方向想一次',how:'在本課逐句卡先看中文想日文，或先聽原音想意思。卡住可展開核對，再讓這句隔幾張重新出現。',next:'卡片上的自評只幫這次安排順序，與原題首答分開。想動手寫，再選中文回想或聽寫。',links:[['回目錄選本課逐句卡','life-memory'],['看中文，想一句日文','life-recall'],['聽一句，自己寫','life-dictation']]},
 {title:'先寫記得的部分，提示慢慢加',how:'中文回想可先看一個字，再需要時看一小段；聽寫可重播正常或慢速原音。兩種模式的原稿分開保存。',next:'不用猜到完整才動筆，也不用搶快。輸入後主動對照課程原句；其他自然說法仍需教師核對。',links:[['中文到日文回想','life-recall'],['生活原句聽寫','life-dictation'],['找回自己的稿','life-workspace']]},
 {title:'只補卡住的一處，再想整句',how:'完整對照後選「一次只看一處差異」，看過後「遮住這一處，自己補回」。主動核對、再遮重試，再接整句從空白再想。',next:'字元相同不代表文法或翻譯評分。片段輸入暫存，刷新或離開收起；整句再想稿另存，原稿保持。',links:[['從中文回想練差異','life-recall'],['從聽寫練差異','life-dictation'],['找回原稿與再想稿','life-workspace']]},
 {title:'用原題確認，再換場景與自己的話',how:'一課回想最多三題，也能只選聽解、填空／排序或理解。學過多課後，同主題換已學場景；需要時在原課留下自己的日文作品或生活線索。',next:'原題首答、提示與同日加練分開。換原題不是新情境能力測驗，自己寫的作品仍以原課任務自評。',links:[['選一課與能力專練','life-memory'],['同主題換場景','life-topic'],['我的生活線索','life-notes']]},
 {title:'隔天與七日再想，今天適時收尾',how:'先開今天怎麼練，接續原輪或做符合日期的檢查。隔天與七日最多三題、每課一題，只取實際練過的原題。',next:'今天一輪完成就可以休息。地圖看原首答、能力與回顧，複習預告看下一次日期；沒有符合題目時，不用新題湊數。',links:[['今日一小步','life-path'],['隔天生活複習','life-check'],['七日生活回想','life-week'],['記憶地圖與原輪回顧','life-map'],['複習預告與收尾','life-schedule']]}
];
export function lifeGuideView(){
 return back('今天怎麼練','life-path')+heading('生活日語，容易學，也留時間記住。','六段完整路線，每次只選一小步；忘記時退回一點提示就好。')+primary('依我的紀錄選下一步','life-path')+primary('找回自己的練習','life-workspace')+lifeGuideSteps.map((s,i)=>`<section class="v3-section"><span class="tag">${i+1} / 6</span><h2>${e(s.title)}</h2><p>${e(s.how)}</p><p><strong>接著怎麼練：</strong>${e(s.next)}</p><nav class="ks-links" aria-label="${e(s.title)}">${s.links.map(([label,route])=>primary(label,route)).join('')}</nav></section>`).join('')+note('92個生活場景、276句與原題沿用既有試用教材。教師審校、真人聲音、實機與長期學習效果仍各自待驗證，不保證固定幾天記住。個人文字與進度留在這個瀏覽器，請定期到「我的」匯出JSON備份。');
}
