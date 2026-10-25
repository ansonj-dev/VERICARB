const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'data/demo-video');
const audioDirectory = path.join(output, 'narration');
const base = 'http://127.0.0.1:8001';
const dryRun = process.argv.includes('--dry-run');
const projectName = 'Demo Video - Green Valley Restoration';
const serial = 'DEMO-VIDEO-2026-001';
let projectId;
let batchId;
let evidenceId;

function command(executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${executable}: ${result.error?.message || result.stderr || result.stdout}`);
  return result.stdout.trim();
}

async function click(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const bounds = await locator.boundingBox();
  if (bounds) await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { steps: dryRun ? 1 : 12 });
  await locator.click();
}

async function route(page, name) {
  await page.evaluate((name) => { location.hash = `#/${name}`; }, name);
  await page.locator('#page-content:not([aria-busy]) h1').first().waitFor();
  await page.waitForTimeout(dryRun ? 120 : 500);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function mutation(page, urlPart, action) {
  const responsePromise = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().includes(urlPart), { timeout: 30000 });
  await action();
  const response = await responsePromise;
  const result = await response.json();
  if (!response.ok()) throw new Error(`Demo step failed: ${response.status()} ${JSON.stringify(result)}`);
  await page.waitForTimeout(dryRun ? 200 : 900);
  return result;
}

async function modalSubmit(page, urlPart, reason) {
  await page.locator('#modal-reason').fill(reason);
  return mutation(page, urlPart, () => click(page, page.locator('button[type="submit"][form="modal-form"]')));
}

