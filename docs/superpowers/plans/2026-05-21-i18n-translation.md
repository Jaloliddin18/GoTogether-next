# i18n Language Translation (en/kr/ru) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full EN/KR/RU i18n translation to every non-admin page and component, replacing all hardcoded UI strings with `t('key')` calls across 9 namespaces.

**Architecture:** next-i18next is already installed and wired (`appWithTranslation`, `next.config.js` i18n block, `next-i18next.config.js` all confirmed correct). Work is: create JSON files per namespace × 3 locales, then update each component to call `useTranslation(ns)` and wrap strings in `t()`. Pages must load their namespace in `serverSideTranslations`.

**Tech Stack:** next-i18next, useTranslation hook, serverSideTranslations, TypeScript/React

---

## Namespace → File Map

| Namespace | Files that use it |
|-----------|------------------|
| `common`  | Top.tsx, LayoutBasic.tsx, HeaderFilter.tsx (Advanced key already there) |
| `layout`  | Footer.tsx, LayoutHome.tsx (hero text) |
| `community` | CommunityShell.tsx, CommunityComposer.tsx, pages/community/index.tsx, pages/community/detail.tsx |
| `mypage`  | MyMenu.tsx, MyProfile.tsx, MyRequests.tsx, MyArticles.tsx, MyFavorites.tsx, RecentlyVisited.tsx, RobotTracking.tsx, pages/mypage/index.tsx |
| `books`   | pages/books/index.tsx, pages/books/detail.tsx, HeaderFilter.tsx (filter labels), FeaturedBooks.tsx, MostBorrowed.tsx, NewArrivals.tsx |
| `member`  | MemberMenu.tsx, MemberFollowers.tsx, MemberFollowings.tsx, MemberProperties.tsx, MemberArticles.tsx, pages/member/index.tsx, pages/member/[memberId].tsx, pages/agent/detail.tsx |
| `account` | pages/account/join.tsx |
| `about`   | pages/about/index.tsx |
| `cs`      | pages/cs/index.tsx, Notice.tsx, Faq.tsx |

---

## Task 1 — Update common.json (all 3 locales)

**Files:**
- Modify: `public/locales/en/common.json`
- Create: `public/locales/kr/common.json`
- Create: `public/locales/ru/common.json`

- [ ] **Step 1: Write `public/locales/en/common.json`**

```json
{
  "Home": "Home",
  "Books": "Books",
  "About Us": "About Us",
  "Community": "Community",
  "My Page": "My Page",
  "CS": "CS",
  "Login": "Login",
  "Register": "Register",
  "English": "English",
  "Korean": "Korean",
  "Russian": "Russian",
  "Logout": "Logout",
  "Advanced": "Advanced",
  "Books_title": "Books",
  "Browse and discover books": "Browse and discover books",
  "About_title": "About",
  "Home / About": "Home / About",
  "my page": "my page",
  "Home / For Rent": "Home / For Rent",
  "Community_title": "Community",
  "Home / Community": "Home / Community",
  "We are glad to see you again!": "We are glad to see you again!",
  "Login/Signup": "Login/Signup",
  "Authentication Process": "Authentication Process",
  "Member Page": "Member Page",
  "Loading...": "Loading..."
}
```

- [ ] **Step 2: Write `public/locales/kr/common.json`**

```json
{
  "Home": "홈",
  "Books": "도서",
  "About Us": "소개",
  "Community": "커뮤니티",
  "My Page": "마이페이지",
  "CS": "고객센터",
  "Login": "로그인",
  "Register": "회원가입",
  "English": "영어",
  "Korean": "한국어",
  "Russian": "러시아어",
  "Logout": "로그아웃",
  "Advanced": "고급 검색",
  "Books_title": "도서",
  "Browse and discover books": "도서를 탐색하고 발견하세요",
  "About_title": "소개",
  "Home / About": "홈 / 소개",
  "my page": "마이페이지",
  "Home / For Rent": "홈 / 대출",
  "Community_title": "커뮤니티",
  "Home / Community": "홈 / 커뮤니티",
  "We are glad to see you again!": "다시 만나게 되어 반갑습니다!",
  "Login/Signup": "로그인/회원가입",
  "Authentication Process": "인증 절차",
  "Member Page": "회원 페이지",
  "Loading...": "로딩 중..."
}
```

- [ ] **Step 3: Write `public/locales/ru/common.json`**

```json
{
  "Home": "Главная",
  "Books": "Книги",
  "About Us": "О нас",
  "Community": "Сообщество",
  "My Page": "Мой профиль",
  "CS": "Поддержка",
  "Login": "Вход",
  "Register": "Регистрация",
  "English": "Английский",
  "Korean": "Корейский",
  "Russian": "Русский",
  "Logout": "Выйти",
  "Advanced": "Расширенный поиск",
  "Books_title": "Книги",
  "Browse and discover books": "Просматривайте и открывайте книги",
  "About_title": "О нас",
  "Home / About": "Главная / О нас",
  "my page": "Мой профиль",
  "Home / For Rent": "Главная / Заказы",
  "Community_title": "Сообщество",
  "Home / Community": "Главная / Сообщество",
  "We are glad to see you again!": "Рады снова вас видеть!",
  "Login/Signup": "Вход/Регистрация",
  "Authentication Process": "Процесс аутентификации",
  "Member Page": "Страница участника",
  "Loading...": "Загрузка..."
}
```

---

## Task 2 — Create layout.json (all 3 locales)

**Files:**
- Create: `public/locales/en/layout.json`
- Create: `public/locales/kr/layout.json`
- Create: `public/locales/ru/layout.json`

- [ ] **Step 1: Write `public/locales/en/layout.json`**

```json
{
  "Library Help Desk": "Library Help Desk",
  "INHA University Library": "INHA University Library",
  "Robot Support": "Robot Support",
  "24/7 Autonomous Service": "24/7 Autonomous Service",
  "같이Go is always on duty.": "같이Go is always on duty.",
  "follow us on social media": "follow us on social media",
  "Stay Updated with 같이Go": "Stay Updated with 같이Go",
  "Your Email": "Your Email",
  "Subscribe": "Subscribe",
  "Popular Search": "Popular Search",
  "Search Book Catalog": "Search Book Catalog",
  "Request Book Delivery": "Request Book Delivery",
  "Track My Delivery": "Track My Delivery",
  "Quick Links": "Quick Links",
  "Terms of Use": "Terms of Use",
  "Privacy Policy": "Privacy Policy",
  "How It Works": "How It Works",
  "About 같이Go": "About 같이Go",
  "Contact Support": "Contact Support",
  "FAQs": "FAQs",
  "Discover": "Discover",
  "1F — General Collection": "1F — General Collection",
  "2F — Reference & Journals": "2F — Reference & Journals",
  "3F — Digital Media": "3F — Digital Media",
  "4F — Study Rooms": "4F — Study Rooms",
  "Privacy · Terms · Sitemap": "Privacy · Terms · Sitemap",
  "Read More,": "Read More,",
  "Walk Less": "Walk Less",
  "Books delivered across campus by": "Books delivered across campus by"
}
```

- [ ] **Step 2: Write `public/locales/kr/layout.json`**

```json
{
  "Library Help Desk": "도서관 헬프 데스크",
  "INHA University Library": "인하대학교 도서관",
  "Robot Support": "로봇 지원",
  "24/7 Autonomous Service": "24시간 자율 서비스",
  "같이Go is always on duty.": "같이Go는 항상 대기 중입니다.",
  "follow us on social media": "소셜 미디어에서 팔로우하세요",
  "Stay Updated with 같이Go": "같이Go 소식 받기",
  "Your Email": "이메일 주소",
  "Subscribe": "구독하기",
  "Popular Search": "인기 검색",
  "Search Book Catalog": "도서 목록 검색",
  "Request Book Delivery": "도서 배달 신청",
  "Track My Delivery": "배달 추적",
  "Quick Links": "빠른 링크",
  "Terms of Use": "이용약관",
  "Privacy Policy": "개인정보 처리방침",
  "How It Works": "이용 방법",
  "About 같이Go": "같이Go 소개",
  "Contact Support": "지원 문의",
  "FAQs": "자주 묻는 질문",
  "Discover": "탐색",
  "1F — General Collection": "1층 — 일반 자료실",
  "2F — Reference & Journals": "2층 — 참고자료 & 학술지",
  "3F — Digital Media": "3층 — 디지털 미디어",
  "4F — Study Rooms": "4층 — 스터디룸",
  "Privacy · Terms · Sitemap": "개인정보 · 약관 · 사이트맵",
  "Read More,": "더 많이 읽고,",
  "Walk Less": "덜 걷고",
  "Books delivered across campus by": "캠퍼스 전역에 도서 배달,"
}
```

- [ ] **Step 3: Write `public/locales/ru/layout.json`**

