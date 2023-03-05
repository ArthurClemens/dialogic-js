/// <reference types="cypress" />

import {
  ensureInteractionPossible,
  Opts,
  typeEscape,
  verifyClosedState,
  verifyInitialState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/base-menu-tests.html';

describe('Base menu tests', () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  describe('Minimal menu', () => {
    const selector = '#minimal';
    const openMenu = () => {
      cy.contains('Open minimal').click();
    };

    it('Should have inited the menu', () => {
      verifyInitialState(selector);
    });

    it('Opens the menu', () => {
      openMenu();
      verifyOpenedState(selector);
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openMenu();
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyOpenedState(selector);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openMenu();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click({ force: true });
      verifyClosedState(selector);
    });

    it('Closing using the escape key should not be possible after lock duration', () => {
      openMenu();
      ensureInteractionPossible(selector);
      typeEscape();
      verifyOpenedState(selector);
    });
  });

  describe('Menu with close button', () => {
    const selector = '#close-button';
    const openMenu = () => {
      cy.contains('Open menu with close button').click();
    };

    it('Closing using the close button should not immediately be possible', () => {
      openMenu();
      cy.get(selector).contains('Close').click();
      verifyOpenedState(selector);
    });

    it('Closing using the close button should be possible after lock duration', () => {
      openMenu();
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      verifyClosedState(selector);
    });
  });

  describe('Menu with backdrop', () => {
    const selector = '#backdrop';
    const openMenu = () => {
      cy.contains('Open menu with backdrop').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

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

  describe('Escapable menu', () => {
    const selector = '#escapable';
    const openMenu = () => {
      cy.contains('Open escapable menu').click();
    };

    it('Closing using the escape key should be possible despite lock duration', () => {
      openMenu();
      typeEscape();
      verifyClosedState(selector);
    });

    it('Closing using the escape key should be possible after lock duration', () => {
      openMenu();
      ensureInteractionPossible(selector);
      typeEscape();
      verifyClosedState(selector);
    });
  });
});