const scenes = [
  {
    id: '01-introduction', title: 'Platform overview',
    narration: 'Welcome to VERICARB, a climate integrity prototype. This walkthrough follows a fictional project from registration through evidence, review, and credit history. We will also visit every workspace page. All sample records are demonstrations, not certified carbon credits. This recording uses a separate local database, with blockchain signing disabled.',
    action: async (page) => { await page.goto(`${base}/index.html`); await page.locator('h1').first().waitFor(); },
  },
  {
    id: '02-login', title: 'Sign in with the test account',
    narration: 'The sign in page provides a shared test account. The popup displays an email address and password, with copy controls. Choose Use test account to fill the form, then sign in. There is no need to register for this demonstration. The shared account should only contain fictional, non-sensitive information.',
    action: async (page) => {
      await page.goto(`${base}/auth.html`);
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(dryRun ? 50 : 1800);
      await click(page, page.getByRole('button', { name: 'Use test account', exact: true }));
      await click(page, page.locator('#auth-submit'));
      await page.getByRole('heading', { name: 'Workspace overview', exact: true }).waitFor();
    },
  },
  {
    id: '03-dashboard', title: 'Dashboard and next actions',
    narration: 'The dashboard brings together project counts, available credits, recorded retirements, and open review items. Needs Attention highlights work that requires a person. Recent Activity preserves the audit trail. Lower down, credit bars use stored batch balances, and project locations use supplied metadata. Neither display proves an environmental outcome.',
    action: async (page) => { await route(page, 'dashboard'); await page.locator('.dash-grid').scrollIntoViewIfNeeded(); await page.waitForTimeout(dryRun ? 50 : 2500); await page.evaluate(() => scrollTo(0, 0)); },
  },
  {
    id: '04-new-project', title: 'Create a fictional project',
    narration: 'Projects is the starting point for project records. Here we add Green Valley Restoration, a fictional forest project in Kenya. We supply a region, methodology reference, vintage dates, and a baseline summary. Saving creates a database draft and an audit event. Registration by itself is not certification or proof of carbon removal.',
    action: async (page) => {
      await route(page, 'projects');
      await click(page, page.getByRole('link', { name: 'New Project', exact: false }));
      await page.locator('#project-name').fill(projectName);
      await page.locator('#project-type').selectOption({ label: 'Forest conservation' });
      await page.locator('#project-country').fill('Kenya');
      await page.locator('#project-region').fill('Fictional Green Valley');
      await page.locator('#project-method').fill('DEMO-RESTORATION-2026');
      await page.locator('#project-vintage-start').fill('2026-01-01');
      await page.locator('#project-vintage-end').fill('2026-12-31');
      await page.locator('#project-description').fill('Fictional restoration project for the narrated product demo. No environmental claim or certification is made.');
      const result = await mutation(page, '/api/projects', () => click(page, page.getByRole('button', { name: 'Save local draft', exact: true })));
      projectId = result.id;
      await page.getByRole('heading', { name: projectName, exact: true }).waitFor();
    },
  },
  {
    id: '05-passport', title: 'Inspect the project passport',
    narration: 'The project passport keeps the record identity, location, methodology, vintage, and registry references together. Its tabs separate evidence, monitoring, credit batches, and history. Missing connections remain visible instead of being presented as verified. Register on X1 is disabled in this isolated recording because no signer or contract is configured.',
    action: async (page) => { await route(page, `project/${projectId}`); await click(page, page.getByRole('button', { name: 'History', exact: true })); await page.waitForTimeout(dryRun ? 50 : 1800); await click(page, page.getByRole('button', { name: 'Overview', exact: true })); },
  },
  {
    id: '06-evidence', title: 'Upload sample evidence',
    narration: 'The Evidence Library attaches files to a selected project. We upload a harmless text document marked as synthetic. The API stores its bytes off chain and calculates a SHA 256 digest. The digest helps identify whether file bytes match later. It does not prove that the document is truthful or that a project is valid.',
    action: async (page) => {
      await route(page, 'evidence');
      await page.locator('#evidence-project').selectOption(projectId);
      const result = await mutation(page, `/api/projects/${projectId}/evidence`, () => page.locator('#evidence-files').setInputFiles(path.join(output, 'sample-evidence.txt')));
      evidenceId = result.id;
      await page.getByText('sample-evidence.txt', { exact: true }).first().waitFor();
      await page.locator('.data-table').scrollIntoViewIfNeeded();
    },
  },
  {
    id: '07-assessment', title: 'Assessment controls and current limitation',
    narration: 'Verification and Review separates automated checks from human decisions. In the current shared demo account, the uploaded sample is not offered by the assessment selector, so that assessment cannot be completed in this run. This is a current interface limitation. No AI provider is configured. The planned rule based findings remain advisory and are not a certification.',
    action: async (page) => {
      await route(page, 'verification');
      await page.locator('#assessment-evidence').focus();
      await page.locator('#assessment-results').scrollIntoViewIfNeeded();
    },
  },
  {
    id: '08-batch-draft', title: 'Create a draft credit batch',
    narration: 'Carbon Credits lists batches with their serials, quantities, available balances, lifecycle states, and provisional scores. We create a draft for the new project using a unique demo serial and one hundred thousand kilograms of carbon dioxide equivalent, or one hundred tonnes. A draft is not issued credit and has no spendable available balance.',
    action: async (page) => {
      await route(page, 'credits');
      await click(page, page.getByRole('button', { name: 'Add demo batch', exact: false }));
      await page.locator('#modal-project').selectOption(projectId);
      await page.locator('#modal-serial').fill(serial);
      await page.locator('#modal-quantityKg').fill('100000');
      await page.locator('#modal-vintage').fill('2026');
      const result = await mutation(page, `/api/projects/${projectId}/batches`, () => click(page, page.locator('button[form="modal-form"]')));
      batchId = result.id;
      await route(page, `credit/${batchId}`);
    },
  },
  {
    id: '09-submit-review', title: 'Submit the batch for human review',
    narration: 'A credit passport shows batch identity, quantities, evidence coverage, the provisional integrity score, and lifecycle history. We submit the draft for review and add a reason. This creates a review item rather than bypassing the workflow. Previous states and events remain available for later inspection.',
    action: async (page) => {
      await click(page, page.getByRole('button', { name: 'Submit for review', exact: true }));
      await modalSubmit(page, `/api/batches/${batchId}/submit`, 'Submitted for an isolated fictional product walkthrough.');
      await page.getByRole('button', { name: 'Submit for review', exact: true }).waitFor({ state: 'hidden' });
    },
  },
  {
    id: '10-review-decision', title: 'Record a reviewer decision',
    narration: 'Back in the review queue, the authorized demo reviewer can approve a step, request additional evidence, or reject evidence. We approve this fictional batch for the next step and record a reason. Approval here is a local workflow decision. It is not an independent environmental certification, and the reason becomes part of the audit history.',
    action: async (page) => {
      await route(page, 'verification');
      const card = page.locator('.alert-card').filter({ hasText: batchId });
      await click(page, card.getByRole('button', { name: 'Approve review step', exact: true }));
      await modalSubmit(page, `/api/batches/${batchId}/review`, 'Fictional sample reviewed for the isolated narrated demo; not a certification.');
    },
  },
  {
    id: '11-local-issuance', title: 'Issue locally without a chain transaction',
    narration: 'The reviewed batch can now be issued in local demo mode. This recording has no contract address or signing keys, so the action records a local issuance only. No blockchain transaction is broadcast. In a separately configured X1 testnet deployment, chain actions require the appropriate signer and confirmed receipt and state checks.',
    action: async (page) => {
      await route(page, `credit/${batchId}`);
      await click(page, page.getByRole('button', { name: 'Issue local demo batch', exact: true }));
      await modalSubmit(page, `/api/batches/${batchId}/issue`, 'Local issuance for video demonstration only. No external credit or blockchain claim.');
      await page.getByRole('button', { name: 'Retire', exact: true }).waitFor();
    },
  },
  {
    id: '12-retirement', title: 'Record a local retirement',
    narration: 'We record a ten tonne retirement from the available balance, with an explicit reason. The available amount decreases and the retirement history increases. This prototype action is a local database event, not an external registry retirement. The original batch and earlier events are retained instead of being overwritten.',
    action: async (page) => {
      await click(page, page.getByRole('button', { name: 'Retire', exact: true }));
      await page.locator('#modal-quantityKg').fill('10000');
      await modalSubmit(page, `/api/batches/${batchId}/retire`, 'Ten tonne local demonstration retirement. Not an external registry claim.');
      await page.locator('.detail-fields').first().scrollIntoViewIfNeeded();
    },
  },
  {
    id: '13-transfer', title: 'Record a local transfer',
    narration: 'Transfer follows a similar controlled process. We record five tonnes against a fictional recipient reference and add an audit note. The application checks that an active batch has enough available balance. Again, this is a local record, not a wallet transfer. The remaining balance and the event history make the change inspectable.',
    action: async (page) => {
      await page.evaluate(() => scrollTo(0, 0));
      await click(page, page.getByRole('button', { name: 'Transfer', exact: true }));
      await page.locator('#modal-quantityKg').fill('5000');
      await page.locator('#modal-recipient').fill('Fictional demo partner');
      await modalSubmit(page, `/api/batches/${batchId}/transfer`, 'Five tonne local transfer record for the narrated walkthrough only.');
    },
  },
  {
    id: '14-monitoring', title: 'Monitoring and synthetic observations',
    narration: 'Monitoring shows environmental observations and their review states. The demonstration control adds a synthetic disturbance to the seeded forest project. It is not a satellite feed or a confirmed loss event. Signals help direct human attention; they do not automatically establish a reversal, erase history, or invalidate recorded retirements.',
    action: async (page) => {
      await route(page, 'monitoring');
      await mutation(page, '/evaluate', () => click(page, page.getByRole('button', { name: 'Trigger demo disturbance', exact: false })));
      await page.locator('.source-list').scrollIntoViewIfNeeded();
    },
  },
  {
    id: '15-alerts', title: 'Review alerts without erasing the signal',
    narration: 'Alerts brings reviewable signals into one place. An authorized reviewer can confirm, reject, or ask for more evidence. In this example we request more evidence instead of claiming a real reversal. The source observation and previous history are preserved. Filtering distinguishes open and reviewed items so the next action remains visible.',
    action: async (page) => {
      await route(page, 'alerts');
      await click(page, page.getByRole('button', { name: 'Request more evidence', exact: true }).first());
      await modalSubmit(page, '/api/alerts/', 'Synthetic signal only. Additional independent evidence would be required.');
    },
  },
  {
    id: '16-registry-conflicts', title: 'Import sample registry records',
    narration: 'Registry Conflicts compares the records available to this workspace. We import a small fictional CSV with a repeated serial across two sample sources. Exact duplicate serials are flagged as potential conflicts for review. Coverage is limited to imported rows; this is not a search of every registry, and a match is not an automatic fraud finding.',
    action: async (page) => {
      await route(page, 'conflicts');
      await mutation(page, '/api/registry/import', () => page.locator('#registry-file').setInputFiles(path.join(output, 'sample-registry.csv')));
      await page.locator('.data-table').scrollIntoViewIfNeeded();
    },
  },
  {
    id: '17-reports', title: 'Export reports',
    narration: 'Reports exports the records already held by the workspace. Available packages cover project metadata, evidence hashes, credit events, registry conflicts, monitoring, and an impact summary. We download the project data report as a CSV. These are transparent data exports, not compliance certificates or third party verification reports.',
    action: async (page) => {
      await route(page, 'reports');
      const downloadPromise = page.waitForEvent('download');
      await click(page, page.locator('[data-action="export-report"][data-type="projects"]'));
      const download = await downloadPromise;
      await download.saveAs(path.join(output, 'sample-project-report.csv'));
    },
  },
  {
    id: '18-public-explorer', title: 'Find a batch in the public explorer',
    narration: 'The Public Explorer searches available batch identifiers and serial references. We search for the batch created in this recording, then open its public view. The search is limited to records in this application. It does not imply that every external registry or carbon-credit marketplace has been checked.',
    action: async (page) => {
      await route(page, 'explorer');
      await page.locator('#explorer-query').fill(serial);
      await click(page, page.locator('#explorer-form button[type="submit"]'));
      await page.locator('#explorer-results .file-row').waitFor();
    },
  },
  {
    id: '19-public-record', title: 'Inspect the public-safe record',
    narration: 'The public record presents batch identity, project metadata, balances, evidence hashes, and event history. It does not expose original evidence files or private reviewer notes. Here you can see the local retirement and transfer history from our sample workflow. No chain confirmation is invented when a chain operation was not performed.',
    action: async (page) => {
      await click(page, page.locator('#explorer-results a').first());
      await page.locator('#verify-content .verify-grid').waitFor();
      await page.evaluate(() => scrollTo(0, 300));
    },
  },
  {
    id: '20-settings', title: 'Profile, connections, and availability',
    narration: 'Settings shows the local profile and actual connection availability. For this recording, signing keys and the contract are deliberately disabled. Private keys are never displayed. The reset and sign out controls are separate from normal data entry. A production deployment would still need production identity, recovery, session controls, and a security review.',
    action: async (page) => { await page.goto(`${base}/app.html#/settings`); await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor(); await page.getByRole('heading', { name: 'Connections & availability', exact: true }).scrollIntoViewIfNeeded(); },
  },
  {
    id: '21-preview-pages', title: 'Marketplace and community previews',
    narration: 'Marketplace is explicitly a future area: the prototype does not list credits for sale, operate an order book, or process purchases. Community contains educational preview material about evidence, reviewers, and source coverage. These pages communicate product boundaries rather than pretending that unimplemented transactions or public messaging already exist.',
    action: async (page) => { await route(page, 'marketplace'); await page.waitForTimeout(dryRun ? 50 : 6000); await route(page, 'community'); },
  },
  {
    id: '22-summary', title: 'End-to-end recap',
    narration: 'We have created a fictional project, attached evidence, inspected the review controls and their current limitation, created and reviewed a batch, recorded local issuance, retirement and transfer, reviewed a synthetic alert, imported registry records, exported a report, and inspected a public record. VERICARB makes provenance and workflow history easier to inspect. Traceability is not certification: environmental claims still require reliable evidence, independent review, and appropriate real-world controls.',
    action: async (page) => { await route(page, 'dashboard'); },
  },
];

