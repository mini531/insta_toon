// 생성 이미지 위에 나레이션 띠/말풍선 텍스트를 얹어 PNG로 캡처
// 사용: node compose.js   ->  ep01/composed/NN.png 생성
const { chromium } = require('/mnt/c/project/nwk/private/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;                 // ep01
const OUT = path.join(DIR, 'composed');
const EXEC = '/home/mini531/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';
const W = 820, H = 1024;               // 원본과 동일(업스케일 금지)

// 좌표는 % 단위. bubble=말풍선 안 텍스트, narr=가로 띠 나레이션
const PANELS = [
  { file:'01.png',
    bubbles:[ {x:60,y:33,w:32,size:14, text:'딸이 애를 못 낳으면 병원에 끌고 가서라도 시험관 시술을 시켜야죠! 친정엄마가 너무 아무것도 안 하는 거 아니에요?'} ] },

  { file:'02.png',
    narr:{pos:'top', text:'결혼 10년 차. 어느 날, 시어머니가 우리 친정 엄마에게 전화를 걸었다.'},
    bubbles:[ {x:40,y:9,w:20,size:11, text:'사돈, 이게 다 누구 책임이에요?'} ] },

  { file:'03.png',
    narr:{pos:'bottom', text:'나는 마흔하나. 결혼 10년 차. 30대 내내, 부부가 할 수 있는 노력은 다 해봤다.'} },

  { file:'04.png',
    narr:{pos:'bottom', text:'내 몸을 끝까지 희생하면서까지 갖고 싶진 않았다. 마흔이 넘으니 더 그랬다. 그건 우리 둘이 함께 내린 결정이었다.'} },

  { file:'05.png',
    narr:{pos:'top', text:'명절은, 매번 같은 질문으로 시작됐다.'},
    bubbles:[
      {x:57,y:17,w:25,size:12, text:'둘째는 언제? 아니, 아직 첫째도 없었나?'},
      {x:49,y:51,w:28,size:14, text:'누구네 며느리는 벌써 둘이래.'}
    ] },

  // 06.png는 14:30 재생성 예정 -> 새 이미지 받은 뒤 합성
];

function panelHTML(p){
  const buf = fs.readFileSync(path.join(DIR, p.file));
  const img = 'data:image/png;base64,' + buf.toString('base64');
  let ov = '';
  if(p.narr){
    const isTop = p.narr.pos === 'top';
    ov += `<div class="narr ${isTop?'top':'bottom'}">${p.narr.text}</div>`;
  }
  (p.bubbles||[]).forEach(b=>{
    ov += `<div class="bub" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;font-size:${b.size}px;">${b.text}</div>`;
  });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{margin:0;box-sizing:border-box;}
    html,body{width:${W}px;height:${H}px;overflow:hidden;}
    .stage{position:relative;width:${W}px;height:${H}px;
      font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans CJK KR","Malgun Gothic",sans-serif;}
    .stage img{position:absolute;inset:0;width:${W}px;height:${H}px;display:block;}
    .narr{position:absolute;left:0;width:100%;background:rgba(255,255,255,.93);color:#3a3531;
      font-size:19px;line-height:1.45;font-weight:500;text-align:center;padding:13px 18px;}
    .narr.top{top:0;border-bottom:1px solid rgba(0,0,0,.08);}
    .narr.bottom{bottom:0;border-top:1px solid rgba(0,0,0,.08);}
    .bub{position:absolute;color:#2f2b27;line-height:1.32;font-weight:600;text-align:center;
      transform:translate(0,0);word-break:keep-all;}
  </style></head><body>
    <div class="stage"><img src="${img}">${ov}</div>
  </body></html>`;
}

(async()=>{
  if(!fs.existsSync(OUT)) fs.mkdirSync(OUT, {recursive:true});
  const b = await chromium.launch({executablePath:EXEC, headless:true, args:['--no-sandbox']});
  const ctx = await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:1});
  const page = await ctx.newPage();
  for(const p of PANELS){
    await page.setContent(panelHTML(p), {waitUntil:'networkidle'});
    await page.waitForTimeout(250);
    const out = path.join(OUT, p.file);
    await page.screenshot({path:out, clip:{x:0,y:0,width:W,height:H}});
    console.log('composed', p.file);
  }
  await b.close();
  console.log('DONE ->', OUT);
})();
