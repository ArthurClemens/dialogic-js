export type Opts = {
  isBackdrop?: boolean;
  isTouch?: boolean;
  backdropOpacity?: number;
  contentDisplay?: 'flex' | 'block' | 'none';
};

const defaultOpts: Opts = {
  isBackdrop: false,
  isTouch: true,
  backdropOpacity: 0.2,
  contentDisplay: 'block',
};

export const verifyInitialState = (selector: string, optsParam: Opts = {}) => {
  const opts = {
    ...defaultOpts,
    ...optsParam,
  };

  if (opts?.isTouch) {
    cy.get(`${selector} [data-touch]`).should('exist');
    // Touch layer is only registered after opening
    cy.get(`${selector} [data-touch][data-registered]`).should('not.exist');
  }

  if (opts?.isBackdrop) {
    // Backdrop should have opacity 0
    cy.get(`${selector} [data-backdrop]`).should('exist');
    cy.get(`${selector} [data-backdrop]`).should('have.css', 'display', 'none');
    cy.get(`${selector} [data-backdrop]`).should('have.css', 'opacity', '0');
  }

  // Content
  cy.get(`${selector} [data-content][data-registered]`).should('not.exist');
  // Content should have opacity 0
  cy.get(`${selector} [data-content]`).should('exist');
  cy.get(`${selector} [data-content]`).should('not.be.visible');
};

export const verifyOpenedState = (selector: string, optsParam: Opts = {}) => {
  const opts = {
    ...defaultOpts,
    ...optsParam,
  };
  cy.get(`${selector}[data-isopen][data-isshowing]`).should('exist');

  if (opts?.isTouch) {
    // Touch layer
    cy.get(`${selector} [data-touch][data-registered]`).should('exist');
    // Can't test visibility: https://github.com/cypress-io/cypress/issues/21164
    cy.get(`${selector} [data-touch]`).should('have.css', 'display', 'block');
  }

  if (opts?.isBackdrop) {
    // Backdrop
    // Can't test visibility: https://github.com/cypress-io/cypress/issues/21164
    // cy.get(`${selector} [data-backdrop]`).should("be.visible");
    // So we test the element style
    cy.get(`${selector} [data-backdrop]`).should(
      'have.css',
      'display',
      'block'
    );
    cy.get(`${selector} [data-backdrop]`).should(
      'have.css',
      'opacity',
      opts.backdropOpacity?.toString()
    );
  }

  // Content
  cy.get(`${selector} [data-content][data-registered]`).should('exist');
  // Can't test visibility: https://github.com/cypress-io/cypress/issues/21164
  cy.get(`${selector} [data-content]`).should(
    'have.css',
    'display',
    opts.contentDisplay
  );
  cy.get(`${selector} [data-content]`).should('have.css', 'opacity', '1');
};

export const verifyClosedState = (selector: string, optsParam: Opts = {}) => {
  const opts = {
    ...defaultOpts,
    ...optsParam,
  };
  if (opts?.isBackdrop) {
    // Backdrop should have opacity 0
    cy.get(`${selector} [data-backdrop]`).should('exist');
    cy.get(`${selector} [data-backdrop]`).should('not.be.visible');
  }

  // Content should have opacity 0
  cy.get(`${selector} [data-content]`).should('exist');
  cy.get(`${selector} [data-content]`).should('not.be.visible');
};

export const ensureInteractionPossible = (
  selector: string,
  optsParam: Opts = {}
) => {
  cy.get(`${selector}[data-islocked]`).should('not.exist');
};

export const typeEscape = () => cy.get('body').type('{esc}');

export const getDrawerContentClientRect = (
  selector: string,
  callback: (elementRect: DOMRect, windowWidth: number) => unknown,
  opts: Opts = {}
) => {
  cy.get(`${selector} [data-content]`).then(($el) => {
    cy.window().then(($window) => {
      return callback($el[0].getBoundingClientRect(), $window.innerWidth);
    });
  });
};
