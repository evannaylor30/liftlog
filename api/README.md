# API

Serverless functions for protected data access live here.

Guideline:
- verify Supabase auth token
- use Prisma for database queries
- return typed JSON payloads

Current endpoints:
- `POST /api/profile/bootstrap` creates or updates the signed-in user's profile row.
- `GET /api/workouts` lists the signed-in user's workout sessions.
- `POST /api/workouts` creates a workout session for the signed-in user.
- `DELETE /api/session/:id` deletes one workout session (and its exercises/sets) for the signed-in user.
- `POST /api/create-workout-exercise` adds an exercise to a workout (`body`: `{ workoutId, name }`).
- `POST /api/workout-exercises/:workoutExerciseId/sets` adds one set (reps + lb input, stored as kg).
- `GET /api/bodyweight` lists recent bodyweight logs for the signed-in user. Optional query: `take` (default 30, max 400).
- `POST /api/bodyweight` creates or updates one bodyweight log for the date (lb input, stored as kg).
- `DELETE /api/bodyweight/:id` deletes one weigh-in for the signed-in user.
- `GET /api/steps` lists recent daily steps logs for the signed-in user. Optional query: `take` (default 30, max 400).
- `POST /api/steps` creates or updates one daily steps log.
- `GET /api/dashboard` returns dashboard totals plus bodyweight and steps 7-day average trends.