```json
{
  "Library Help Desk": "Справочная служба библиотеки",
  "INHA University Library": "Библиотека Университета Инха",
  "Robot Support": "Поддержка роботов",
  "24/7 Autonomous Service": "Автономный сервис 24/7",
  "같이Go is always on duty.": "같이Go всегда на дежурстве.",
  "follow us on social media": "Следите за нами в соцсетях",
  "Stay Updated with 같이Go": "Будьте в курсе с 같이Go",
  "Your Email": "Ваш Email",
  "Subscribe": "Подписаться",
  "Popular Search": "Популярные запросы",
  "Search Book Catalog": "Поиск по каталогу книг",
  "Request Book Delivery": "Заказать доставку книги",
  "Track My Delivery": "Отследить доставку",
  "Quick Links": "Быстрые ссылки",
  "Terms of Use": "Условия использования",
  "Privacy Policy": "Политика конфиденциальности",
  "How It Works": "Как это работает",
  "About 같이Go": "О 같이Go",
  "Contact Support": "Связаться с поддержкой",
  "FAQs": "Часто задаваемые вопросы",
  "Discover": "Обзор",
  "1F — General Collection": "1 этаж — Общий фонд",
  "2F — Reference & Journals": "2 этаж — Справочники и журналы",
  "3F — Digital Media": "3 этаж — Цифровые медиа",
  "4F — Study Rooms": "4 этаж — Комнаты для занятий",
  "Privacy · Terms · Sitemap": "Конфиденц. · Условия · Карта",
  "Read More,": "Читайте больше,",
  "Walk Less": "Ходите меньше",
  "Books delivered across campus by": "Книги по всему кампусу доставляет"
}
```

---

## Task 3 — Create community.json (all 3 locales)

**Files:**
- Create: `public/locales/en/community.json`
- Create: `public/locales/kr/community.json`
- Create: `public/locales/ru/community.json`

- [ ] **Step 1: Write `public/locales/en/community.json`**

```json
{
  "Community": "Community",
  "For you": "For you",
  "Following": "Following",
  "Search community": "Search community",
  "Trending at library": "Trending at library",
  "Who to follow": "Who to follow",
  "Follow": "Follow",
  "Share a library update...": "Share a library update...",
  "Login": "Login",
  "Post": "Post",
  "Posting...": "Posting...",
  "Uploading...": "Uploading...",
  "posts available": "posts available",
  "post available": "post available",
  "Total": "Total"
}
```

- [ ] **Step 2: Write `public/locales/kr/community.json`**

```json
{
  "Community": "커뮤니티",
  "For you": "추천",
  "Following": "팔로잉",
  "Search community": "커뮤니티 검색",
  "Trending at library": "도서관 트렌드",
  "Who to follow": "팔로우 추천",
  "Follow": "팔로우",
  "Share a library update...": "도서관 소식을 공유하세요...",
  "Login": "로그인",
  "Post": "게시",
  "Posting...": "게시 중...",
  "Uploading...": "업로드 중...",
  "posts available": "개 게시물",
  "post available": "개 게시물",
  "Total": "총"
}
```

- [ ] **Step 3: Write `public/locales/ru/community.json`**

```json
{
  "Community": "Сообщество",
  "For you": "Для вас",
  "Following": "Подписки",
  "Search community": "Поиск в сообществе",
  "Trending at library": "Тренды в библиотеке",
  "Who to follow": "На кого подписаться",
  "Follow": "Подписаться",
  "Share a library update...": "Поделитесь новостью библиотеки...",
  "Login": "Войти",
  "Post": "Опубликовать",
  "Posting...": "Публикация...",
  "Uploading...": "Загрузка...",
  "posts available": "постов доступно",
  "post available": "пост доступен",
  "Total": "Всего"
}
```

---

## Task 4 — Create mypage.json (all 3 locales)

**Files:**
- Create: `public/locales/en/mypage.json`
- Create: `public/locales/kr/mypage.json`
- Create: `public/locales/ru/mypage.json`

- [ ] **Step 1: Write `public/locales/en/mypage.json`**

```json
{
  "My Profile": "My Profile",
  "My Twits": "My Twits",
  "Saved Books": "Saved Books",
  "Recently Viewed": "Recently Viewed",
  "My Requests": "My Requests",
  "Live Tracking": "Live Tracking",
  "Followers": "Followers",
  "Followings": "Followings",
  "Logout": "Logout",
  "Do you want to log out?": "Do you want to log out?",
  "Manage your account information": "Manage your account information",
  "Photo": "Photo",
  "Change Photo": "Change Photo",
  "JPG, JPEG or PNG — max 2MB": "JPG, JPEG or PNG — max 2MB",
  "Username": "Username",
  "Your username": "Your username",
  "Phone": "Phone",
  "Your phone number": "Your phone number",
  "Bio": "Bio",
  "Tell people a bit about yourself...": "Tell people a bit about yourself...",
  "Save Changes": "Save Changes",
  "Borrow and purchase history": "Borrow and purchase history",
  "All": "All",
  "Active": "Active",
  "History": "History",
  "No requests found": "No requests found",
  "You have no active borrow or purchase requests.": "You have no active borrow or purchase requests.",
  "Your request history will appear here.": "Your request history will appear here.",
  "Queued": "Queued",
  "Assigned": "Assigned",
  "Dispatched": "Dispatched",
  "Navigating": "Navigating",
  "At Shelf": "At Shelf",
  "Verifying": "Verifying",
  "Book Found": "Book Found",
  "Picking Up": "Picking Up",
  "Delivering": "Delivering",
  "Arrived": "Arrived",
  "Ready": "Ready",
  "Completed": "Completed",
  "Failed": "Failed",
  "Cancelled": "Cancelled",
  "Not Found": "Not Found",
  "Loading twits...": "Loading twits...",
  "Unable to load twits.": "Unable to load twits.",
  "No twits yet.": "No twits yet.",
  "Share your thoughts with the library community.": "Share your thoughts with the library community.",
  "No saved books yet": "No saved books yet",
  "Books you like will appear here for quick access.": "Books you like will appear here for quick access.",
  "No recently viewed books": "No recently viewed books",
  "Books you browse will appear here.": "Books you browse will appear here.",
  "No active delivery": "No active delivery",
  "Battery": "Battery",
  "Reception": "Reception",
  "Service Desk": "Service Desk",
  "Library Books": "Library Books",
  "Physical Collection": "Physical Collection",
  "Commercial Books": "Commercial Books",
  "Purchasable Items": "Purchasable Items",
  "Navigation Aisle": "Navigation Aisle",
  "Central Corridor": "Central Corridor",
  "Charging Dock": "Charging Dock",
  "Robot Station": "Robot Station",
  "Shelf Location": "Shelf Location",
  "Robot Status": "Robot Status",
  "Library Floor — Level 1": "Library Floor — Level 1",
  "TurtleBot 3 — Library Floor Level 1": "TurtleBot 3 — Library Floor Level 1",
  "Est. arrival:": "Est. arrival:"
}
```

- [ ] **Step 2: Write `public/locales/kr/mypage.json`**

```json
{
  "My Profile": "내 프로필",
  "My Twits": "내 게시물",
  "Saved Books": "저장한 도서",
  "Recently Viewed": "최근 조회",
  "My Requests": "내 요청",
  "Live Tracking": "실시간 추적",
  "Followers": "팔로워",
  "Followings": "팔로잉",
  "Logout": "로그아웃",
  "Do you want to log out?": "로그아웃 하시겠습니까?",
  "Manage your account information": "계정 정보를 관리하세요",
  "Photo": "사진",
  "Change Photo": "사진 변경",
  "JPG, JPEG or PNG — max 2MB": "JPG, JPEG 또는 PNG — 최대 2MB",
  "Username": "사용자명",
  "Your username": "사용자명을 입력하세요",
  "Phone": "전화번호",
  "Your phone number": "전화번호를 입력하세요",
  "Bio": "자기소개",
  "Tell people a bit about yourself...": "자신에 대해 간단히 소개해 주세요...",
  "Save Changes": "변경 사항 저장",
  "Borrow and purchase history": "대출 및 구매 내역",
  "All": "전체",
  "Active": "진행 중",
  "History": "내역",
  "No requests found": "요청을 찾을 수 없습니다",
  "You have no active borrow or purchase requests.": "진행 중인 대출 또는 구매 요청이 없습니다.",
  "Your request history will appear here.": "요청 내역이 여기에 표시됩니다.",
  "Queued": "대기 중",
  "Assigned": "배정됨",
  "Dispatched": "출발",
  "Navigating": "이동 중",
  "At Shelf": "서가 도착",
  "Verifying": "확인 중",
  "Book Found": "도서 발견",
  "Picking Up": "집기 중",
  "Delivering": "배달 중",
  "Arrived": "도착",
  "Ready": "수령 준비",
  "Completed": "완료",
  "Failed": "실패",
  "Cancelled": "취소",
  "Not Found": "찾을 수 없음",
  "Loading twits...": "게시물 로딩 중...",
  "Unable to load twits.": "게시물을 불러올 수 없습니다.",
  "No twits yet.": "아직 게시물이 없습니다.",
  "Share your thoughts with the library community.": "도서관 커뮤니티와 생각을 나눠보세요.",
  "No saved books yet": "저장한 도서가 없습니다",
  "Books you like will appear here for quick access.": "좋아하는 도서가 여기에 표시됩니다.",
  "No recently viewed books": "최근 조회한 도서가 없습니다",
  "Books you browse will appear here.": "조회한 도서가 여기에 표시됩니다.",
  "No active delivery": "진행 중인 배달 없음",
  "Battery": "배터리",
  "Reception": "안내 데스크",
  "Service Desk": "서비스 데스크",
  "Library Books": "도서관 도서",
  "Physical Collection": "실물 자료",
  "Commercial Books": "판매 도서",
  "Purchasable Items": "구매 가능 자료",
  "Navigation Aisle": "이동 통로",
  "Central Corridor": "중앙 복도",
  "Charging Dock": "충전 도크",
  "Robot Station": "로봇 스테이션",
  "Shelf Location": "서가 위치",
  "Robot Status": "로봇 상태",
  "Library Floor — Level 1": "도서관 1층",
  "TurtleBot 3 — Library Floor Level 1": "TurtleBot 3 — 도서관 1층",
  "Est. arrival:": "예상 도착:"
}
```

