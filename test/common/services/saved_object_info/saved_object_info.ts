/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Client } from '@elastic/elasticsearch';
import url from 'url';
import { Either, fromNullable, chain, getOrElse, toError } from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import { ToolingLog } from '@kbn/dev-utils';
import { FtrService } from '../../ftr_provider_context';
import { format } from './utils';

const pluck = (key: string) => (obj: any): Either<Error, string> =>
  fromNullable(new Error(`Missing ${key}`))(obj[key]);

/*
In Dev Tools (not filtered):
GET _search
{
  "size": 0,
  "aggs": {
    "savedobjs": {
      "terms": {
        "field": "type"
      }
    }
  }
}
 */

/*
In Dev Tools (filtered):
GET _search
{
  "query": {
    "bool": {
      "should": [
        {
          "match_phrase": {
            "type": "config"
          }
        },
        {
          "match_phrase": {
            "type": "space"
          }
        }
      ],
      "minimum_should_match": 1
    }
  },
  "size": 0,
  "aggs": {
    "savedobjs": {
      "terms": {
        "field": "type"
      }
    }
  }
}
 */
const query = {
  aggs: {
    savedobjs: {
      terms: {
        field: 'type',
      },
    },
  },
};

export const types = (node: string) => (typeList: any = null) => async (
  index: string = '.kibana'
) =>
  await pipe(
    TE.tryCatch(
      async () => {
        const { body } = await new Client({ node }).search({
          index,
          size: 0,
          body: query,
        });
        return body;
      },
      (reason: any) => toError(reason)
    ),
    TE.map((resp: any) =>
      flow(
        pluck('aggregations'),
        chain(pluck('savedobjs')),
        chain(pluck('buckets')),
        getOrElse((err: Error) => err.message)
      )(resp)
    ),
    TE.fold((x) => T.of(`Error while searching for saved object types: ${x}`), T.of)
  )();

export class SavedObjectInfoService extends FtrService {
  private readonly config = this.ctx.getService('config');

  public async logSoTypes(log: ToolingLog, msg: string | null = null) {
    const print = (xs: any) =>
      log.info(`\n### Saved Object Types ${msg || 'Count: ' + xs.length}\n${format(xs)}`);

    pipe(await types(url.format(this.config.get('servers.elasticsearch'))), print);
  }
}