function prepare() {
  fs.mkdirSync(audioDirectory, { recursive: true });
  fs.writeFileSync(path.join(output, 'scenes.json'), JSON.stringify(scenes.map(({ id, title, narration }) => ({ id, title, narration })), null, 2));
  fs.writeFileSync(path.join(output, 'sample-evidence.txt'), 'FICTIONAL DEMO EVIDENCE - NOT CERTIFIED\nGreen Valley Restoration is a synthetic product demonstration.\nNo real land boundary, observation, removal, verification, or carbon credit claim is made.\n');
  const headers = 'source_name,external_project_id,external_project_name,external_serial,vintage_start,vintage_end,methodology_id,country,region,quantity_kg_co2e,status,source_timestamp,is_demo';
  const records = ['DEMO-VIDEO-SOURCE-A', 'DEMO-VIDEO-SOURCE-B'].map((source) => `${source},DEMO-VIDEO-REGISTRY-PROJECT,Fictional imported forest,DEMO-VIDEO-DUPLICATE,2026-01-01,2026-12-31,DEMO-METHOD,Kenya,Fictional Region,100000,active,2026-10-25T00:00:00Z,true`);
  fs.writeFileSync(path.join(output, 'sample-registry.csv'), `${headers}\n${records.join('\n')}\n`);
  fs.writeFileSync(path.join(output, 'WALKTHROUGH.md'), '# VERICARB narrated demo\n\nRecorded using fictional records in a separate local database. No blockchain transactions are broadcast. Narration uses the local Microsoft Zira text-to-speech voice.\n\n' + scenes.map((scene, index) => `## ${index + 1}. ${scene.title}\n\n${scene.narration}\n`).join('\n'));
}