- [ ] **Step 3: Write `public/locales/ru/mypage.json`**

```json
{
  "My Profile": "Мой профиль",
  "My Twits": "Мои публикации",
  "Saved Books": "Сохранённые книги",
  "Recently Viewed": "Недавно просмотренные",
  "My Requests": "Мои заказы",
  "Live Tracking": "Отслеживание",
  "Followers": "Подписчики",
  "Followings": "Подписки",
  "Logout": "Выйти",
  "Do you want to log out?": "Вы хотите выйти?",
  "Manage your account information": "Управление информацией аккаунта",
  "Photo": "Фото",
  "Change Photo": "Изменить фото",
  "JPG, JPEG or PNG — max 2MB": "JPG, JPEG или PNG — макс. 2МБ",
  "Username": "Имя пользователя",
  "Your username": "Введите имя пользователя",
  "Phone": "Телефон",
  "Your phone number": "Введите номер телефона",
  "Bio": "О себе",
  "Tell people a bit about yourself...": "Расскажите немного о себе...",
  "Save Changes": "Сохранить изменения",
  "Borrow and purchase history": "История заказов и покупок",
  "All": "Все",
  "Active": "Активные",
  "History": "История",
  "No requests found": "Заказы не найдены",
  "You have no active borrow or purchase requests.": "У вас нет активных заказов.",
  "Your request history will appear here.": "История заказов появится здесь.",
  "Queued": "В очереди",
  "Assigned": "Назначен",
  "Dispatched": "Отправлен",
  "Navigating": "В пути",
  "At Shelf": "У полки",
  "Verifying": "Проверка",
  "Book Found": "Книга найдена",
  "Picking Up": "Забирает",
  "Delivering": "Доставляет",
  "Arrived": "Прибыл",
  "Ready": "Готово к получению",
  "Completed": "Завершено",
  "Failed": "Ошибка",
  "Cancelled": "Отменено",
  "Not Found": "Не найдено",
  "Loading twits...": "Загрузка публикаций...",
  "Unable to load twits.": "Не удалось загрузить публикации.",
  "No twits yet.": "Публикаций пока нет.",
  "Share your thoughts with the library community.": "Поделитесь мыслями с сообществом.",
  "No saved books yet": "Сохранённых книг нет",
  "Books you like will appear here for quick access.": "Понравившиеся книги появятся здесь.",
  "No recently viewed books": "Просмотренных книг нет",
  "Books you browse will appear here.": "Просмотренные книги появятся здесь.",
  "No active delivery": "Нет активной доставки",
  "Battery": "Батарея",
  "Reception": "Ресепшн",
  "Service Desk": "Стойка обслуживания",
  "Library Books": "Библиотечные книги",
  "Physical Collection": "Физический фонд",
  "Commercial Books": "Книги на продажу",
  "Purchasable Items": "Доступно для покупки",
  "Navigation Aisle": "Проход",
  "Central Corridor": "Центральный коридор",
  "Charging Dock": "Зарядная станция",
  "Robot Station": "Станция робота",
  "Shelf Location": "Расположение на полке",
  "Robot Status": "Статус робота",
  "Library Floor — Level 1": "Библиотека — Этаж 1",
  "TurtleBot 3 — Library Floor Level 1": "TurtleBot 3 — Этаж 1",
  "Est. arrival:": "Ожидаемое прибытие:"
}
```

---

## Task 5 — Create books.json (all 3 locales)

**Files:**
- Create: `public/locales/en/books.json`
- Create: `public/locales/kr/books.json`
- Create: `public/locales/ru/books.json`

- [ ] **Step 1: Write `public/locales/en/books.json`**

```json
{
  "Sort by": "Sort by",
  "New": "New",
  "Lowest Price": "Lowest Price",
  "Highest Price": "Highest Price",
  "No books found": "No books found",
  "available": "available",
  "Smart Library Advanced Filters": "Smart Library Advanced Filters",
  "Search": "Search",
  "READER LEVEL": "READER LEVEL",
  "All Levels": "All Levels",
  "LANGUAGE": "LANGUAGE",
  "All Languages": "All Languages",
  "Borrowable Only": "Borrowable Only",
  "Purchasable Only": "Purchasable Only",
  "MINIMUM RATING": "MINIMUM RATING",
  "MIN PRICE": "MIN PRICE",
  "MAX PRICE": "MAX PRICE",
  "Reset all filters": "Reset all filters",
  "New Arrivals": "New Arrivals",
  "Recently added books to our library collection": "Recently added books to our library collection",
  "Most Borrowed": "Most Borrowed",
  "Top books our students are reading right now": "Top books our students are reading right now",
  "Browse All Books": "Browse All Books",
  "Featured Books": "Featured Books",
  "Highest rated books in our collection": "Highest rated books in our collection"
}
```

- [ ] **Step 2: Write `public/locales/kr/books.json`**

```json
{
  "Sort by": "정렬 기준",
  "New": "최신순",
  "Lowest Price": "낮은 가격순",
  "Highest Price": "높은 가격순",
  "No books found": "도서를 찾을 수 없습니다",
  "available": "개 이용 가능",
  "Smart Library Advanced Filters": "스마트 도서관 고급 필터",
  "Search": "검색",
  "READER LEVEL": "독자 수준",
  "All Levels": "전체 수준",
  "LANGUAGE": "언어",
  "All Languages": "전체 언어",
  "Borrowable Only": "대출 가능만",
  "Purchasable Only": "구매 가능만",
  "MINIMUM RATING": "최소 평점",
  "MIN PRICE": "최저 가격",
  "MAX PRICE": "최고 가격",
  "Reset all filters": "필터 초기화",
  "New Arrivals": "신규 입고",
  "Recently added books to our library collection": "최근 도서관에 입고된 도서",
  "Most Borrowed": "인기 대출 도서",
  "Top books our students are reading right now": "현재 학생들이 가장 많이 빌리는 도서",
  "Browse All Books": "전체 도서 보기",
  "Featured Books": "추천 도서",
  "Highest rated books in our collection": "평점 높은 추천 도서"
}
```

- [ ] **Step 3: Write `public/locales/ru/books.json`**

```json
{
  "Sort by": "Сортировать по",
  "New": "Новые",
  "Lowest Price": "Сначала дешевле",
  "Highest Price": "Сначала дороже",
  "No books found": "Книги не найдены",
  "available": "доступно",
  "Smart Library Advanced Filters": "Расширенные фильтры",
  "Search": "Поиск",
  "READER LEVEL": "УРОВЕНЬ ЧИТАТЕЛЯ",
  "All Levels": "Все уровни",
  "LANGUAGE": "ЯЗЫК",
  "All Languages": "Все языки",
  "Borrowable Only": "Только для выдачи",
  "Purchasable Only": "Только для покупки",
  "MINIMUM RATING": "МИН. РЕЙТИНГ",
  "MIN PRICE": "МИН. ЦЕНА",
  "MAX PRICE": "МАКС. ЦЕНА",
  "Reset all filters": "Сбросить фильтры",
  "New Arrivals": "Новые поступления",
  "Recently added books to our library collection": "Недавно добавленные книги в коллекцию",
  "Most Borrowed": "Самые популярные",
  "Top books our students are reading right now": "Книги, которые студенты читают прямо сейчас",
  "Browse All Books": "Все книги",
  "Featured Books": "Рекомендуемые книги",
  "Highest rated books in our collection": "Книги с наивысшим рейтингом"
}
```

---

## Task 6 — Create member.json (all 3 locales)

**Files:**
- Create: `public/locales/en/member.json`
- Create: `public/locales/kr/member.json`
- Create: `public/locales/ru/member.json`

- [ ] **Step 1: Write `public/locales/en/member.json`**

```json
{
  "Properties": "Properties",
  "Followers": "Followers",
  "Followings": "Followings",
  "Community Twits": "Community Twits",
  "No followers yet.": "No followers yet.",
  "No followings yet.": "No followings yet.",
  "No Property found!": "No Property found!",
  "Loading twits...": "Loading twits...",
  "Unable to load member twits.": "Unable to load member twits.",
  "No twits found.": "No twits found.",
  "Listing title": "Listing title",
  "Date Published": "Date Published",
  "Status": "Status",
  "View": "View",
  "Posts": "Posts",
  "Following": "Following",
  "Joined": "Joined",
  "Trending at library": "Trending at library",
  "Who to follow": "Who to follow",
  "Follow": "Follow",
  "No posts yet": "No posts yet",
  "Posts from this member will appear here.": "Posts from this member will appear here.",
  "Search community": "Search community"
}
```

- [ ] **Step 2: Write `public/locales/kr/member.json`**

