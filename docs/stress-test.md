# Stress Test

Энэ repo дотор deploy хийсэн API-д зориулсан жижиг ApacheBench smoke stress test орсон.
Мөн дахин ашиглах боломжтой `k6` GraphQL stress test template нэмэгдсэн.

## Юуг шалгах вэ

- `GET /health`
- read-only `health` query-тай `POST /graphql`

Эдгээр нь эхний шатанд аюулгүй endpoint-үүд. Учир нь хэрэглэгчийн өгөгдөлд write хийхгүй.

## Ажиллуулах

```sh
npm run stress:test
```

## `k6` GraphQL test

`ab`-аас илүү бодит тест хийх үед үүнийг ашиглана. Ялангуяа:

- custom GraphQL query
- auth header
- production бус орчин дахь staged load

Default health-query жишээ:

```sh
k6 run scripts/stress-test.k6.js
```

Эсвэл npm-ээр:

```sh
npm run stress:test:k6
```

## Teacher стандарт benchmark

Энэ төслийн teacher талын default benchmark нь `DashboardOverview`.

Ингэж ажиллуулна:

```sh
AUTH_TOKEN="your-bearer-token" npm run stress:test:teacher-dashboard
```

Ачааллын тохиргоог өөрчилж болно:

```sh
AUTH_TOKEN="your-bearer-token" \
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
VUS=20 \
DURATION=20s \
SLEEP_SECONDS=0.5 \
npm run stress:test:teacher-dashboard
```

Энэ wrapper нь `k6` эхлэхээс өмнө GraphQL preflight check хийдэг.
Token хугацаа нь дууссан эсвэл буруу байвал буруу stress test үр дүн гаргахын оронд шууд зогсоно.

## Soak test

Богино benchmark тогтвортой гарсны дараа урт soak test ажиллуул:

```sh
AUTH_TOKEN="your-bearer-token" npm run stress:test:teacher-dashboard:soak
```

Илүү хүчтэй soak жишээ:

```sh
AUTH_TOKEN="your-bearer-token" \
VUS=15 \
DURATION=5m \
SLEEP_SECONDS=0.5 \
npm run stress:test:teacher-dashboard:soak
```

### Бодит query-тай `k6`

```sh
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
AUTH_TOKEN="your-bearer-token" \
QUERY_FILE="apps/web/src/graphql/queries/student-home.graphql" \
VUS=20 \
DURATION=1m \
SLEEP_SECONDS=0.5 \
k6 run scripts/stress-test.k6.js
```

### Variables-тай `k6`

```sh
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
AUTH_TOKEN="your-bearer-token" \
QUERY_FILE="apps/web/src/graphql/queries/class-detail.graphql" \
VARIABLES_FILE="/absolute/path/to/class-detail.variables.json" \
OPERATION_NAME="ClassDetail" \
VUS=10 \
DURATION=45s \
k6 run scripts/stress-test.k6.js
```

Аюулгүй default query file:

`scripts/graphql-health-query.graphql`

## Энэ repo доторх санал болгох GraphQL target-ууд

Доорх дарааллаар, хөнгөнөөс хүнд рүү явбал зөв:

1. `apps/web/src/graphql/queries/dashboard-overview.graphql`
   - Teacher auth-тай эхний benchmark хийхэд хамгийн тохиромжтой
   - Хөнгөнөөс дунд payload
   - Variables хэрэггүй
2. `apps/web/src/graphql/queries/student-home.graphql`
   - Student landing page benchmark хийхэд тохиромжтой
   - Class, exam, attempt гэсэн nested data-тай дунд payload
   - Variables хэрэггүй
3. `apps/web/src/graphql/queries/class-detail.graphql`
   - Илүү хүнд teacher detail benchmark
   - `classId` хэрэгтэй
   - Student insight, exam insight зэрэг nested data агуулна
4. `apps/web/src/graphql/queries/my-exams.graphql`
   - Хүнд query
   - Дээрх query-нууд тогтвортой болсны дараа л ашигла
   - Nested exam, question, attempt data-г илүү хүчтэй шахна

