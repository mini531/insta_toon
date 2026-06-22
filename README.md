# insta_toon

인스타그램 사연툰(인스타툰) 제작 프로젝트. 시나리오 기획 -> 캐릭터 일관 이미지 생성 -> 4:5 컷 구성 -> 텍스트(나레이션/대사) 합성 -> Canva 인스타 게시물 산출까지의 작업 저장소.

> 상태: 작업 중(WIP). ep01 1화 제작 파이프라인을 잡는 단계라 완성도는 아직 낮음.

## 폴더 구조

```
.agents/
  AGENTS.md              # 캐릭터 설정(헤어/의상/얼굴 가이드)
  character_sheet.png    # 6인 캐릭터 레퍼런스 시트(모든 이미지 생성의 참조)
  EPISODE_WORKFLOW.md    # 새 에피소드 제작 표준 절차(루틴)
_template/
  storyboard.template.html   # 새 에피소드용 스토리보드 템플릿(CONFIG+SLIDES만 편집)
benchmark/
  DZTdOcGn2Lu/           # 벤치마크 인스타툰 캡처 + ANALYSIS.md(그림체/컷구성 분석)
  crawl_login.js / capture_all.js   # 인스타 캐러셀 캡처 스크립트(로그인 세션 사용)
ep01/                    # 1화 작업물
  storyboard.html        # 스토리보드(컷별 프롬프트/대사/나레이션/구성)
  storyboard.md          # 스토리보드 텍스트본
  prompts.md             # 이미지 10장 일괄 생성 프롬프트
  01.png ~ 10.png        # 생성 이미지(820x1024, 4:5)
  backup_v1/             # 직전 버전 이미지 백업
  build_canva_html.js    # 이미지+편집텍스트 10페이지 HTML 생성기(Canva 임포트용)
  canva_import.html      # 생성된 임포트용 HTML
  _img_urls.json         # 이미지 공개 URL 맵(호스팅 결과)
```

## 제작 파이프라인 요약

1. 시나리오 기획: 10슬라이드, 한 컷에 2~3 장면 적층, 타깃(며느리) 공감 양념. 8컷 = "훑는 시선/침묵" 등.
2. 이미지 생성: `ep01/prompts.md`로 10장 생성. 플랫 저채도 화풍, 캐릭터 시트 고정, 1:1 생성 후 4:5 좌우 크롭.
3. 텍스트 합성: 그림과 분리. 나레이션 = 가로 띠, 대사 = 말풍선.
4. Canva 산출: `build_canva_html.js`로 10페이지 HTML 생성 -> 이미지 공개 URL 호스팅 -> Canva `import-design-from-url`로 1파일 10페이지(편집 가능 텍스트) 임포트.

## 작업 루틴

새 에피소드 제작 절차는 `.agents/EPISODE_WORKFLOW.md` 참조. 스토리보드는 `_template/storyboard.template.html`을 복제해 시작한다.

## 주의

- `benchmark/.ig_login`, `benchmark/.ig_state.json`(인스타 로그인 정보/세션)은 `.gitignore`로 제외. 절대 커밋 금지.
- `benchmark/DZTdOcGn2Lu/`의 캡처물은 외부 창작자(@greego_toon) 게시물의 참고용 자료.