```json
{
  "Properties": "도서 목록",
  "Followers": "팔로워",
  "Followings": "팔로잉",
  "Community Twits": "커뮤니티 게시물",
  "No followers yet.": "아직 팔로워가 없습니다.",
  "No followings yet.": "아직 팔로잉이 없습니다.",
  "No Property found!": "도서를 찾을 수 없습니다!",
  "Loading twits...": "게시물 로딩 중...",
  "Unable to load member twits.": "게시물을 불러올 수 없습니다.",
  "No twits found.": "게시물이 없습니다.",
  "Listing title": "제목",
  "Date Published": "게시일",
  "Status": "상태",
  "View": "보기",
  "Posts": "게시물",
  "Following": "팔로잉",
  "Joined": "가입일",
  "Trending at library": "도서관 트렌드",
  "Who to follow": "팔로우 추천",
  "Follow": "팔로우",
  "No posts yet": "게시물이 없습니다",
  "Posts from this member will appear here.": "이 회원의 게시물이 여기에 표시됩니다.",
  "Search community": "커뮤니티 검색"
}
```

- [ ] **Step 3: Write `public/locales/ru/member.json`**

```json
{
  "Properties": "Книги",
  "Followers": "Подписчики",
  "Followings": "Подписки",
  "Community Twits": "Публикации",
  "No followers yet.": "Подписчиков пока нет.",
  "No followings yet.": "Подписок пока нет.",
  "No Property found!": "Книги не найдены!",
  "Loading twits...": "Загрузка публикаций...",
  "Unable to load member twits.": "Не удалось загрузить публикации.",
  "No twits found.": "Публикации не найдены.",
  "Listing title": "Название",
  "Date Published": "Дата публикации",
  "Status": "Статус",
  "View": "Просмотр",
  "Posts": "Публикации",
  "Following": "Подписан",
  "Joined": "Присоединился",
  "Trending at library": "Тренды в библиотеке",
  "Who to follow": "На кого подписаться",
  "Follow": "Подписаться",
  "No posts yet": "Публикаций пока нет",
  "Posts from this member will appear here.": "Публикации этого участника появятся здесь.",
  "Search community": "Поиск в сообществе"
}
```

---

## Task 7 — Create account.json (all 3 locales)

**Files:**
- Create: `public/locales/en/account.json`
- Create: `public/locales/kr/account.json`
- Create: `public/locales/ru/account.json`

- [ ] **Step 1: Write `public/locales/en/account.json`**

```json
{
  "login": "login",
  "signup": "signup",
  "Login in with this account across the following sites.": "Login in with this account across the following sites.",
  "Sign in with this account across the following sites.": "Sign in with this account across the following sites.",
  "Nickname": "Nickname",
  "Enter Nickname": "Enter Nickname",
  "Password": "Password",
  "Enter Password": "Enter Password",
  "Phone": "Phone",
  "Enter Phone": "Enter Phone",
  "Remember me": "Remember me",
  "Lost your password?": "Lost your password?",
  "LOGIN": "LOGIN",
  "SIGNUP": "SIGNUP",
  "Not registered yet?": "Not registered yet?",
  "Have account?": "Have account?",
  "Nickname must be 3-12 characters": "Nickname must be 3-12 characters",
  "Password must be 5-12 characters": "Password must be 5-12 characters",
  "Phone number is required": "Phone number is required"
}
```

- [ ] **Step 2: Write `public/locales/kr/account.json`**

```json
{
  "login": "로그인",
  "signup": "회원가입",
  "Login in with this account across the following sites.": "이 계정으로 다음 사이트에 로그인하세요.",
  "Sign in with this account across the following sites.": "이 계정으로 다음 사이트에 가입하세요.",
  "Nickname": "닉네임",
  "Enter Nickname": "닉네임을 입력하세요",
  "Password": "비밀번호",
  "Enter Password": "비밀번호를 입력하세요",
  "Phone": "전화번호",
  "Enter Phone": "전화번호를 입력하세요",
  "Remember me": "로그인 상태 유지",
  "Lost your password?": "비밀번호를 잊으셨나요?",
  "LOGIN": "로그인",
  "SIGNUP": "회원가입",
  "Not registered yet?": "아직 회원이 아니신가요?",
  "Have account?": "계정이 있으신가요?",
  "Nickname must be 3-12 characters": "닉네임은 3~12자여야 합니다",
  "Password must be 5-12 characters": "비밀번호는 5~12자여야 합니다",
  "Phone number is required": "전화번호를 입력해 주세요"
}
```

- [ ] **Step 3: Write `public/locales/ru/account.json`**

```json
{
  "login": "вход",
  "signup": "регистрация",
  "Login in with this account across the following sites.": "Войдите с помощью этого аккаунта.",
  "Sign in with this account across the following sites.": "Зарегистрируйтесь с помощью этого аккаунта.",
  "Nickname": "Псевдоним",
  "Enter Nickname": "Введите псевдоним",
  "Password": "Пароль",
  "Enter Password": "Введите пароль",
  "Phone": "Телефон",
  "Enter Phone": "Введите телефон",
  "Remember me": "Запомнить меня",
  "Lost your password?": "Забыли пароль?",
  "LOGIN": "ВОЙТИ",
  "SIGNUP": "РЕГИСТРАЦИЯ",
  "Not registered yet?": "Ещё не зарегистрированы?",
  "Have account?": "Уже есть аккаунт?",
  "Nickname must be 3-12 characters": "Псевдоним должен быть 3–12 символов",
  "Password must be 5-12 characters": "Пароль должен быть 5–12 символов",
  "Phone number is required": "Введите номер телефона"
}
```

---

## Task 8 — Create about.json (all 3 locales)

**Files:**
- Create: `public/locales/en/about.json`
- Create: `public/locales/kr/about.json`
- Create: `public/locales/ru/about.json`

- [ ] **Step 1: Write `public/locales/en/about.json`**

```json
{
  "We're on a Mission to Change View of Real Estate Field.": "We're on a Mission to Change View of Real Estate Field.",
  "Modern Villa": "Modern Villa",
  "Secure Payment": "Secure Payment",
  "Nullam sollicitudin blandit Nullam maximus.": "Nullam sollicitudin blandit Nullam maximus.",
  "Award Winning": "Award Winning",
  "Property Ready": "Property Ready",
  "Happy Customer": "Happy Customer",
  "Our Exclusive Agents": "Our Exclusive Agents",
  "Aliquam lacinia diam quis lacus euismod": "Aliquam lacinia diam quis lacus euismod",
  "Let's find the right selling option for you": "Let's find the right selling option for you",
  "Property Management": "Property Management",
  "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.": "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.",
  "Learn More": "Learn More",
  "Trusted bu the world's best": "Trusted bu the world's best",
  "Need help? Talk to our expert.": "Need help? Talk to our expert.",
  "Talk to our experts or Browse through more properties.": "Talk to our experts or Browse through more properties.",
  "Contact Us": "Contact Us"
}
```

- [ ] **Step 2: Write `public/locales/kr/about.json`**

```json
{
  "We're on a Mission to Change View of Real Estate Field.": "스마트 도서관으로 더 나은 학습 환경을 만들어 갑니다.",
  "Modern Villa": "스마트 도서관",
  "Secure Payment": "안전한 결제",
  "Nullam sollicitudin blandit Nullam maximus.": "학생 친화적인 서비스를 제공합니다.",
  "Award Winning": "수상 경력",
  "Property Ready": "이용 가능 도서",
  "Happy Customer": "만족한 학생",
  "Our Exclusive Agents": "우수 학술 자료",
  "Aliquam lacinia diam quis lacus euismod": "학생들이 선호하는 도서 목록",
  "Let's find the right selling option for you": "최적의 서비스를 찾아드립니다",
  "Property Management": "도서 관리",
  "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.": "효율적인 도서 관리 시스템을 제공합니다.",
  "Learn More": "더 알아보기",
  "Trusted bu the world's best": "세계 최고의 신뢰",
  "Need help? Talk to our expert.": "도움이 필요하신가요? 문의해 주세요.",
  "Talk to our experts or Browse through more properties.": "전문가와 상담하거나 더 많은 도서를 탐색하세요.",
  "Contact Us": "문의하기"
}
```

- [ ] **Step 3: Write `public/locales/ru/about.json`**

```json
{
  "We're on a Mission to Change View of Real Estate Field.": "Мы меняем подход к библиотечному обслуживанию.",
  "Modern Villa": "Умная библиотека",
  "Secure Payment": "Безопасная оплата",
  "Nullam sollicitudin blandit Nullam maximus.": "Удобный сервис для студентов.",
  "Award Winning": "Лауреат наград",
  "Property Ready": "Книг доступно",
  "Happy Customer": "Довольных студентов",
  "Our Exclusive Agents": "Наши ресурсы",
  "Aliquam lacinia diam quis lacus euismod": "Лучшие книги для студентов",
  "Let's find the right selling option for you": "Найдём лучшее решение для вас",
  "Property Management": "Управление книгами",
  "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.": "Эффективная система управления фондом.",
  "Learn More": "Узнать больше",
  "Trusted bu the world's best": "Нам доверяют лучшие",
  "Need help? Talk to our expert.": "Нужна помощь? Свяжитесь с нами.",
  "Talk to our experts or Browse through more properties.": "Проконсультируйтесь с нами или просмотрите больше книг.",
  "Contact Us": "Связаться с нами"
}
```

---

## Task 9 — Create cs.json (all 3 locales)

**Files:**
- Create: `public/locales/en/cs.json`
- Create: `public/locales/kr/cs.json`
- Create: `public/locales/ru/cs.json`

- [ ] **Step 1: Write `public/locales/en/cs.json`**

```json
{
  "Cs center": "CS Center",
  "I will answer your questions": "I will answer your questions",
  "Notice": "Notice",
  "FAQ": "FAQ",
  "number": "number",
  "title": "title",
  "date": "date",
  "event": "event",
  "Are the properties displayed on the site reliable?": "Are the books displayed on the site reliable?",
  "of course we only have verified properties": "Of course — we only have verified books.",
  "What types of properties do you offer?": "What types of books do you offer?"
}
```

- [ ] **Step 2: Write `public/locales/kr/cs.json`**

```json
{
  "Cs center": "고객센터",
  "I will answer your questions": "궁금하신 점을 답변해 드립니다",
  "Notice": "공지사항",
  "FAQ": "자주 묻는 질문",
  "number": "번호",
  "title": "제목",
  "date": "날짜",
  "event": "이벤트",
  "Are the properties displayed on the site reliable?": "사이트에 표시된 도서는 신뢰할 수 있나요?",
  "of course we only have verified properties": "물론입니다 — 검증된 도서만 제공합니다.",
  "What types of properties do you offer?": "어떤 종류의 도서를 제공하나요?"
}
```

- [ ] **Step 3: Write `public/locales/ru/cs.json`**

```json
{
  "Cs center": "Центр поддержки",
  "I will answer your questions": "Мы ответим на ваши вопросы",
  "Notice": "Объявления",
  "FAQ": "Часто задаваемые вопросы",
  "number": "номер",
  "title": "заголовок",
  "date": "дата",
  "event": "событие",
  "Are the properties displayed on the site reliable?": "Можно ли доверять информации о книгах на сайте?",
  "of course we only have verified properties": "Конечно — у нас только проверенные книги.",
  "What types of properties do you offer?": "Какие виды книг вы предлагаете?"
}
```

---

## Task 10 — Update Top.tsx (add missing t() calls)

**Files:**
- Modify: `libs/components/Top.tsx`

Top.tsx already has `useTranslation('common')` and already wraps most nav labels. Missing: `Books`, `About Us`, `Logout`.

- [ ] **Step 1: In the mobile return block, replace hardcoded strings**

Find (mobile block, line ~145):
```tsx
<Link href={'/books'}>
    <div>Books</div>
</Link>
<Link href={'/about'}>
    <div> About Us </div>
</Link>
```

Replace with:
```tsx
<Link href={'/books'}>
    <div>{t('Books')}</div>
</Link>
<Link href={'/about'}>
    <div>{t('About Us')}</div>
</Link>
```

- [ ] **Step 2: In the desktop return block, replace hardcoded strings**

Find (desktop block, router-box section):
```tsx
<Link href={'/books'}>
    <div>Books</div>
</Link>
<Link href={'/about'}>
    <div> About Us </div>
</Link>
```

Replace with:
```tsx
<Link href={'/books'}>
    <div>{t('Books')}</div>
</Link>
<Link href={'/about'}>
    <div>{t('About Us')}</div>
</Link>
```

- [ ] **Step 3: Replace hardcoded `Logout` string**

Find:
```tsx
<MenuItem onClick={() => logOut()}>
    <Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
    Logout
</MenuItem>
```

Replace with:
```tsx
<MenuItem onClick={() => logOut()}>
    <Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
    {t('Logout')}
</MenuItem>
```

---

## Task 11 — Update Footer.tsx (add useTranslation + t() calls)

**Files:**
- Modify: `libs/components/Footer.tsx`

- [ ] **Step 1: Add import and hook**

Add at top (after existing imports):
```tsx
import { useTranslation } from 'next-i18next';
```

Inside `Footer` component body, add:
```tsx
const { t } = useTranslation('layout');
```

- [ ] **Step 2: Replace all hardcoded strings in mobile block**

Replace the entire mobile footer JSX body strings with t() calls. The footer-box strings:
```tsx
<Box component={'div'} className={'footer-box'}>
    <span>{t('Library Help Desk')}</span>
    <p>{t('INHA University Library')}</p>
</Box>
<Box component={'div'} className={'footer-box'}>
    <span>{t('Robot Support')}</span>
    <p>{t('24/7 Autonomous Service')}</p>
    <span>{t('같이Go is always on duty.')}</span>
</Box>
<Box component={'div'} className={'footer-box'}>
    <p>{t('follow us on social media')}</p>
    ...
</Box>
```

The bottom links:
```tsx
<strong>{t('Popular Search')}</strong>
<span>{t('Search Book Catalog')}</span>
<span>{t('Request Book Delivery')}</span>
<span>{t('Track My Delivery')}</span>
...
<strong>{t('Quick Links')}</strong>
<span>{t('Terms of Use')}</span>
<span>{t('Privacy Policy')}</span>
<span>{t('How It Works')}</span>
<span>{t('About 같이Go')}</span>
<span>{t('Contact Support')}</span>
<span>{t('FAQs')}</span>
...
<strong>{t('Discover')}</strong>
<span>{t('1F — General Collection')}</span>
<span>{t('2F — Reference & Journals')}</span>
<span>{t('3F — Digital Media')}</span>
<span>{t('4F — Study Rooms')}</span>
```

Copyright line:
```tsx
<span>© 같이Go — INHA University Smart Library. 2026</span>
```
(Leave as literal — brand name + year, no translation needed)

- [ ] **Step 3: Replace all hardcoded strings in desktop block**

Apply same t() calls to the desktop block. Add the email subscribe section:
```tsx
<strong>{t('Stay Updated with 같이Go')}</strong>
<input type="text" placeholder={t('Your Email')} style={{ backgroundColor: '#fff', color: '#000' }} />
<span ...>{t('Subscribe')}</span>
```

Footer second row:
```tsx
<span>© 같이Go — INHA University Smart Library. 2026</span>
<span>{t('Privacy · Terms · Sitemap')}</span>
```

---

## Task 12 — Update LayoutBasic.tsx (fix switch-case string keys)

**Files:**
- Modify: `libs/components/layout/LayoutBasic.tsx`

The layout already calls `t(memoizedValues.title)` and `t(memoizedValues.desc)`. The keys are hardcoded values like `'Books'`, `'About'`, `'my page'` etc. — these must match exactly what's in common.json.

- [ ] **Step 1: Verify switch-case keys match common.json**

The current switch cases set:
- `title = 'Books'` → key `'Books'` ✓ (already in common.json)
- `desc = 'Browse and discover books'` → key `'Browse and discover books'` ✓
- `title = 'About'` → key `'About_title'` — NOTE: 'About' conflicts. Use a distinct key.
- `title = 'my page'` → key `'my page'` ✓
- `title = 'Community'` → key `'Community'` ✓ (but better: `'Community_title'` to avoid namespace clash — both are in common so fine)
- `desc = 'Home / Community'` → ✓
- `title = 'CS'` → key `'CS'` ✓
- `title = 'Login/Signup'` → ✓
- `title = 'Member Page'` → ✓

Since `t()` is in the 'common' namespace and keys are used directly, change `title = 'About'` to something already unique. The simplest approach: leave all values as-is and ensure common.json has those exact keys. Looking at our common.json, we have `'About_title': 'About'` — but the switch case sets `title = 'About'` literally. We need either:
a) Keep `title = 'About'` and add `"About": "About"` to common.json, or
b) Change the switch case to `title = 'About_title'`

The cleanest is (a): just add `"About": "About"` to common.json since there's no conflict with other 'About' values in this namespace.

Update `public/locales/en/common.json` — remove `About_title` key, add `"About": "About"`. Update kr/ru accordingly. Then the switch case `title = 'About'` works directly.

- [ ] **Step 2: Update common.json to replace `About_title` with `About`**

In `public/locales/en/common.json`, replace:
```json
"About_title": "About",
```
With:
```json
"About": "About",
```

In `public/locales/kr/common.json`:
```json
"About": "소개",
```

In `public/locales/ru/common.json`:
```json
"About": "О нас",
```

Also add `"Community_title": "Community"` is not needed — `Community` key already exists. The switch sets `title = 'Community'` which maps to the existing `"Community"` key. No change needed there.

- [ ] **Step 3: Add `useTranslation('common')` import — already present, no change needed**

Confirm the layout file already has `const { t, i18n } = useTranslation('common');` — it does. No code change needed beyond the JSON fix above.

---

## Task 13 — Update LayoutHome.tsx (translate hero text)

**Files:**
- Modify: `libs/components/layout/LayoutHome.tsx`

- [ ] **Step 1: Add useTranslation import**

Add at top:
```tsx
import { useTranslation } from 'next-i18next';
```

- [ ] **Step 2: Add hook in component**

Inside the inner component (the returned function):
```tsx
const { t } = useTranslation('layout');
```

- [ ] **Step 3: Replace hero text strings**

Find:
```tsx
<h2>
    Read More,
    <br />
    <span className={'walk-less-line'}>Walk Less</span>
</h2>
<p>
    Books delivered across campus by <strong>같이Go</strong>.
</p>
```

Replace with:
```tsx
<h2>
    {t('Read More,')}
    <br />
    <span className={'walk-less-line'}>{t('Walk Less')}</span>
</h2>
<p>
    {t('Books delivered across campus by')} <strong>같이Go</strong>.
</p>
```

---

## Task 14 — Update community components

**Files:**
- Modify: `libs/components/community/CommunityShell.tsx`
- Modify: `libs/components/community/CommunityComposer.tsx`

- [ ] **Step 1: Update CommunityShell.tsx — add imports and hook**

Add at top:
```tsx
import { useTranslation } from 'next-i18next';
```

Inside `CommunityShell`:
```tsx
const { t } = useTranslation('community');
```

- [ ] **Step 2: Replace hardcoded strings in CommunityShell.tsx**

Replace:
```tsx
<Typography className="community-title">Community</Typography>
{TABS.map(...)} // TABS = ['For you', 'Following']
```

Change the `TABS` constant to use translation keys:
```tsx
const TABS = ['For you', 'Following'];
```
This stays as keys. Change the render to:
```tsx
<Typography className="community-title">{t('Community')}</Typography>
<Stack className="community-tabs">
    {TABS.map((tab, i) => (
        <Stack key={tab} className={`community-tab${activeTab === i ? ' active' : ''}`} onClick={() => handleTabClick(i)}>
            <Typography>{t(tab)}</Typography>
        </Stack>
    ))}
</Stack>
```

Replace right-rail strings:
```tsx
<OutlinedInput
    className="rail-search-bar"
    placeholder={t('Search community')}
    ...
/>
...
<Typography className="rail-section-title">{t('Trending at library')}</Typography>
...
<Typography className="rail-section-title">{t('Who to follow')}</Typography>
...
<Button className="rail-follow-btn" variant="outlined" size="small">
    {t('Follow')}
</Button>
```

- [ ] **Step 3: Update CommunityComposer.tsx — add imports and hook**

Add at top:
```tsx
import { useTranslation } from 'next-i18next';
```

Inside `CommunityComposer`:
```tsx
const { t } = useTranslation('community');
```

- [ ] **Step 4: Replace hardcoded strings in CommunityComposer.tsx**

Replace:
```tsx
<Button className="composer-submit" onClick={onLogin}>
    Login
```
With:
```tsx
<Button className="composer-submit" onClick={onLogin}>
    {t('Login')}
```

Replace placeholder:
```tsx
placeholder="Share a library update..."
```
With:
```tsx
placeholder={t('Share a library update...')}
```

Replace post button:
```tsx
{loading || submitting ? 'Posting...' : uploading ? 'Uploading...' : 'Post'}
```
With:
```tsx
{loading || submitting ? t('Posting...') : uploading ? t('Uploading...') : t('Post')}
```

---

## Task 15 — Update mypage components

**Files:**
- Modify: `libs/components/mypage/MyMenu.tsx`
- Modify: `libs/components/mypage/MyProfile.tsx`
- Modify: `libs/components/mypage/MyRequests.tsx`
- Modify: `libs/components/mypage/MyArticles.tsx`
- Modify: `libs/components/mypage/MyFavorites.tsx`
- Modify: `libs/components/mypage/RecentlyVisited.tsx`
- Modify: `libs/components/mypage/RobotTracking.tsx`

### MyMenu.tsx

- [ ] **Step 1: Add import and hook**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('mypage');`

- [ ] **Step 2: Translate NAV_ITEMS labels and logout**

The `NAV_ITEMS` array has hardcoded labels. Change the render to call `t(label)` instead of `label`:
```tsx
// Change in the map:
<span className="my-menu-label">{t(label)}</span>
```

Translate logout confirmation:
```tsx
if (await sweetConfirmAlert(t('Do you want to log out?'))) logOut();
```

Translate logout nav label:
```tsx
<span className="my-menu-label">{t('Logout')}</span>
```

### MyProfile.tsx

- [ ] **Step 3: Add import and hook**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('mypage');`

- [ ] **Step 4: Translate all labels in MyProfile.tsx**

```tsx
<Typography className="panel-title">{t('My Profile')}</Typography>
<Typography className="panel-subtitle">{t('Manage your account information')}</Typography>
<Typography className="field-label">{t('Photo')}</Typography>
<label htmlFor="profile-upload" className="upload-btn">{t('Change Photo')}</label>
<Typography className="upload-hint">{t('JPG, JPEG or PNG — max 2MB')}</Typography>
<Typography className="field-label">{t('Username')}</Typography>
// placeholder:
placeholder={t('Your username')}
<Typography className="field-label">{t('Phone')}</Typography>
placeholder={t('Your phone number')}
<Typography className="field-label">{t('Bio')}</Typography>
placeholder={t('Tell people a bit about yourself...')}
<Button className="profile-update-btn" onClick={updateProfileHandler} disabled={isDisabled()}>
    {t('Save Changes')}
</Button>
```

### MyRequests.tsx

- [ ] **Step 5: Add import and hook**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('mypage');`

- [ ] **Step 6: Translate STATUS_META labels**

Replace the `STATUS_META` object literal labels with translation calls. Since STATUS_META is defined at module level (outside component), move it inside or convert to a function that receives `t`:

Change `STATUS_META` from a module-level constant to a function inside the component:
```tsx
const STATUS_META = (t: (key: string) => string): Partial<Record<RequestStatus, StatusMeta>> => ({
    [RequestStatus.QUEUED]:              { label: t('Queued'),      dotClass: 'dot-muted'    },
    [RequestStatus.ASSIGNED]:            { label: t('Assigned'),    dotClass: 'dot-muted'    },
    [RequestStatus.DISPATCHED]:          { label: t('Dispatched'),  dotClass: 'dot-primary'  },
    [RequestStatus.NAVIGATING_TO_SHELF]: { label: t('Navigating'),  dotClass: 'dot-primary'  },
    [RequestStatus.ARRIVED_AT_SHELF]:    { label: t('At Shelf'),    dotClass: 'dot-primary'  },
    [RequestStatus.VERIFYING_BOOK]:      { label: t('Verifying'),   dotClass: 'dot-primary'  },
    [RequestStatus.BOOK_FOUND]:          { label: t('Book Found'),  dotClass: 'dot-primary'  },
    [RequestStatus.PICKING_UP]:          { label: t('Picking Up'),  dotClass: 'dot-primary'  },
    [RequestStatus.DELIVERING]:          { label: t('Delivering'),  dotClass: 'dot-primary'  },
    [RequestStatus.ARRIVED_AT_STUDENT]:  { label: t('Arrived'),     dotClass: 'dot-success'  },
    [RequestStatus.READY]:               { label: t('Ready'),       dotClass: 'dot-success'  },
    [RequestStatus.COMPLETED]:           { label: t('Completed'),   dotClass: 'dot-success'  },
    [RequestStatus.FAILED]:              { label: t('Failed'),      dotClass: 'dot-danger'   },
    [RequestStatus.CANCELLED]:           { label: t('Cancelled'),   dotClass: 'dot-danger'   },
    [RequestStatus.BOOK_NOT_FOUND]:      { label: t('Not Found'),   dotClass: 'dot-warning'  },
});
```

Inside the component, call it: `const statusMeta = STATUS_META(t);`
Then replace `STATUS_META[req.status ...]` with `statusMeta[req.status ...]`.

Also translate TABS:
```tsx
const TABS: { key: TabFilter; label: string }[] = [
    { key: 'ALL',     label: t('All') },
    { key: 'ACTIVE',  label: t('Active') },
    { key: 'HISTORY', label: t('History') },
];
```
(Move TABS inside the component.)

- [ ] **Step 7: Translate panel and empty state strings in MyRequests.tsx**

```tsx
<Typography className="panel-title">{t('My Requests')}</Typography>
<Typography className="panel-subtitle">{t('Borrow and purchase history')}</Typography>
...
<Typography className="empty-heading">{t('No requests found')}</Typography>
<Typography className="empty-body">
    {activeTab === 'ACTIVE'
        ? t('You have no active borrow or purchase requests.')
        : t('Your request history will appear here.')}
</Typography>
```

### MyArticles.tsx

- [ ] **Step 8: Add import, hook, and translate strings**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('mypage');`

Replace:
```tsx
<Typography className="panel-title">{t('My Twits')}</Typography>
<Typography className="twit-state-title">{t('Loading twits...')}</Typography>
<Typography className="twit-state-title">{t('Unable to load twits.')}</Typography>
<Typography className="empty-heading">{t('No twits yet.')}</Typography>
<Typography className="empty-body">{t('Share your thoughts with the library community.')}</Typography>
```

### MyFavorites.tsx

- [ ] **Step 9: Add import, hook, and translate strings**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('mypage');`

Replace:
```tsx
<Typography className="panel-title">{t('Saved Books')}</Typography>
<Typography className="empty-heading">{t('No saved books yet')}</Typography>
<Typography className="empty-body">{t('Books you like will appear here for quick access.')}</Typography>
```

### RecentlyVisited.tsx

- [ ] **Step 10: Add import, hook, and translate strings**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('mypage');`

Replace:
```tsx
<Typography className="panel-title">{t('Recently Viewed')}</Typography>
<Typography className="empty-heading">{t('No recently viewed books')}</Typography>
<Typography className="empty-body">{t('Books you browse will appear here.')}</Typography>
```

### RobotTracking.tsx

