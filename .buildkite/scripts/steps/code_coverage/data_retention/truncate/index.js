/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { run, createFlagError } from '@kbn/dev-utils';
import { resolve } from 'path';
import { pathExists, dirLine$, rmCloudDir } from './helpers';

const flagList = ['bucket', 'dirs_file'];
const flags = {
  string: flagList,
  help: `
--bucket       Required, bucket in gcs, eg. gs://elastic-bekitzur-kibana-coverage-live/
--dirs_file    Required, file path with new line delimited list of dirs, eg. 2020-12-31T18:16:00Z
        `,
};
export function runTruncateData() {
  run(
    ({ flags, log }) => {
      guard(flagList, flags);

      const root = resolve(__dirname, '../../../../..');
      const resolveRoot = resolve.bind(null, root);
      const dirsFilePath = resolveRoot(flags.dirs_file);
      const processGcsBucket = process.bind(null, flags.bucket, log);

      const check = (x) => {
        if (pathExists(x)) processGcsBucket(x);
        else log.error(`### DOES NOT EXIST: ${x}`);
      };

      check(dirsFilePath);
    },
    {
      description: `

blah

      `,
      flags,
    }
  );
}

function process(bucket, log, x) {
  const rmFromBucket = rmCloudDir(bucket)(log);
  dirLine$(x).subscribe(
    (x) => rmFromBucket(x),
    (x) => log.error(`\n### err: \n\t${x}`),
    () => log.info(`\n### Finished truncating data in bucket: \n\t${bucket}`)
  );
}

function guard(flagList, flags) {
  flagList.forEach((x) => {
    if (flags[x] === '') throw createFlagError(`please provide a single --${x} flag`);
  });
}
