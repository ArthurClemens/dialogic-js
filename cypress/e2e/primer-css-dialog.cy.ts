/// <reference types="cypress" />

import {
  ensureInteractionPossible,
  Opts,
  verifyClosedState,
  verifyInitialState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/primer-css-dialog.html';

describe('PrimerCSS dialog', () => {
  const selector = 'details';
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

  it('Closing using the close button should not immediately be possible', () => {
    openDialog();
    cy.get(`${selector} button[aria-label="Close dialog"]`).click();
    verifyOpenedState(selector, opts);
  });

  it('Closing using the close button should be possible after lock duration', () => {
    openDialog();
    ensureInteractionPossible(selector, opts);
    cy.get(`${selector} button[aria-label="Close dialog"]`).click();
    verifyClosedState(selector, opts);
  });
});
