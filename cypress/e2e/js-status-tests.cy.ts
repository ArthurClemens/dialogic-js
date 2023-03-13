/// <reference types="cypress" />

import { verifyInitialState, verifyOpenedState } from '../support/util';

const TEST_URL = '/test/js-status.html';
const SAFE_TRANSITION_DURATION = 150;

describe('JS status tests', () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  const selector = '#dialog';
  const statusSelector = '#status';

  const openMenu = () => {
    cy.contains('Open').click();
  };

  it('Should have inited the dialog', () => {
    verifyInitialState(selector);
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":false,"willShow":false,"didShow":false,"willHide":false,"didHide":false}',
    );
  });

  it('Shows the dialog status from opening to closing', () => {
    openMenu();
    verifyOpenedState(selector);
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":false,"willShow":true,"didShow":false,"willHide":false,"didHide":false}',
    );
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(SAFE_TRANSITION_DURATION);
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":true,"willShow":false,"didShow":true,"willHide":false,"didHide":false}',
    );
    cy.contains('Close').click();
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":true,"willShow":false,"didShow":false,"willHide":true,"didHide":false}',
    );
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(SAFE_TRANSITION_DURATION);
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":false,"willShow":false,"didShow":false,"willHide":false,"didHide":true}',
    );
  });
});
