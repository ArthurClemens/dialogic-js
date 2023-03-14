/// <reference types="cypress" />

import { verifyInitialState } from '../support/util';

const TEST_URL = '/test/js-status.html';
const SAFE_TRANSITION_DURATION = 500;

describe('JS status tests', () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  const selector = '#dialog';
  const statusSelector = '#status-dialog';
  const dummySelector = '#status-dummy';

  const openMenu = () => {
    cy.contains('Open dialog').click();
  };

  it('Should have inited the dialog', () => {
    verifyInitialState(selector);
    cy.get(statusSelector).should('contain', 'Status...');
    cy.get(dummySelector).should('contain', 'Status...');
  });

  it('Shows the dialog status from opening to closing', () => {
    openMenu();

    // Opening...
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":false,"willShow":true,"didShow":false,"willHide":false,"didHide":false}',
    );
    cy.get(dummySelector).should('contain', 'Status...');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(SAFE_TRANSITION_DURATION);

    // Opened
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":true,"willShow":false,"didShow":true,"willHide":false,"didHide":false}',
    );
    cy.get(dummySelector).should('contain', 'Status...');

    cy.get(selector).contains('Close').click();

    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":true,"willShow":false,"didShow":false,"willHide":true,"didHide":false}',
    );
    cy.get(dummySelector).should('contain', 'Status...');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(SAFE_TRANSITION_DURATION);
    cy.get(statusSelector).should(
      'contain',
      '{"isOpen":false,"willShow":false,"didShow":false,"willHide":false,"didHide":true}',
    );
    cy.get(dummySelector).should('contain', 'Status...');
  });
});
