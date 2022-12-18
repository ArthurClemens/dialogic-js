import {
  ensureInteractionPossible,
  Opts,
  verifyClosedState,
  verifyInitialState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/primer-css-select-menu.html';

describe('PrimerCSS Select menu', () => {
  const selector = 'details';
  const openDialog = () => {
    cy.get(selector).contains('Choose an item').click();
  };
  const opts: Opts = {
    isBackdrop: true,
    backdropOpacity: 0.07,
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

  it('Selecting an item closes the menu', () => {
    openDialog();
    ensureInteractionPossible(selector, opts);
    cy.get(`${selector}`).contains('Item 3').click();
    verifyClosedState(selector, opts);
  });
});
