import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/047_shopify_connector_foundation.sql", import.meta.url),
  "utf8",
);
const repository = readFileSync(
  new URL("../../lib/shopify/repository.ts", import.meta.url),
  "utf8",
);
const worker = readFileSync(
  new URL("../../lib/shopify/worker.ts", import.meta.url),
  "utf8",
);
const workerRoute = readFileSync(
  new URL("../../app/api/integrations/shopify/worker/route.ts", import.meta.url),
  "utf8",
);
const config = readFileSync(
  new URL("../../lib/shopify/config.ts", import.meta.url),
  "utf8",
);

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

const claimFunction = between(
  migration,
  "create or replace function public.claim_shopify_connector_jobs(",
  "create or replace function public.complete_shopify_connector_job(",
);
const completionFunction = between(
  migration,
  "create or replace function public.complete_shopify_connector_job(",
  "create or replace function public.upsert_shopify_catalogue_item(",
);

test("development claims cannot select staging or production jobs", () => {
  assert.match(claimFunction, /where job\.environment = target_environment\s+and job\.status/);
});

test("staging lease recovery cannot mutate an expired production lease", () => {
  const recovery = between(
    claimFunction,
    "update public.shopify_connector_jobs",
    "return query",
  );
  assert.match(recovery, /where status = 'processing'\s+and environment = target_environment/);
});

test("production claims cannot select development jobs", () => {
  assert.match(
    claimFunction,
    /candidates as \([\s\S]*where job\.environment = target_environment[\s\S]*for update of job skip locked/,
  );
});

test("matching-environment claim reaches the final guarded update", () => {
  assert.match(
    claimFunction,
    /where job\.id = candidates\.id\s+and job\.environment = target_environment\s+returning job\.\*/,
  );
});

test("a development worker cannot complete a production job", () => {
  assert.match(
    completionFunction,
    /where id = target_job_id\s+and environment = target_environment\s+and status = 'processing'/,
  );
});

test("matching-environment completion retains lock-owner validation", () => {
  assert.match(
    completionFunction,
    /and environment = target_environment\s+and status = 'processing'\s+and locked_by = btrim\(worker_identifier\)/,
  );
});

test("claim and completion reject invalid environments", () => {
  const validation = /target_environment not in \('development', 'staging', 'production'\)/;
  assert.match(claimFunction, validation);
  assert.match(completionFunction, validation);
});

test("worker route uses trusted configured environment rather than request input", () => {
  assert.match(worker, /const environment = getShopifyWorkerEnvironment\(\)/);
  assert.match(worker, /claimConnectorJobs\(\s*environment,/);
  assert.match(worker, /completeConnectorJob\(\{\s*environment,/);
  assert.doesNotMatch(workerRoute, /request\.(json|text|formData)\(/);
  assert.match(config, /throw new Error\("shopify_worker_environment_not_configured"\)/);
});

test("repository sends environment to both service-role RPCs", () => {
  assert.match(
    repository,
    /rpc\("claim_shopify_connector_jobs", \{\s*target_environment: environment,/,
  );
  assert.match(
    repository,
    /rpc\("complete_shopify_connector_job", \{\s*target_environment: input\.environment,/,
  );
});

test("old unsafe worker RPC signatures are absent", () => {
  assert.doesNotMatch(
    migration,
    /claim_shopify_connector_jobs\(text, integer\)/,
  );
  assert.doesNotMatch(
    migration,
    /complete_shopify_connector_job\(uuid, text, text, timestamptz, text\)/,
  );
  assert.match(
    migration,
    /grant execute on function public\.claim_shopify_connector_jobs\(text, text, integer\)\s+to service_role/,
  );
  assert.match(
    migration,
    /grant execute on function public\.complete_shopify_connector_job\(text, uuid, text, text, timestamptz, text\)\s+to service_role/,
  );
});
