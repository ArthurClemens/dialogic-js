/// <reference types="cypress" />

import {
  ensureInteractionPossible,
  Opts,
  typeEscape,
  verifyClosedState,
  verifyInitialState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/base-dialog-tests.html';

describe('Base dialog tests', () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  describe('Minimal dialog', () => {
    const selector = '#minimal';
    const openDialog = () => {
      cy.get(selector).contains('Open').click();
    };

    it('Should have inited the dialog', () => {
      verifyInitialState(selector);
    });

    it('Opens the dialog', () => {
      openDialog();
      verifyOpenedState(selector);
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openDialog();
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyClosedState(selector);
    });

    it('Closing using the close button should not immediately be possible', () => {
      openDialog();
      cy.get(selector).contains('Close').click();
      verifyOpenedState(selector);
    });

    it('Closing using the close button should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      verifyClosedState(selector);
    });

    it('Closing using the escape key should not be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector);
      typeEscape();
      verifyOpenedState(selector);
    });
  });

  describe('With backdrop, touch first', () => {
    const selector = '#touch-first';
    const openDialog = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

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
  });

  describe('With backdrop, backdrop first', () => {
    const selector = '#backdrop-first';
    const openDialog = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

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
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyClosedState(selector, opts);
    });
  });

  describe('Modal', () => {
    const selector = '#modal';
    const openDialog = () => {
      cy.contains('Open modal dialog').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Closing using the touch layer should not immediately be possible', () => {
      openDialog();
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should still not be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector, opts);
    });
  });

  describe('Escapable', () => {
    const selector = '#escapable';
    const openDialog = () => {
      cy.get(selector).contains('Open').click();
    };

    it('Closing using the escape key should be possible despite lock duration', () => {
      openDialog();
      typeEscape();
      verifyClosedState(selector);
    });

    it('Closing using the escape key should be possible after lock duration', () => {
      openDialog();
      ensureInteractionPossible(selector);
      typeEscape();
      verifyClosedState(selector);
    });
  });

  describe('Form', () => {
    const selector = '#form';
    const openDialog = () => {
      cy.get(selector).contains('Open dialog').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Should not set focus to the first input element', () => {
      openDialog();
      cy.get(`${selector} input[name="first"]`).should('not.have.focus');
    });
  });

  describe('Form, focus first', () => {
    const selector = '#form-focusfirst';
    const openDialog = () => {
      cy.get(selector).contains('Open dialog').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Should set focus to the first input element', () => {
      openDialog();
      cy.get(`${selector} input[name="first"]`).should('have.focus');
    });

    it('Should close the dialog', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(selector).contains('Cancel').click();
    });
  });

  describe('Form, focus first element', () => {
    const selector = '#form-focusfirst-element';
    const openDialog = () => {
      cy.get(selector).contains('Open dialog').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Should set focus to the second input element', () => {
      openDialog();
      cy.get(`${selector} input[name="last"]`).should('have.focus');
    });

    it('Should close the dialog', () => {
      openDialog();
      ensureInteractionPossible(selector, opts);
      cy.get(selector).contains('Cancel').click();
    });
  });

  describe('Stacked', () => {
    const mainSelector = '#stacked-main';
    const confirmationSelector = '#stacked-confirmation';
    const openMainDialog = () => {
      cy.get('[data-testid=button-stacked-main]').click();
    };
    const openConfirmationDialog = () => {
      cy.get('[data-testid=button-stacked-confirmation]').click();
    };
    const openBothDialogs = () => {
      cy.get('[data-testid=button-stacked-both]').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Opens the main dialog', () => {
      openMainDialog();
      verifyOpenedState(mainSelector, opts);
    });

    it('Opens the confirmation dialog', () => {
      openConfirmationDialog();
      verifyOpenedState(confirmationSelector, opts);
    });

    it('Opens the confirmation via the dialog', () => {
      openMainDialog();
      verifyOpenedState(mainSelector, opts);
      cy.get(mainSelector).contains('Decline').click();
      verifyOpenedState(confirmationSelector, opts);
    });

    it('Closes the confirmation but keeps the main the dialog', () => {
      openMainDialog();
      verifyOpenedState(mainSelector, opts);
      ensureInteractionPossible(mainSelector, opts);
      cy.get(mainSelector).contains('Decline').click();
      verifyOpenedState(confirmationSelector, opts);
      ensureInteractionPossible(confirmationSelector, opts);
      cy.get(confirmationSelector).contains('Cancel').click();
      verifyClosedState(confirmationSelector, opts);
      verifyOpenedState(mainSelector, opts);
    });

    it('Closes both dialogs', () => {
      openMainDialog();
      verifyOpenedState(mainSelector, opts);
      ensureInteractionPossible(mainSelector, opts);
      cy.get(mainSelector).contains('Decline').click();
      verifyOpenedState(confirmationSelector, opts);
      ensureInteractionPossible(confirmationSelector, opts);
      cy.get(confirmationSelector).contains("I'm sure").click();
      verifyClosedState(confirmationSelector, opts);
      verifyClosedState(mainSelector, opts);
    });

    it('Opens both dialogs', () => {
      openBothDialogs();
      verifyOpenedState(mainSelector, opts);
      verifyOpenedState(confirmationSelector, opts);
      ensureInteractionPossible(confirmationSelector, opts);
      cy.get(confirmationSelector).contains("I'm sure").click();
      verifyClosedState(confirmationSelector, opts);
      verifyClosedState(mainSelector, opts);
    });

    it('Escape should only close the top dialog', () => {
      openBothDialogs();
      verifyOpenedState(mainSelector, opts);
      verifyOpenedState(confirmationSelector, opts);
      ensureInteractionPossible(confirmationSelector, opts);
      typeEscape();
      cy.wait(300);
      verifyClosedState(confirmationSelector, opts);
      verifyOpenedState(mainSelector, opts);
      typeEscape();
      cy.wait(300);
      verifyClosedState(confirmationSelector, opts);
      verifyClosedState(mainSelector, opts);
    });
  });
});
