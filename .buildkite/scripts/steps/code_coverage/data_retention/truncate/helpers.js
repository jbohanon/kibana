/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import readline from 'readline';
import { createReadStream, statSync } from 'fs';
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import execa from 'execa';
import { resolve } from 'path';

const ROOT_DIR = resolve(__dirname, '../../../../../..');

export const dirLine$ = (x) => {
  const rl = readline.createInterface({ input: createReadStream(x) });
  return fromEvent(rl, 'line').pipe(takeUntil(fromEvent(rl, 'close')));
};

export const pathExists = (x) => {
  let res;
  try {
    statSync(x);
    res = true;
  } catch (e) {
    res = false;
  }
  return res;
};

export const rmCloudDir = (bucket) => (log) => async (x) => {
  log.verbose(`\n### bucket: \n\t${bucket}`);
  log.info('\n### Rm: ', x);

  const params = [
    '-m',
    'rm',
    '-r',
    `${bucket}${x}`, // eg. gs://elastic-bekitzur-kibana-coverage-live/2020-03-11T00:06:07Z
    '&',
  ];

  const { stdout } = await execa('gsutil', params, { cwd: ROOT_DIR });

  console.log(`\n### stdout: \n\t${stdout}`);
};
