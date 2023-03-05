/// <reference types="cypress" />

import {
  ensureInteractionPossible,
  Opts,
  verifyClosedState,
  verifyInitialState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/base-details-tests.html';

describe('Details tests', () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  describe('Details dialog', () => {
    const selector = '#dialog';
    const openDialog = () => {
      cy.contains('Open dialog').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Should have inited the dialog', () => {
      verifyInitialState(selector, opts);
    });

    it('Opens the dialog', () => {
      openDialog();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openDialog();
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyClosedState(selector, opts);
    });
  });

  describe('Details menu', () => {
    const selector = '#menu';
    const openMenu = () => {
      cy.contains('Open menu').click();
    };
    const opts = {};

    it('Should have inited the menu', () => {
      verifyInitialState(selector, opts);
    });

    it('Opens the menu', () => {
      openMenu();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openMenu();
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openMenu();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyClosedState(selector, opts);
    });
  });
});
