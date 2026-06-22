// 10페이지 Canva 임포트용 HTML 생성 (이미지 공개URL + 편집 텍스트)
const fs = require('fs');
const path = require('path');
const IMG = JSON.parse(fs.readFileSync(path.join(__dirname, '_img_urls.json'), 'utf8'));
const W = 1080, H = 1350;
const pct = (v, base) => Math.round(v / 100 * base);

// 좌표 % 기준(1080x1350). narr=가로 띠, bub=말풍선 텍스트
const PAGES = [
  { n:'01', title:'표지 / 후킹',
    bubbles:[ {x:58,y:32,w:34,size:25, text:'딸이 애를 못 낳으면 병원에 끌고 가서라도 시험관 시술을 시켜야죠! 친정엄마가 너무 아무것도 안 하는 거 아니에요?'} ] },

  { n:'02', title:'그 전화를 받은 친정',
    narr:{pos:'top', size:31, text:'결혼 10년 차. 어느 날, 시어머니가 우리 친정 엄마에게 전화를 걸었다.'},
    bubbles:[ {x:38,y:8,w:24,size:18, text:'사돈, 이게 다 누구 책임이에요?'} ] },

  { n:'03', title:'우리가 보낸 시간',
    narr:{pos:'bottom', size:31, text:'나는 마흔하나. 결혼 10년 차. 30대 내내, 부부가 할 수 있는 노력은 다 해봤다.'} },

  { n:'04', title:'우리의 선택',
    narr:{pos:'bottom', size:31, text:'내 몸을 끝까지 희생하면서까지 갖고 싶진 않았다. 마흔이 넘으니 더 그랬다. 그건 우리 둘이 함께 내린 결정이었다.'} },

  { n:'05', title:'명절이면',
    narr:{pos:'top', size:31, text:'명절은, 매번 같은 질문으로 시작됐다.'},
    bubbles:[
      {x:55,y:17,w:28,size:19, text:'둘째는 언제? 아니, 아직 첫째도 없었나?'},
      {x:47,y:50,w:30,size:21, text:'누구네 며느리는 벌써 둘이래.'}
    ] },

  { n:'06', title:'밥상과 보약',
    bubbles:[
      {x:7,y:33,w:25,size:17, text:'애 가지려면 잘 먹어야지. 더 먹어, 더.'},
      {x:40,y:62,w:27,size:17, text:'이거 꼬박꼬박 먹고 몸 만들어.'}
    ] },

  { n:'07', title:'훑는 시선, 그리고 침묵',
    narr:{pos:'bottom', dark:true, size:29, text:'시아버지는 늘 그런 식으로 내 몸을 훑었다. 그리고 그 옆에서 남편은, 언제나처럼 아무 말이 없었다.'},
    bubbles:[ {x:42,y:8,w:32,size:21, text:'쯧, 너무 말랐다. 살 좀 찌워라. 그래야 애가 들어서지.'} ] },

  { n:'08', title:'친정으로 간 화살',
    narr:{pos:'bottom', size:29, text:'결국 화살은 친정으로 향했다. 그날, 그 전화를 받은 엄마는 한참을 울었다고 했다. 아무 잘못도 없는 우리 엄마가, 나 때문에.'},
    bubbles:[ {x:44,y:6,w:32,size:21, text:'친정에서 도대체 뭘 가르친 거예요?'} ] },

  { n:'09', title:'나의 밤',
    narr:{pos:'bottom', size:30, text:'정말, 아이가 없는 게 내 죄일까. 그 밤들이 쌓이는 동안 나는 조금씩 다른 사람이 되어 갔다.'} },

  { n:'10', title:'클리프행어',
    narr:{pos:'bottom', dark:true, size:31, text:'그땐 몰랐다. 이게 시작에 불과했다는 걸. 그리고 아이가 없는 진짜 이유는, 따로 있었다는 걸.'} },
];

function page(p){
  let els = `<img src="${IMG[p.n]}" alt="ep01 ${p.n}" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;object-fit:cover;">`;
  if(p.narr){
    const top = p.narr.pos === 'top';
    const bg = p.narr.dark ? '#2f2b27' : 'rgba(255,255,255,0.94)';
    const col = p.narr.dark ? '#f1ece4' : '#2f2b27';
    els += `<div style="position:absolute;left:0;${top?'top':'bottom'}:0;width:${W}px;background:${bg};color:${col};`
        + `font-size:${p.narr.size}px;font-weight:600;line-height:1.5;text-align:center;padding:22px 40px;box-sizing:border-box;">`
        + `${p.narr.text}</div>`;
  }
  (p.bubbles||[]).forEach(b=>{
    els += `<div style="position:absolute;left:${pct(b.x,W)}px;top:${pct(b.y,H)}px;width:${pct(b.w,W)}px;`
        + `font-size:${b.size}px;font-weight:700;line-height:1.34;text-align:center;color:#2f2b27;word-break:keep-all;">`
        + `${b.text}</div>`;
  });
  return `<div data-document-role="page" data-label="${p.n}컷 - ${p.title}" `
       + `style="position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#efe9e0;">${els}</div>`;
}

const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans CJK KR","Malgun Gothic",sans-serif;}</style>
</head><body>
${PAGES.map(page).join('\n')}
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'canva_import.html'), html);
console.log('wrote canva_import.html  pages:', PAGES.length, 'bytes:', html.length);
