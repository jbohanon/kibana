/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const retry = getService('retry');
  const PageObjects = getPageObjects(['canvas', 'common', 'header', 'visualize']);
  const esArchiver = getService('esArchiver');
  const testSubjects = getService('testSubjects');
  const dashboardAddPanel = getService('dashboardAddPanel');
  const dashboardPanelActions = getService('dashboardPanelActions');
  const archives = {
    es: 'test/functional/fixtures/es_archiver/dashboard/current/kibana',
  };

  describe('visualization in canvas', function () {
    before(async () => {
      await esArchiver.load(archives.es);
      // open canvas home
      await PageObjects.common.navigateToApp('canvas');
      // create new workpad
      await PageObjects.canvas.createNewWorkpad();
      await PageObjects.canvas.setWorkpadName('visualization tests');
    });

    after(async () => {
      await esArchiver.unload(archives.es);
    });

    describe('by-reference', () => {
      it('adds existing visualize embeddable from the visualize library', async () => {
        await PageObjects.canvas.clickAddFromLibrary();
        await dashboardAddPanel.addVisualization('Rendering-Test: metric');
        await testSubjects.existOrFail('embeddablePanelHeading-RenderingTest:metric');
      });

      it('edits visualize by-reference embeddable', async () => {
        await dashboardPanelActions.editPanelByTitle('Rendering Test: metric');
        await PageObjects.visualize.saveVisualization('Rendering Test: metric v2', {
          saveAsNew: false,
          redirectToOrigin: true,
        });
        await testSubjects.existOrFail('embeddablePanelHeading-RenderingTest:metricv2');
        await PageObjects.canvas.deleteSelectedElement();
      });
    });

    describe('by-value', () => {
      it('creates new tsvb embeddable', async () => {
        const originalEmbeddableCount = await PageObjects.canvas.getEmbeddableCount();
        await PageObjects.canvas.createNewVis('metrics');
        await PageObjects.visualize.saveVisualizationAndReturn();
        await retry.try(async () => {
          const embeddableCount = await PageObjects.canvas.getEmbeddableCount();
          expect(embeddableCount).to.eql(originalEmbeddableCount + 1);
        });
      });

      it('edits tsvb by-value embeddable', async () => {
        const originalEmbeddableCount = await PageObjects.canvas.getEmbeddableCount();
        await dashboardPanelActions.toggleContextMenu();
        await dashboardPanelActions.clickEdit();
        await PageObjects.visualize.saveVisualizationAndReturn();
        await retry.try(async () => {
          const embeddableCount = await PageObjects.canvas.getEmbeddableCount();
          expect(embeddableCount).to.eql(originalEmbeddableCount);
        });
        await PageObjects.canvas.deleteSelectedElement();
      });

      it('creates new vega embeddable', async () => {
        const originalEmbeddableCount = await PageObjects.canvas.getEmbeddableCount();
        await PageObjects.canvas.createNewVis('vega');
        await PageObjects.visualize.saveVisualizationAndReturn();
        await retry.try(async () => {
          const embeddableCount = await PageObjects.canvas.getEmbeddableCount();
          expect(embeddableCount).to.eql(originalEmbeddableCount + 1);
        });
      });

      it('edits vega by-value embeddable', async () => {
        const originalEmbeddableCount = await PageObjects.canvas.getEmbeddableCount();
        await dashboardPanelActions.toggleContextMenu();
        await dashboardPanelActions.clickEdit();
        await PageObjects.visualize.saveVisualizationAndReturn();
        await retry.try(async () => {
          const embeddableCount = await PageObjects.canvas.getEmbeddableCount();
          expect(embeddableCount).to.eql(originalEmbeddableCount);
        });
      });
    });
  });
}
