# Video demo

The project includes a short Remotion demo video for launch posts.

- Output: `demos/intentfile-goal-demo.mp4`
- Poster: `demos/intentfile-goal-demo-poster.png`
- Source: `apps/video/src/IntentfileGoalVideo.tsx`
- Composition id: `IntentfileGoal`
- Format: 1920x1080, 30 fps, 36 seconds

## Story

The video is intentionally narrow:

```txt
/goal keeps Codex moving.
intentfile defines done.
```

Scene flow:

1. Codex `/goal` needs a definition of done.
2. Vague prompts become intent contracts.
3. `task.intent.yaml` defines objective, constraints, acceptance, and proof.
4. The intent CLI gives agents commands for briefs, goals, and proof.
5. The agent loop continues until proof exists.
6. The closing frame points to `intentfile.run`.

## Render

```bash
npm install
npm run render:video
```

That writes:

```txt
demos/intentfile-goal-demo.mp4
```

## Edit

Open the source file:

```txt
apps/video/src/IntentfileGoalVideo.tsx
```

Use Remotion Studio for interactive editing:

```bash
npm run studio -w apps/video
```

After editing, run:

```bash
npm run typecheck -w apps/video
npm run render:video
```

If the render output changes, regenerate the poster frame:

```bash
ffmpeg -y -ss 00:00:25 -i demos/intentfile-goal-demo.mp4 -frames:v 1 demos/intentfile-goal-demo-poster.png
```
