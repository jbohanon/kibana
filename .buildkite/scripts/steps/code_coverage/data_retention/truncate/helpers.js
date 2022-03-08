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
