/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * the plugin (defined in `plugin.tsx`) has many dependencies that can be loaded only when the app is being used.
 * By loading these later we can reduce the initial bundle size and allow users to delay loading these dependencies until they are needed.
 */

import { renderApp, renderAppOld } from './app';

import { createStore, createInitialState } from './common/store';
// TODO: [1101] remove renderAppOld when all sections migrated
export { renderApp, renderAppOld, createStore, createInitialState };