function timestamp(seconds) {
  const milliseconds = Math.round(seconds * 1000);
  return `${String(Math.floor(milliseconds / 3600000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 60000) % 60).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')},${String(milliseconds % 1000).padStart(3, '0')}`;
}

async function main() {
  prepare();
  if (process.argv.includes('--prepare')) { console.log(`Prepared ${scenes.length} chapters in ${output}`); return; }
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', acceptDownloads: true, ...(dryRun ? {} : { recordVideo: { dir: path.join(output, 'raw'), size: { width: 1600, height: 900 } } }) });
  const demoAuth = await context.request.post(`${base}/api/auth/demo`);
  if (!demoAuth.ok()) throw new Error('The isolated recording server is not available.');
  const auth = await demoAuth.json();
  const authorization = { Authorization: `Bearer ${auth.access_token}` };
  const statusResponse = await context.request.get(`${base}/api/blockchain/status`, { headers: authorization });
  const status = await statusResponse.json();
  if (status.network?.contract_address || status.wallets?.some((wallet) => wallet.configured)) throw new Error('Refusing to record against a server with configured chain signers or a contract.');
  const reset = await context.request.post(`${base}/api/demo/reset`, { headers: authorization });
  if (!reset.ok()) throw new Error('Could not reset the isolated recording fixtures.');
  await context.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const overlay = document.createElement('div');
      overlay.id = 'recording-chapter';
      overlay.style.cssText = 'position:fixed;left:20px;bottom:18px;z-index:99999;max-width:calc(100% - 40px);padding:10px 16px;background:#17251ff0;color:white;border:1px solid #547766;border-radius:6px;font:600 14px sans-serif;pointer-events:none;box-shadow:0 4px 16px #0002';
      overlay.textContent = sessionStorage.getItem('recording-chapter') || 'VERICARB / NARRATED DEMO';
      document.body.appendChild(overlay);
    });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(45000);
  const timeline = [];
  const recordingStart = Date.now();
  let videoPath;
  try {
    for (const [index, scene] of scenes.entries()) {
      const start = (Date.now() - recordingStart) / 1000;
      console.log(`[${index + 1}/${scenes.length}] ${scene.title}`);
      const title = `${String(index + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}   ${scene.title}`;
      await page.evaluate((title) => { try { sessionStorage.setItem('recording-chapter', title); } catch {} const overlay = document.querySelector('#recording-chapter'); if (overlay) overlay.textContent = title; }, title);
      await scene.action(page);
      await page.evaluate((title) => { sessionStorage.setItem('recording-chapter', title); const overlay = document.querySelector('#recording-chapter'); if (overlay) overlay.textContent = title; }, title);
      const wav = path.join(audioDirectory, `${scene.id}.wav`);
      const duration = dryRun ? 0 : Number(command('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', wav]));
      if (!dryRun) await page.waitForTimeout(Math.max(1200, (duration + 1.4) * 1000 - (Date.now() - recordingStart - start * 1000)));
      timeline.push({ ...scene, action: undefined, start, end: (Date.now() - recordingStart) / 1000, audioDuration: duration, wav });
      fs.writeFileSync(path.join(output, dryRun ? 'dry-run.json' : 'timeline.json'), JSON.stringify(timeline, null, 2));
      await page.screenshot({ path: path.join(output, `${scene.id}.png`) });
    }
    if (!dryRun) videoPath = await page.video().path();
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'recording-error.png'), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(output, 'recording-error.txt'), `${error.stack}\nURL: ${page.url()}\n${await page.locator('body').innerText().catch(() => '')}`);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  fs.writeFileSync(path.join(output, dryRun ? 'dry-run.json' : 'timeline.json'), JSON.stringify(timeline, null, 2));
  if (dryRun) { console.log('Every walkthrough action passed. No video exported in dry-run mode.'); return; }
  const captions = [];
  for (const scene of timeline) {
    const sentences = scene.narration.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [scene.narration];
    let cursor = scene.start;
    const totalLength = sentences.reduce((total, sentence) => total + sentence.trim().length, 0);
    for (const sentence of sentences) {
      const duration = scene.audioDuration * sentence.trim().length / totalLength;
      captions.push(`${captions.length + 1}\n${timestamp(cursor)} --> ${timestamp(cursor + duration)}\n${sentence.trim()}\n`);
      cursor += duration;
    }
  }
  fs.writeFileSync(path.join(output, 'VERICARB-demo.srt'), captions.join('\n'));
  const metadata = ';FFMETADATA1\ntitle=VERICARB Complete Narrated Demo\ncomment=Fictional sample records. Separate local database. No chain transactions broadcast.\n' + timeline.map((scene) => `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(scene.start * 1000)}\nEND=${Math.round(scene.end * 1000)}\ntitle=${scene.title}\n`).join('');
  const metadataPath = path.join(output, 'chapters.ffmetadata');
  fs.writeFileSync(metadataPath, metadata);
  const inputs = timeline.flatMap((scene) => ['-i', scene.wav]);
  const filters = timeline.map((scene, index) => `[${index + 1}:a]adelay=${Math.round(scene.start * 1000)}:all=1[voice${index}]`);
  filters.push(timeline.map((_, index) => `[voice${index}]`).join('') + `amix=inputs=${timeline.length}:duration=longest:normalize=0,apad[narration]`);
  const videoOutput = path.join(output, 'VERICARB-complete-demo.mp4');
  console.log('Encoding narrated MP4 with chapter navigation and optional captions...');
  command('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'warning', '-i', videoPath, ...inputs, '-i', path.join(output, 'VERICARB-demo.srt'), '-i', metadataPath, '-filter_complex', filters.join(';'), '-map', '0:v:0', '-map', '[narration]', '-map', `${timeline.length + 1}:s:0`, '-map_metadata', String(timeline.length + 2), '-map_chapters', String(timeline.length + 2), '-c:v', 'libx264', '-preset', 'fast', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-c:s', 'mov_text', '-metadata:s:s:0', 'language=eng', '-movflags', '+faststart', '-t', String(timeline.at(-1).end), videoOutput]);
  const audioOutput = path.join(output, 'VERICARB-narration.m4a');
  command('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'warning', '-i', videoOutput, '-vn', '-sn', '-c:a', 'copy', audioOutput]);
  console.log(JSON.stringify({ video: videoOutput, audio: audioOutput, chapters: timeline.length, durationSeconds: timeline.at(-1).end }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });