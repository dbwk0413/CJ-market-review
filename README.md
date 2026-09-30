# 아이디어 시장 검토

제품 아이디어와 타깃을 입력하면 공개 웹 자료를 조사해 비교 시장, 경쟁 제품, 가격 시나리오, 검증 계획을 보여주는 시제품입니다. 특정 기업에 종속되지 않습니다.

## 파일

- `index.html`, `app.js`: 화면과 보고서. GitHub Pages에서 제공
- `config.js`: 조사 API 주소. 처음에는 빈 값
- `api/analyze.js`: 서버에서 웹 검색과 보고서 구성을 수행하는 Vercel Function

**현재 GitHub Pages에 파일만 업로드하면 자동 조사가 실행되지 않습니다.** GitHub Pages는 서버 코드를 실행하지 않습니다. API를 Vercel에 배포하고 `config.js`를 연결해야 합니다. OpenAI API 키에는 사용료가 발생할 수 있습니다.

## 기존 GitHub 저장소에 파일 올리기

1. [CJ-market-review 저장소](https://github.com/dbwk0413/CJ-market-review)를 엽니다.
2. 기존 루트 `index.html`, `README.md`를 새 파일로 **교체**하고, `app.js`, `config.js`를 저장소 루트에 추가합니다. GitHub의 **Add file → Upload files**를 이용할 수 있습니다. 같은 이름이 중복되면 파일별 **Edit this file**에서 내용을 교체하세요.
3. `api/analyze.js`는 **Add file → Create new file**을 눌러 파일 이름에 `api/analyze.js`를 입력한 다음, 내려받은 파일 내용을 붙여 넣어 생성합니다. 컴퓨터에 GitHub Desktop이 있다면 압축을 푼 파일 구조를 저장소 폴더에 복사하고 커밋·푸시해도 됩니다.
4. **Commit changes**를 누릅니다. Pages 설정 `main` / `/(root)`는 유지합니다. 이때 새 화면은 보이지만 API 연결 전에는 조사 버튼이 안내 문구를 보여줍니다.

## 조사 API 연결

1. [Vercel](https://vercel.com/)에 GitHub 계정으로 가입/로그인합니다.
2. **Add New → Project → Import Git Repository**에서 `CJ-market-review`를 선택합니다. Root Directory는 저장소 루트, Framework Preset은 **Other**로 설정합니다.
3. 프로젝트 **Settings → Environment Variables**에 아래 값을 추가합니다.

   | 이름 | 값 |
   | --- | --- |
   | `OPENAI_API_KEY` | 본인의 OpenAI API 키 |
   | `APP_ACCESS_CODE` | 자신이 정한 긴 접속 코드 |
   | `OPENAI_MODEL` | 선택 사항. 기본값 `gpt-6-astra` |

4. Vercel에서 **Deploy**합니다. 키를 나중에 넣었다면 **Redeploy**합니다. `https://프로젝트주소.vercel.app/api/analyze`을 브라우저에서 열면 POST 전용 안내(405)가 나오는 것이 정상입니다.
5. GitHub 저장소의 `config.js`를 열고 연필 아이콘을 눌러 다음처럼 자신의 Vercel 주소를 넣은 뒤 **Commit changes**를 누릅니다.

   ```js
   window.MARKET_API_URL = 'https://프로젝트주소.vercel.app/api/analyze';
   ```

6. [기존 사이트](https://dbwk0413.github.io/CJ-market-review/)를 새로고침합니다. 제품 아이디어와 타깃을 입력하고 **근거 조사와 보고서 생성**을 누릅니다. 접속 코드를 한 번 입력하면 현재 탭 세션에서 다시 묻지 않습니다. 보고서의 **인쇄 · PDF 저장**으로 내보낼 수 있습니다.

API 키와 접속 코드를 GitHub 파일이나 `config.js`에 넣지 마세요. 공개 사이트의 API 이용을 통제하려면 Vercel의 사용량/보호 설정도 확인하세요. 단순 접속 코드는 정교한 사용자 계정 시스템을 대신하지 않습니다.

## 결과 해석

- '관찰'은 검색 가능한 수요 관련 **대리 지표**입니다. 실제 현장 관찰은 별도로 합니다.
- GIS 항목은 선택 입력한 지역에 관한 **공개 공간 통계**가 발견될 때만 표시합니다. 지역을 비우면 보류합니다.
- 경쟁 제품의 공개 소매 가격은 참고 자료입니다. 제품별 매출과 시장 점유율은 확인되지 않으면 제시하지 않습니다.
- 가격 시나리오의 45% 원가율과 25% 유통 등 비용은 **예시 가정**입니다. 실제 견적이나 이익이 아닙니다. 원가를 알면 선택 입력으로 교체할 수 있습니다.
- 웹 검색과 AI의 출처 연결이 잘못될 수 있으므로 원문의 규격·시점·지역·가격을 직접 확인한 뒤 의사결정하세요.

## 로컬 확인

`index.html`을 열면 화면을 볼 수 있으나 자동 조사는 서버 연결 전에는 되지 않습니다. 배포 후 실제 조사 결과는 API 키·접속 코드와 모델 사용 권한이 있어야 시험할 수 있습니다.
