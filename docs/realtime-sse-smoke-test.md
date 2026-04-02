# Realtime SSE Smoke Test

## Purpose

This checklist verifies that PineQuest realtime SSE updates reach the main teacher and student surfaces.

## Preconditions

- API is running with the `LIVE_EXAM_EVENTS` Durable Object binding.
- Web app is running and signed in with test users.
- At least one teacher-owned class exists with at least one student enrolled.
- Teacher and student can both access the same class.

## Startup

1. Start the API worker:

```bash
cd apps/api
npm run dev
```

2. Start the web app from the repo root:

```bash
npm --prefix apps/web run dev
```

3. Open the app in two browser sessions:
- Teacher session
- Student session

## Teacher Exam Stream

### Exam assigned

1. In the teacher session, open `/my-exams` or `/evaluation`.
2. In another teacher tab, assign a draft exam to the shared class.
3. Expected:
- Teacher exams page refreshes automatically.
- Class list and class detail pages update without manual refresh.

### Exam published

1. Keep the teacher dashboard, class detail, and student home pages open.
2. Publish the assigned exam.
3. Expected:
- Teacher dashboard updates.
- Teacher class detail updates.
- Student home and `/student/my-exams` show the exam as available or live.

### Attempt started

1. Student opens `/student/exams/:id` and starts the exam.
2. Expected:
- Teacher class detail and evaluation views refresh automatically.
- Student home and `/student/my-exams` move the exam into the live state.

### Attempt submitted

1. Student submits the attempt.
2. Expected:
- Teacher evaluation screen refreshes automatically.
- Student home and `/student/my-exams` move the exam out of live state.

### Attempt reviewed

1. Teacher reviews the submitted attempt.
2. Expected:
- Teacher evaluation screen refreshes automatically.
- Student home and `/student/my-exams` show the completed item with updated review state.

### Integrity event

1. Student starts an exam.
2. Trigger an integrity event such as tab switch or fullscreen exit.
3. Expected:
- Teacher class detail refreshes automatically and shows updated integrity signals.

## Question Bank Stream

### My bank changes

1. Open `/question-bank` and a specific owned question bank detail page.
2. Create, update, or delete a question in that bank.
3. Expected:
- The list page refreshes automatically.
- The detail page refreshes automatically for the matching bank.
- `/create-exam` refreshes question bank options automatically.

### Public bank changes

1. Make a public question bank change as a teacher.
2. Keep another teacher session open on `/question-bank` and `/create-exam`.
3. Expected:
- Public question bank list updates automatically.
- Create exam bank/question options update automatically.

## Known Notes

- On `localhost` development, the client intentionally stops retrying after certain 5xx SSE failures and logs a warning instead of looping forever.
- `/student/my-exams` is now wired to live student exam data and should be included in regression checks.
