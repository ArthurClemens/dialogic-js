import { verifyInitialState, verifyOpenedState } from '../support/util';

const TEST_URL = '/test/js-methods.html';

describe('JS method tests', () => {
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
    cy.get(statusSelector).should('contain', 'Status...');
  });

  it('Shows the dialog status from opening to closing', () => {
    openMenu();
    cy.get(statusSelector).should('contain', 'Showing in progress');
    cy.get(statusSelector).should('contain', 'Showing now');
    cy.get(statusSelector).should('contain', 'Hiding in progress');
    cy.get(statusSelector).should('contain', 'Hidden');
  });
});