## Санал болгож байгаа ажиллуулах дараалал

Эхлээд:

```sh
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
AUTH_TOKEN="your-bearer-token" \
QUERY_FILE="apps/web/src/graphql/queries/dashboard-overview.graphql" \
OPERATION_NAME="DashboardOverview" \
VUS=10 \
DURATION=30s \
SLEEP_SECONDS=1 \
k6 run scripts/stress-test.k6.js
```

Хэрвээ зөвхөн teacher стандарт run хийх бол:

```sh
AUTH_TOKEN="your-bearer-token" npm run stress:test:teacher-dashboard
```

Дараа нь:

```sh
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
AUTH_TOKEN="your-bearer-token" \
QUERY_FILE="apps/web/src/graphql/queries/student-home.graphql" \
OPERATION_NAME="StudentHome" \
VUS=10 \
DURATION=30s \
SLEEP_SECONDS=1 \
k6 run scripts/stress-test.k6.js
```

Дараа нь илүү хүнд `ClassDetail`:

```sh
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
AUTH_TOKEN="your-bearer-token" \
QUERY_FILE="apps/web/src/graphql/queries/class-detail.graphql" \
VARIABLES_FILE="scripts/class-detail.variables.example.json" \
OPERATION_NAME="ClassDetail" \
VUS=5 \
DURATION=30s \
SLEEP_SECONDS=1 \
k6 run scripts/stress-test.k6.js
```

Эдгээр тогтвортой болсны дараа л:

```sh
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
AUTH_TOKEN="your-bearer-token" \
QUERY_FILE="apps/web/src/graphql/queries/my-exams.graphql" \
OPERATION_NAME="MyExamsQuery" \
VUS=3 \
DURATION=20s \
SLEEP_SECONDS=1.5 \
k6 run scripts/stress-test.k6.js
```

`ClassDetail` heavy read wrapper:

```sh
AUTH_TOKEN="your-bearer-token" \
VARIABLES_FILE="scripts/class-detail.variables.example.json" \
VUS=5 \
DURATION=20s \
SLEEP_SECONDS=1 \
npm run stress:test:class-detail
```

Үүнээс өмнө `scripts/class-detail.variables.example.json` дотор бодит `classId`-гаа оруулсан байх ёстой.

## Write path

Эхлээд аль болох хамгийн хөнгөн write path-аас эхэл. Жишээ нь `saveAnswer`.

Анхаарах зүйл:

- production дээр чухал өгөгдөлтэй шууд эхэлж болохгүй
- test хийх `attempt`, `question` ашигла
- өгөгдөл өөрчлөгдөнө гэж тооцоол

Команд:

```sh
AUTH_TOKEN="your-bearer-token" \
VARIABLES_FILE="scripts/save-answer.variables.example.json" \
VUS=2 \
DURATION=10s \
SLEEP_SECONDS=1 \
npm run stress:test:write-save-answer
```

Үүнээс өмнө `scripts/save-answer.variables.example.json` дотор бодит `attemptId`, `questionId`-гаа оруул.

## Realtime

Realtime дээр бүрэн multi-user test хийхээс өмнө эхлээд SSE stream өөрөө амьд байна уу гэдгийг шалга:

```sh
AUTH_TOKEN="your-bearer-token" \
CLASS_ID="your-class-id" \
npm run stress:test:realtime-smoke
```

Гарч ирж болох event-үүд:

- `connected`
- `heartbeat`
- `exam_assigned`
- `attempt_started`
- `attempt_submitted`
- `attempt_reviewed`
- `attempt_integrity_flag`

## Тохиргоо override хийх

```sh
BASE_URL="https://pinequest-api.b94889340.workers.dev" \
HEALTH_REQUESTS=3000 \
HEALTH_CONCURRENCY=100 \
GRAPHQL_REQUESTS=1000 \
GRAPHQL_CONCURRENCY=50 \
npm run stress:test
```

## Output-ийг яаж унших вэ

- `Failed requests`
  - Эрүүл, бага эрсдэлтэй test дээр `0`-д ойр байх ёстой.
- `Requests per second`
  - Их байх тусмаа сайн мэт харагддаг ч latency-тай нь хамт харж байж утгатай.
- `Time per request`
  - Дундаж latency.
  - Concurrency өсөхөд огцом өсөж байвал анхаар.
- `50%`, `95%`, `99%`
  - Эдгээр percentile нь average-аас илүү чухал.
  - `95%`, `99%` огцом өсвөл queueing эсвэл overload эхэлж байна гэсэн үг.
- `Length` failures
  - Ихэнхдээ edge, proxy, эсвэл хамгаалалтын layer-аас хүлээж байснаас өөр response буцаж байгааг илтгэнэ.

## Санал болгох ramp

Нэг дор хэт хүнд test рүү үсрэхийн оронд үе шаттай өсгө:

1. `HEALTH_REQUESTS=500 HEALTH_CONCURRENCY=20 GRAPHQL_REQUESTS=200 GRAPHQL_CONCURRENCY=10`
2. `HEALTH_REQUESTS=1000 HEALTH_CONCURRENCY=50 GRAPHQL_REQUESTS=400 GRAPHQL_CONCURRENCY=20`
3. `HEALTH_REQUESTS=3000 HEALTH_CONCURRENCY=100 GRAPHQL_REQUESTS=1000 GRAPHQL_CONCURRENCY=50`

## Чухал тэмдэглэл

Энэ нь зөвхөн edge/read-path-ийн эхний шатны stress check.
Дараах зүйлсийг бүрэн батлахгүй:

- authenticated traffic-ийг бүхэлд нь
- бодит exam GraphQL query-ууд
- D1-heavy workload
- Clerk болон бусад third-party dependency
- realtime/SSE fan-out

Илүү гүн test хийх бол production биш орчинд бодит read query-тай staged `k6` scenario нэм.

## Дараагийн зөв алхам

Танай backend дээр хамгийн зөв дараагийн алхам нь:

1. бодит read-heavy GraphQL query сонгох
2. жинхэнэ bearer token-оор `k6` ажиллуулах
3. `VUS=10`, дараа нь `20`, дараа нь `50` рүү шатлуулах
4. test явах үед Cloudflare, Worker CPU, D1 latency, app error log-оо зэрэг харах

## Infra metrics correlation

Meaningful test бүрийн үед доорхийг зэрэг хар:

1. Cloudflare Worker request count болон error rate
2. Worker CPU time болон execution-limit warning
3. D1 latency, read volume, write volume
4. API error log, ялангуяа auth, timeout, GraphQL resolver fail
5. `k6` эсвэл `ab` дээрх tail latency, ялангуяа `p95`, `p99`

Энгийн тайлбар:

- `p95/p99` өсөөд error бага хэвээр байвал:
  - queueing эсвэл dependency удааширч эхэлж байна
- app error өсөхдөө D1 latency хамт өсвөл:
  - bottleneck нь database path байх магадлал өндөр
- SSE disconnect өсөөд GraphQL error гарахгүй байвал:
  - realtime channel эсвэл edge path асуудалтай байх магадлалтай
- write mutation fail болоод read healthy хэвээр байвал:
  - transaction, validation, эсвэл write path өөрөө bottleneck байх магадлалтай

## Энэ төсөлд зориулсан тэмдэглэл

- Teacher талын эхний сонголт: `DashboardOverview`
- Student талын эхний сонголт: `StudentHome`
- Nested detail benchmark хийхэд хамгийн зөв query: `ClassDetail`
- Энд дурдсан query-уудаас хамгийн хүнд read path: `MyExamsQuery`

Production эмзэг бол `MyExamsQuery`-оос эхэлж болохгүй.
Мөн Clerk session token богино настай байж болдог тул урт test хийхээс өмнө token-ийн lifespan-аа бодолц. Боломжгүй бол эхлээд `20s` run-аас эхэл.