- [ ] **Step 11: Add import, hook, and translate strings**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('mypage');`

Replace SVG text labels:
```tsx
<text x={114} y={62} className="rt-zone-label" textAnchor="middle">{t('Library Books')}</text>
<text x={114} y={78} className="rt-zone-sublabel" textAnchor="middle">{t('Physical Collection')}</text>
<text x={364} y={62} className="rt-zone-label" textAnchor="middle">{t('Commercial Books')}</text>
<text x={364} y={78} className="rt-zone-sublabel" textAnchor="middle">{t('Purchasable Items')}</text>
<text x={238} y={153} className="rt-zone-label" textAnchor="middle">{t('Navigation Aisle')}</text>
<text x={238} y={165} className="rt-zone-sublabel" textAnchor="middle">{t('Central Corridor')}</text>
<text x={34} y={240} className="rt-zone-label" textAnchor="middle">{t('Reception')}</text>
<text x={34} y={258} className="rt-zone-sublabel" textAnchor="middle">{t('Service Desk')}</text>
<text x={184} y={236} className="rt-zone-label" textAnchor="middle">{t('Charging Dock')}</text>
<text x={184} y={252} className="rt-zone-sublabel" textAnchor="middle">{t('Robot Station')}</text>
```

Replace panel labels and title:
```tsx
<Typography className="panel-title">{t('Live Tracking')}</Typography>
<Typography className="panel-subtitle">{t('TurtleBot 3 — Library Floor Level 1')}</Typography>
<Typography className="rt-empty-title">{t('No active delivery')}</Typography>
<span className="rt-panel-label">{t('Shelf Location')}</span>
<span className="rt-panel-label">{t('Robot Status')}</span>
<span className="rt-panel-label">{t('Battery')}</span>
```

Replace ETA text:
```tsx
{etaText && <div className="tracker-eta">{t('Est. arrival:')} {etaText}</div>}
```

Replace floor label:
```tsx
<span>{t('Library Floor — Level 1')}</span>
```

---

## Task 16 — Update CS components

**Files:**
- Modify: `libs/components/cs/Notice.tsx`
- Modify: `libs/components/cs/Faq.tsx`

### Notice.tsx

- [ ] **Step 1: Add import, hook, and translate**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('cs');`

Replace:
```tsx
<span className={'title'}>{t('Notice')}</span>
...
<span>number</span>   → <span>{t('number')}</span>
<span>title</span>    → <span>{t('title')}</span>
<span>date</span>     → <span>{t('date')}</span>
...
{ele?.event ? <div>{t('event')}</div> : ...}
```

### Faq.tsx

- [ ] **Step 2: Add import, hook, and translate**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('cs');`

The FAQ data array strings (subjects/content) are static mock data — translate the two subjects and contents that appear in the `en/cs.json`. These are legacy GoTogether strings but since they're visible they need translation:
```tsx
// The subject/content come from the `data` object — change to use t()
subject: t('Are the properties displayed on the site reliable?'),
content: t('of course we only have verified properties'),
...
subject: t('What types of properties do you offer?'),
```

---

## Task 17 — Update homepage components

**Files:**
- Modify: `libs/components/homepage/FeaturedBooks.tsx`
- Modify: `libs/components/homepage/MostBorrowed.tsx`
- Modify: `libs/components/homepage/NewArrivals.tsx`
- Modify: `libs/components/homepage/HeaderFilter.tsx`

### FeaturedBooks.tsx, MostBorrowed.tsx, NewArrivals.tsx

- [ ] **Step 1: Add import and hook to each**

For each file:
```tsx
import { useTranslation } from 'next-i18next';
```
Inside component:
```tsx
const { t } = useTranslation('books');
```

- [ ] **Step 2: Replace hardcoded strings**

FeaturedBooks.tsx:
```tsx
<span>{t('Featured Books')}</span>
<p>{t('Highest rated books in our collection')}</p>
```

MostBorrowed.tsx:
```tsx
<span>{t('Most Borrowed')}</span>
<p>{t('Top books our students are reading right now')}</p>
<span>{t('Browse All Books')}</span>
```

NewArrivals.tsx:
```tsx
<span>{t('New Arrivals')}</span>
<p>{t('Recently added books to our library collection')}</p>
```

### HeaderFilter.tsx

- [ ] **Step 3: Verify existing t() and add missing translations**

HeaderFilter already has `useTranslation('common')` and `t('Advanced')`. Change namespace to include `books` or switch to `books` namespace for filter-specific strings. Since HeaderFilter is used on the homepage (via LayoutHome), we need both namespaces available.

Change HeaderFilter to use `books` namespace for the filter strings:
```tsx
const { t: tBooks } = useTranslation('books');
const { t } = useTranslation('common');  // keep for 'Advanced'
```

Replace filter strings:
```tsx
<span>{tBooks('Smart Library Advanced Filters')}</span>
...
<button onClick={() => pushSearchHandler().then()}>{tBooks('Search')}</button>
<label>{tBooks('READER LEVEL')}</label>
<MenuItem value={''}>{tBooks('All Levels')}</MenuItem>
<label>{tBooks('LANGUAGE')}</label>
<MenuItem value={''}>{tBooks('All Languages')}</MenuItem>
<span>{tBooks('Borrowable Only')}</span>
<span>{tBooks('Purchasable Only')}</span>
<label>{tBooks('MINIMUM RATING')}</label>
<label>{tBooks('MIN PRICE')}</label>
<label>{tBooks('MAX PRICE')}</label>
<span>{tBooks('Reset all filters')}</span>
```

---

## Task 18 — Update CS and account pages + serverSideTranslations

**Files:**
- Modify: `pages/cs/index.tsx`
- Modify: `pages/account/join.tsx`
- Modify: `pages/about/index.tsx`

### pages/cs/index.tsx

- [ ] **Step 1: Update serverSideTranslations and add useTranslation**

Change:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'cs'])),
    },
});
```

Add to component:
```tsx
import { useTranslation } from 'next-i18next';
...
const { t } = useTranslation('cs');
```

- [ ] **Step 2: Replace hardcoded strings**

```tsx
<span>{t('Cs center')}</span>
<p>{t('I will answer your questions')}</p>
<div className={tab == 'notice' ? 'active' : ''} onClick={() => changeTabHandler('notice')}>
    {t('Notice')}
</div>
<div className={tab == 'faq' ? 'active' : ''} onClick={() => changeTabHandler('faq')}>
    {t('FAQ')}
</div>
```

### pages/account/join.tsx

- [ ] **Step 3: Update serverSideTranslations and add useTranslation**

Change:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'account'])),
    },
});
```

Add to component:
```tsx
import { useTranslation } from 'next-i18next';
...
const { t } = useTranslation('account');
```

- [ ] **Step 4: Replace hardcoded strings in join.tsx**

```tsx
<span>{loginView ? t('login') : t('signup')}</span>
<p>{loginView ? t('Login in with this account across the following sites.') : t('Sign in with this account across the following sites.')}</p>
...
<span>{t('Nickname')}</span>
<input placeholder={t('Enter Nickname')} ... />
<span>{t('Password')}</span>
<input placeholder={t('Enter Password')} ... />
<span>{t('Phone')}</span>
<input placeholder={t('Enter Phone')} ... />
...
<FormControlLabel control={<Checkbox defaultChecked size="small" />} label={t('Remember me')} />
<a>{t('Lost your password?')}</a>
...
<Button ... onClick={doLogin}>{t('LOGIN')}</Button>
<Button ... onClick={doSignUp}>{t('SIGNUP')}</Button>
...
{loginView ? (
    <p>{t('Not registered yet?')}<b onClick={() => viewChangeHandler(false)}>{t('SIGNUP')}</b></p>
) : (
    <p>{t('Have account?')}<b onClick={() => viewChangeHandler(true)}>{t('LOGIN')}</b></p>
)}
```

Also replace the validation error strings inside `doLogin` and `doSignUp`:
```tsx
await sweetMixinErrorAlert(t('Nickname must be 3-12 characters'));
await sweetMixinErrorAlert(t('Password must be 5-12 characters'));
await sweetMixinErrorAlert(t('Phone number is required'));
```

Note: `doLogin` and `doSignUp` are `useCallback` — add `t` to their dependency arrays.

### pages/about/index.tsx

- [ ] **Step 5: Add serverSideTranslations**

Add (currently missing):
```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'about'])),
    },
});
```

- [ ] **Step 6: Add useTranslation and translate about page**

Add to component:
```tsx
import { useTranslation } from 'next-i18next';
...
const { t } = useTranslation('about');
```

Replace strings:
```tsx
<strong>{t("We're on a Mission to Change View of Real Estate Field.")}</strong>
<span>{t('Modern Villa')}</span>
<p>{t('Nullam sollicitudin blandit Nullam maximus.')}</p>
<span>{t('Secure Payment')}</span>
<strong>4M</strong><p>{t('Award Winning')}</p>
<strong>12K</strong><p>{t('Property Ready')}</p>
<strong>20M</strong><p>{t('Happy Customer')}</p>
<span className={'title'}>{t('Our Exclusive Agents')}</span>
<p className={'desc'}>{t('Aliquam lacinia diam quis lacus euismod')}</p>
<strong>{t("Let's find the right selling option for you")}</strong>
<span>{t('Property Management')}</span>
<p>{t('Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.')}</p>
<Stack className={'btn'}>{t('Learn More')}<img src="/img/icons/rightup.svg" alt="" /></Stack>
<span>{t("Trusted bu the world's best")}</span>
<strong>{t('Need help? Talk to our expert.')}</strong>
<p>{t('Talk to our experts or Browse through more properties.')}</p>
<div className={'white'}>{t('Contact Us')}<img src="/img/icons/rightup.svg" alt="" /></div>
```

---

## Task 19 — Update books and member pages + serverSideTranslations

**Files:**
- Modify: `pages/books/index.tsx`
- Modify: `pages/books/detail.tsx`
- Modify: `pages/member/index.tsx`
- Modify: `pages/member/[memberId].tsx`
- Modify: `pages/agent/detail.tsx`

### pages/books/index.tsx

- [ ] **Step 1: Update serverSideTranslations and add useTranslation**

Change:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'books'])),
    },
});
```

