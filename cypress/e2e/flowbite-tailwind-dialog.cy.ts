/// <reference types="cypress" />

import {
  ensureInteractionPossible,
  Opts,
  verifyClosedState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/flowbite-tailwind-dialog.html';

describe('Flowbite / Tailwind dialog', () => {
  const mainSelector = '#main';
  const confirmationSelector = '#confirmation';
  const openMainDialog = () => {
    cy.contains('Open main dialog').click();
  };
  const openConfirmationDialog = () => {
    cy.contains('Open confirmation dialog').click();
  };
  const openBothDialogs = () => {
    cy.contains('Open both dialogs').click();
  };
  const mainOpts: Opts = {
    isBackdrop: true,
  };
  const confirmationOpts: Opts = {
    isBackdrop: true,
    backdropOpacity: 0.5,
  };

  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  it('Opens the main dialog', () => {
    openMainDialog();
    verifyOpenedState(mainSelector, mainOpts);
  });

  it('Opens the confirmation dialog', () => {
    openConfirmationDialog();
    verifyOpenedState(confirmationSelector, confirmationOpts);
  });

  it('Opens the confirmation via the dialog', () => {
    openMainDialog();
    verifyOpenedState(mainSelector, mainOpts);
    cy.get(mainSelector).contains('Decline').click();
    verifyOpenedState(confirmationSelector, confirmationOpts);
  });

  it('Closes the confirmation but keeps the main the dialog', () => {
    openMainDialog();
    verifyOpenedState(mainSelector, mainOpts);
    ensureInteractionPossible(mainSelector, mainOpts);
    cy.get(mainSelector).contains('Decline').click();
    verifyOpenedState(confirmationSelector, confirmationOpts);
    ensureInteractionPossible(confirmationSelector, confirmationOpts);
    cy.get(confirmationSelector).contains('No, cancel').click();
    verifyClosedState(confirmationSelector, confirmationOpts);
    verifyOpenedState(mainSelector, mainOpts);
  });

  it('Closes both dialogs', () => {
    openMainDialog();
    verifyOpenedState(mainSelector, mainOpts);
    ensureInteractionPossible(mainSelector, mainOpts);
    cy.get(mainSelector).contains('Decline').click();
    verifyOpenedState(confirmationSelector, confirmationOpts);
    ensureInteractionPossible(confirmationSelector, confirmationOpts);
    cy.get(confirmationSelector).contains("Yes, I'm sure").click();
    verifyClosedState(confirmationSelector, confirmationOpts);
    verifyClosedState(mainSelector, mainOpts);
  });

  it('Opens both dialogs', () => {
    openBothDialogs();
    verifyOpenedState(mainSelector, mainOpts);
    verifyOpenedState(confirmationSelector, confirmationOpts);
    ensureInteractionPossible(confirmationSelector, confirmationOpts);
    cy.get(confirmationSelector).contains("I'm sure").click();
    verifyClosedState(confirmationSelector, confirmationOpts);
    verifyClosedState(mainSelector, mainOpts);
  });
});
