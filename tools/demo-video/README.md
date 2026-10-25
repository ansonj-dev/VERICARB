# Narrated demo recording

The recorder drives real UI interactions in Chromium at 1600 x 900, generates a chaptered MP4 with local English text-to-speech narration, and exports optional captions and a separate audio track.

Outputs are generated under the ignored `data/demo-video/` directory. They include `VERICARB-complete-demo.mp4`, `VERICARB-narration.m4a`, `VERICARB-demo.srt`, `WALKTHROUGH.md`, screenshots, and sample files.

## Isolation and safety

Use a dedicated server at `http://127.0.0.1:8001` with a separate database under `data/demo-video/workspace/`. Explicitly set empty values for all X1 private keys and the contract address before importing the application. An empty PowerShell environment assignment is not sufficient on older PowerShell versions because it removes the variable; set these values inside the Python process before importing the app.

The recorder refuses a server with configured signers or a contract. It resets its isolated server's demo fixtures before each run. Never point it at the live demo database. Local issue, transfer, retirement, review, upload, import, and report actions modify only the isolated recording data. No chain transactions are broadcast.

## Tools

- Node.js and Playwright Chromium
- FFmpeg and FFprobe on PATH
- Windows PowerShell with `System.Speech` and the Microsoft Zira Desktop voice
- The application's configured Python environment for the isolated server

## Recording

From the project root, after starting the isolated server:

```powershell
npm install --prefix tools/demo-video
node tools/demo-video/node_modules/playwright/cli.js install chromium
node tools/demo-video/record-demo.cjs --prepare
& ./tools/demo-video/narrate.ps1 -Manifest ./data/demo-video/scenes.json -OutputDirectory ./data/demo-video/narration
node tools/demo-video/record-demo.cjs --dry-run
node tools/demo-video/record-demo.cjs
```

The complete walkthrough covers all workspace pages and the public record. It honestly explains the current shared demo account's unavailable evidence-assessment selection rather than claiming that an assessment ran. Sample records are fictional, scores are provisional, and traceability is not certification.

Narration follows each chapter's start time. Sentence captions use approximate proportional timing, so they are useful captions rather than word-accurate transcription. Chapter times and narration timing are written to `timeline.json` after every completed scene. Raw recordings are retained for recovery.