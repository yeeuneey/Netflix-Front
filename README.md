# Yenflix (Netflix-Front)
- TMDB API를 활용해 인기/검색/위시리스트 등 영화 콘텐츠를 보여주는 Vue 3 SPA입니다.
- 로그인·회원가입 데모, 무한 스크롤과 테이블 전환, 반응형/애니메이션 UI를 포함합니다.
---
## 프로젝트 기본 정보
- 프론트엔드 SPA (Vue 3 + Vite, TypeScript)
- 주요 페이지: Home, Popular(무한 스크롤 ↔ 테이블 전환), Search(필터 + 무한 스크롤), Wishlist(로컬 저장), Signin(로그인/회원가입)
- 인증 데모: 로컬 사용자/세션 기반, TMDB API Key를 비밀번호로 사용
---
## 기술 스택
- Framework: Vue 3, Vite
- Language: TypeScript
- Store: Pinia
- Router: Vue Router
- HTTP: Axios
- 스타일: CSS(SFC scoped, 글로벌 `style.css`), Font Awesome 아이콘(CDN 링크를 `index.html` `<head>`에 추가)
---
## 핵심 구현
- 기술 스택: Vue 3, Vite, TypeScript, Pinia, Vue Router, Axios
- 인증/저장(LocalStorage):
  - `constants/storage.ts`에서 키 일원화(`auth`, `users`, `tmdbKey`, `wishlist`, `savedLoginEmail`, `recentSearches`)
  - `utils/auth.ts`: 로그인/로그아웃, TMDB 키 저장, keepLogin·세션(`sessionStorage`) 토글, `readAuth`
  - `stores/auth.ts`: 현재 인증 상태, 사용자 목록, TMDB 키 상태 관리(`setAuth`, `setUsers`, `setTmdbKey`, `refreshFromStorage`)
  - `stores/wishlist.ts`: 위시리스트 토글/지속, 삭제 확인 포함
  - `utils/storage.ts`: JSON read/write, TMDB 키 로드(`loadTmdbKey`), 부트스트랩 헬퍼
  - LoginForm: 이메일 저장 옵션(`savedLoginEmail`)
  - Wishlist/Search: 최근 검색(`recentSearches`), 위시리스트(`movieWishlist`) 로딩/필터
- 데이터: TMDB REST API + 이미지 CDN, 트렌딩/인기/상영중/개봉예정/평점 TOP 등 다중 카테고리 호출, 비밀번호를 TMDB 키로 활용
- UI/UX: 반응형 레이아웃, 헤더/카드/테이블 트랜지션, 모바일 햄버거·스크롤 토글, 홈·인기(무한/테이블)·검색(필터)·위시리스트 페이지
---
## 설치 및 실행 가이드
- Node.js 18+ 권장
- 의존성 설치: `npm install`
- 개발 서버: `npm run dev`
- 프로덕션 빌드: `npm run build`
- 미리보기: `npm run preview`
- 환경 변수: `.env`에 `VITE_TMDB_API_KEY`를 넣으면 로그인 비밀번호 대신 기본 TMDB 키로 사용됩니다.
---
## 프로젝트 구조
```
src
├─ api
│  ├─ tmdb/client.ts         # TMDB axios 클라이언트, 키/언어 파라미터 주입
│  └─ tmdb/index.ts          # TMDB 엔드포인트/페치 헬퍼
├─ components
│  ├─ Header.vue             # 반응형 헤더/메뉴, 스크롤 트랜지션
│  ├─ Loading.vue            # 로딩 스피너
│  ├─ common
│  │  ├─ MovieCard.vue       # 카드 hover 확대, 위시리스트 토글/오버레이
│  │  └─ MovieDetailModal.vue# 영화 상세 모달
│  ├─ home/MovieSection.vue  # 섹션 슬라이더, 네비 버튼/자동 스냅
│  └─ auth                   # 로그인/회원가입 폼
│     ├─ LoginForm.vue
│     └─ RegisterForm.vue
├─ constants/storage.ts      # LocalStorage 키 정의, 기본 유저/인증 값
├─ stores
│  ├─ auth.ts                # 인증 상태, 사용자 목록, TMDB 키 저장
│  └─ wishlist.ts            # 로컬 위시리스트 토글/지속
├─ utils
│  ├─ auth.ts                # 로그인/로그아웃, TMDB 키 세팅, readAuth
│  └─ storage.ts             # JSON read/write, TMDB 키 로드/부트스트랩
├─ views
│  ├─ Home.vue               # 메인 홈(히어로 + 5개 섹션)
│  ├─ Popular.vue            # 인기: 무한 스크롤/테이블 전환, 페이지네이션
│  ├─ Search.vue             # 검색/필터 UI, 무한 스크롤, 최근 검색
│  ├─ Wishlist.vue           # 로컬 위시리스트 목록/필터/정렬
│  └─ Signin.vue             # 로그인/회원가입 플립 + 커튼 애니메이션
├─ router
│  └─ index.ts               # SPA 라우팅, 인증 가드
├─ style.css                 # 전역 스타일/레이아웃/폰트/스피너
└─ main.ts                   # 앱 진입점, Pinia/Router/스타일 주입
```
---
## 개발 가이드
- Git Flow 
  - 브랜치 전략
    - `main`(default): 배포용 안정 브랜치, 직접 푸시 금지 권장
    - `develop`: 통합 개발 브랜치
    - `feature/*`: 기능 단위 작업 브랜치 (예: `feature/common`, `feature/home`, `feature/popular`, `feature/search`, `feature/signin`, `feature/tmdb-api`, `feature/wishlist`)
    - `gh-pages`: 정적 배포용(필요 시)
    - Optional: `release/*`, `hotfix/*`로 릴리스 준비/급한 패치 관리
  - 커밋/PR
    - 커밋 메시지는 의미 있는 문장 사용 (예: `feat: add wishlist filters`, `fix: align header spacing`)
    - PR은 템플릿+리뷰 요청을 통해 테스트·코드 리뷰 후 머지
  - 병합 흐름: feature → develop(Pull Request/리뷰) → main(릴리스 시점) → 필요 시 gh-pages 배포