Add to component:
```tsx
import { useTranslation } from 'next-i18next';
...
const { t } = useTranslation('books');
```

- [ ] **Step 2: Replace hardcoded strings in books/index.tsx**

```tsx
<span>Sort by</span>  →  <span>{t('Sort by')}</span>
...
<MenuItem id={'new'}>{t('New')}</MenuItem>
<MenuItem id={'lowest'}>{t('Lowest Price')}</MenuItem>
<MenuItem id={'highest'}>{t('Highest Price')}</MenuItem>
...
// filterSortName is used in the button — also set translated values:
const [filterSortName, setFilterSortName] = useState(t('New'));
// In sortingHandler:
setFilterSortName(t('New'));
setFilterSortName(t('Lowest Price'));
setFilterSortName(t('Highest Price'));
...
<p>No Properties found!</p>  →  <p>{t('No books found')}</p>
...
<Typography>Total {total} propert{total > 1 ? 'ies' : 'y'} available</Typography>
→
<Typography>Total {total} {t('available')}</Typography>
```

### pages/books/detail.tsx

- [ ] **Step 3: Update serverSideTranslations for detail page**

Change:
```tsx
export const getStaticProps = async ({ locale }: any) => ({  // or getServerSideProps
    props: {
        ...(await serverSideTranslations(locale, ['common', 'books'])),
    },
});
```

Scan the detail page for hardcoded strings and wrap in `t()`. (The detail page is mostly property detail content — wrap visible UI strings similarly.)

### pages/member/index.tsx and pages/member/[memberId].tsx

- [ ] **Step 4: Update serverSideTranslations for member pages**

For `pages/member/index.tsx`:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'member'])),
    },
});
```

For `pages/member/[memberId].tsx`:
```tsx
export const getServerSideProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'member'])),
    },
});
```

- [ ] **Step 5: Add useTranslation to [memberId].tsx and replace strings**

Add: `const { t } = useTranslation('member');`

Replace:
```tsx
// TABS constant (move inside component or keep as keys):
const TABS = [t('Posts'), t('Followers'), t('Followings')];
...
{isFollowing ? t('Following') : t('Follow')}
...
<span className="member-stat-label">{t('Posts')}</span>
<span className="member-stat-label">{t('Following')}</span>
<span className="member-stat-label">{t('Followers')}</span>
...
Joined <Moment...>  →  {t('Joined')} <Moment...>
...
<Typography className="rt-section-title">{t('Trending at library')}</Typography>
<Typography className="rt-section-title">{t('Who to follow')}</Typography>
<Button ...>{t('Follow')}</Button>
placeholder={t('Search community')}
...
<Typography className="member-state-title">{t('No posts yet')}</Typography>
<Typography className="member-state-copy">{t('Posts from this member will appear here.')}</Typography>
```

Note: `TABS` is used for rendering, so move it inside the component after `t` is available:
```tsx
const TABS = [t('Posts'), t('Followers'), t('Followings')];
```

### pages/agent/detail.tsx

- [ ] **Step 6: Update serverSideTranslations for agent/detail**

```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'member'])),
    },
});
```

---

## Task 20 — Update community and mypage pages + member components

**Files:**
- Modify: `pages/community/index.tsx`
- Modify: `pages/community/detail.tsx` (if exists)
- Modify: `pages/mypage/index.tsx`
- Modify: `libs/components/member/MemberFollowers.tsx`
- Modify: `libs/components/member/MemberFollowings.tsx`
- Modify: `libs/components/member/MemberProperties.tsx`
- Modify: `libs/components/member/MemberArticles.tsx`

### pages/community/index.tsx

- [ ] **Step 1: Update serverSideTranslations**

Change:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'community'])),
    },
});
```

- [ ] **Step 2: Replace dynamic count string**

Find:
```tsx
<Typography>
    Total {totalCount} post{totalCount > 1 ? 's' : ''} available
</Typography>
```

Replace with:
```tsx
import { useTranslation } from 'next-i18next';
// In component:
const { t } = useTranslation('community');
...
<Typography>
    {t('Total')} {totalCount} {totalCount > 1 ? t('posts available') : t('post available')}
</Typography>
```

### pages/mypage/index.tsx

- [ ] **Step 3: Update serverSideTranslations for mypage**

Change:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'mypage'])),
    },
});
```

(No hardcoded UI strings in the page-level mypage/index.tsx itself — all strings are in sub-components already handled above.)

### Member sub-components (MemberFollowers, MemberFollowings, MemberProperties, MemberArticles)

- [ ] **Step 4: Update MemberFollowers.tsx**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('member');`

Replace:
```tsx
<Typography>{t('No followers yet.')}</Typography>
```

- [ ] **Step 5: Update MemberFollowings.tsx**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('member');`

Replace:
```tsx
<Typography>{t('No followings yet.')}</Typography>
```

- [ ] **Step 6: Update MemberProperties.tsx**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('member');`

Replace:
```tsx
<Typography className="main-title">{t('Properties')}</Typography>
<Typography className="title-text">{t('Listing title')}</Typography>
<Typography className="title-text">{t('Date Published')}</Typography>
<Typography className="title-text">{t('Status')}</Typography>
<Typography className="title-text">{t('View')}</Typography>
<p>{t('No Property found!')}</p>
```

- [ ] **Step 7: Update MemberArticles.tsx**

Add: `import { useTranslation } from 'next-i18next';`
In component: `const { t } = useTranslation('member');`

Replace:
```tsx
<Typography className="main-title">{t('Community Twits')}</Typography>
<p>{t('Loading twits...')}</p>
<p>{t('Unable to load member twits.')}</p>
<p>{t('No twits found.')}</p>
```

---

## Task 21 — Update index page and pages that load `books` namespace

**Files:**
- Modify: `pages/index.tsx` (homepage — needs `books` namespace for FeaturedBooks/MostBorrowed/NewArrivals/HeaderFilter)

- [ ] **Step 1: Update serverSideTranslations for homepage**

Change:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'books', 'layout'])),
    },
});
```

(`layout` for the hero text in LayoutHome, `books` for the section components.)

---

## Task 22 — Update community/detail.tsx serverSideTranslations

**Files:**
- Check: `pages/community/detail.tsx`

- [ ] **Step 1: Update if getStaticProps/getServerSideProps exists**

If `pages/community/detail.tsx` has a `getStaticProps`:
```tsx
export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common', 'community'])),
    },
});
```

---

## Summary

**JSON files created:** 27 files total (9 namespaces × 3 locales)

**Source files modified:**
- `libs/components/Top.tsx` — add `Books`, `About Us`, `Logout` t() calls
- `libs/components/Footer.tsx` — full translation with `layout` namespace
- `libs/components/layout/LayoutBasic.tsx` — fix `About` key in common.json
- `libs/components/layout/LayoutHome.tsx` — translate hero text with `layout` namespace
- `libs/components/community/CommunityShell.tsx` — `community` namespace
- `libs/components/community/CommunityComposer.tsx` — `community` namespace
- `libs/components/mypage/MyMenu.tsx` — `mypage` namespace
- `libs/components/mypage/MyProfile.tsx` — `mypage` namespace
- `libs/components/mypage/MyRequests.tsx` — `mypage` namespace + convert STATUS_META to function
- `libs/components/mypage/MyArticles.tsx` — `mypage` namespace
- `libs/components/mypage/MyFavorites.tsx` — `mypage` namespace
- `libs/components/mypage/RecentlyVisited.tsx` — `mypage` namespace
- `libs/components/mypage/RobotTracking.tsx` — `mypage` namespace (SVG text + panel labels)
- `libs/components/cs/Notice.tsx` — `cs` namespace
- `libs/components/cs/Faq.tsx` — `cs` namespace
- `libs/components/homepage/FeaturedBooks.tsx` — `books` namespace
- `libs/components/homepage/MostBorrowed.tsx` — `books` namespace
- `libs/components/homepage/NewArrivals.tsx` — `books` namespace
- `libs/components/homepage/HeaderFilter.tsx` — add `books` namespace alongside `common`
- `libs/components/member/MemberFollowers.tsx` — `member` namespace
- `libs/components/member/MemberFollowings.tsx` — `member` namespace
- `libs/components/member/MemberProperties.tsx` — `member` namespace
- `libs/components/member/MemberArticles.tsx` — `member` namespace
- `pages/index.tsx` — add `books`, `layout` to serverSideTranslations
- `pages/about/index.tsx` — add serverSideTranslations + `about` namespace translations
- `pages/cs/index.tsx` — add `cs` namespace
- `pages/account/join.tsx` — add `account` namespace
- `pages/books/index.tsx` — add `books` namespace
- `pages/books/detail.tsx` — add `books` namespace
- `pages/community/index.tsx` — add `community` namespace
- `pages/community/detail.tsx` — add `community` namespace
- `pages/mypage/index.tsx` — add `mypage` namespace
- `pages/member/index.tsx` — add `member` namespace
- `pages/member/[memberId].tsx` — add `member` namespace + translate strings
- `pages/agent/detail.tsx` — add `member` namespace

**Key count per namespace (approximate):**
- common: 23 keys
- layout: 30 keys
- community: 15 keys
- mypage: 55 keys
- books: 27 keys
- member: 23 keys
- account: 19 keys
- about: 17 keys
- cs: 11 keys
