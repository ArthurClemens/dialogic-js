/// <reference types="cypress" />

import {
  ensureInteractionPossible,
  Opts,
  verifyClosedState,
  verifyInitialState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/pico-dialog.html';

describe('Pico dialog', () => {
  describe('Override pointer events', () => {
    const selector = '#override-pointer';
    const openDialog = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
      contentDisplay: 'flex',
    };

    beforeEach(() => {
      cy.visit(TEST_URL);
    });

    it('Should have inited the dialog', () => {
      verifyInitialState(selector, opts);
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openDialog();
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyClosedState(selector, opts);
    });

    it('Closing using the cancel button should not immediately be possible', () => {
      openDialog();
      cy.get(selector).contains('Cancel').click();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the cancel button should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(selector).contains('Cancel').click();
      verifyClosedState(selector, opts);
    });
  });

  describe('Original order', () => {
    const selector = '#original';
    const openDialog = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
      isTouch: false,
      contentDisplay: 'flex',
    };

    beforeEach(() => {
      cy.visit(TEST_URL);
    });

    it('Should have inited the dialog', () => {
      verifyInitialState(selector, opts);
    });

    it('Closing using the cancel button should not immediately be possible', () => {
      openDialog();
      cy.get(selector).contains('Cancel').click();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the cancel button should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(selector).contains('Cancel').click();
      verifyClosedState(selector, opts);
    });
  });

  describe('Swapped order', () => {
    const selector = '#swapped-order';
    const openDialog = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
      contentDisplay: 'flex',
    };

    beforeEach(() => {
      cy.visit(TEST_URL);
    });

    it('Should have inited the dialog', () => {
      verifyInitialState(selector, opts);
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openDialog();
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyClosedState(selector, opts);
    });

    it('Closing using the cancel button should not immediately be possible', () => {
      openDialog();
      cy.get(selector).contains('Cancel').click();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the cancel button should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(selector).contains('Cancel').click();
      verifyClosedState(selector, opts);
    });
  });
});
