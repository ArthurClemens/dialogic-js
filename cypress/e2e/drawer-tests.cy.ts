/// <reference types="cypress" />

import {
  ensureInteractionPossible,
  getDrawerContentClientRect,
  Opts,
  verifyClosedState,
  verifyInitialState,
  verifyOpenedState,
} from '../support/util';

const TEST_URL = '/test/drawer.html';
const SAFE_TRANSITION_DURATION = 400;

const verifyScrolledContent = (
  selector: string,
  opts: Opts,
  openDrawer: () => void,
) => {
  openDrawer();
  cy.wait(SAFE_TRANSITION_DURATION);
  verifyOpenedState(selector, opts);
  cy.get(`${selector} [data-drawer-content]`)
    .contains('Last')
    .then($el => {
      const el = $el.get(0);
      expect(el.getBoundingClientRect().top).greaterThan(700);
      el.scrollIntoView();
      expect(el.getBoundingClientRect().top).lessThan(700);
    });
};

describe('Drawer tests', () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  describe('Drawer at start', () => {
    const selector = '#start';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Should have inited the drawer', () => {
      verifyInitialState(selector);
      cy.get(selector).contains('Opened').should('not.be.visible');
    });

    it('Opens the drawer', () => {
      openDrawer();
      verifyOpenedState(selector);
      cy.get(selector).contains('Opened').should('be.visible');
    });

    it('Drawer should be positioned at the left', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.top).should('equal', 0);
        cy.wrap(rect.left).should('equal', 0);
      });
    });

    it('Should scroll the drawer contents', () => {
      verifyScrolledContent(selector, opts, openDrawer);
    });

    it('Should close using a close button', () => {
      openDrawer();
      verifyOpenedState(selector);
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      verifyClosedState(selector);
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openDrawer();
      cy.get(`${selector} [data-touch]`).click();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDrawer();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click();
      verifyClosedState(selector, opts);
    });
  });

  describe('Drawer at end', () => {
    const selector = '#end';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Drawer should be positioned at the right', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(
        selector,
        (rect: DOMRect, windowWidth: number) => {
          cy.wrap(rect.top).should('equal', 0);
          cy.wrap(rect.right).should('be.lessThan', windowWidth + 1);
          cy.wrap(rect.right).should('be.greaterThan', windowWidth - 250);
        },
      );
    });

    it('Should scroll the drawer contents', () => {
      verifyScrolledContent(selector, opts, openDrawer);
    });
  });

  describe('Small drawer', () => {
    const selector = '#small';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Drawer should be smaller', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.top).should('equal', 0);
        cy.wrap(rect.left).should('equal', 0);
        cy.wrap(rect.width).should('be.lessThan', 200);
      });
    });
  });

  describe('Modal drawer', () => {
    const selector = '#modal';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Closing using the touch layer should not immediately be possible', () => {
      openDrawer();
      cy.get(`${selector} [data-touch]`).click();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should still not be possible after lock duration', () => {
      openDrawer();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click();
      verifyOpenedState(selector, opts);
    });

    it('Should close using a close button', () => {
      openDrawer();
      verifyOpenedState(selector);
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      verifyClosedState(selector);
    });
  });

  describe('Drawer without backdrop', () => {
    const selector = '#no-backdrop';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: false,
    };

    it('Closing using the touch layer should not immediately be possible', () => {
      openDrawer();
      cy.get(`${selector} [data-touch]`).click();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDrawer();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click();
      verifyClosedState(selector, opts);
    });
  });

  describe('Local drawer', () => {
    const selector = '#local';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Drawer should be local', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.top).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', 0);
        cy.wrap(rect.right).should('be.lessThan', 400);
      });
    });

    it('Should scroll the drawer contents', () => {
      verifyScrolledContent(selector, opts, openDrawer);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDrawer();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click();
      verifyClosedState(selector, opts);
    });
  });

  describe('Local drawer at end', () => {
    const selector = '#local-end';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Drawer should be local, positioned at the right', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.top).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', 400);
        cy.wrap(rect.right).should('be.greaterThan', 900);
      });
    });
  });

  describe('Push drawer', () => {
    const selector = '#push-start';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
      contentDisplay: 'flex',
    };

    const verifyOpenStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.lessThan', 100);
        cy.wrap(rect.right).should('be.greaterThan', 1200);
      });
    };

    const verifyClosedStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.lessThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', -300);
        cy.wrap(rect.right).should('be.lessThan', 1200);
        cy.wrap(rect.right).should('be.greaterThan', 900);
      });
    };

    it('Drawer should push content', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      verifyOpenStateCurrentTest();
    });

    it('Should scroll the drawer contents', () => {
      openDrawer();
      verifyOpenedState(selector, opts);
      cy.get(selector).contains('Last').should('not.be.visible');
      cy.get(`${selector} [data-drawer-content]`).scrollTo('bottom');
      cy.get(selector).contains('Last').should('be.visible');
    });

    it('Should close using a close button', () => {
      openDrawer();
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyClosedStateCurrentTest();
    });

    it('Closing using the touch layer should not immediately be possible', () => {
      openDrawer();
      cy.get(`${selector} [data-touch]`).click();
      verifyOpenedState(selector, opts);
    });

    it('Closing using the touch layer should be possible after lock duration', () => {
      openDrawer();
      ensureInteractionPossible(selector);
      cy.get(`${selector} [data-touch]`).click();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyClosedStateCurrentTest();
    });
  });

  describe('Push drawer at end', () => {
    const selector = '#push-end';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
      contentDisplay: 'flex',
    };

    const verifyOpenStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.lessThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', -300);
        cy.wrap(rect.right).should('be.lessThan', 1200);
        cy.wrap(rect.right).should('be.greaterThan', 900);
      });
    };

    const verifyClosedStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.lessThan', 100);
        cy.wrap(rect.right).should('be.greaterThan', 1200);
      });
    };

    it('Drawer should push content from the right', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      verifyOpenStateCurrentTest();
    });

    it('Should close using a close button', () => {
      openDrawer();
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyClosedStateCurrentTest();
    });
  });

  describe('Drawer at start (RTL)', () => {
    const selector = '#start-rtl';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Should have inited the drawer', () => {
      verifyInitialState(selector);
      cy.get(selector).contains('Opened').should('not.be.visible');
    });

    it('Opens the drawer', () => {
      openDrawer();
      verifyOpenedState(selector);
      cy.get(selector).contains('Opened').should('be.visible');
    });

    it('Drawer should be positioned at the right', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(
        selector,
        (rect: DOMRect, windowWidth: number) => {
          cy.wrap(rect.top).should('equal', 0);
          cy.wrap(rect.right).should('be.lessThan', windowWidth + 1);
          cy.wrap(rect.right).should('be.greaterThan', windowWidth - 250);
        },
      );
    });
  });

  describe('Drawer at end (RTL)', () => {
    const selector = '#end-rtl';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Drawer should be positioned at the left', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.top).should('equal', 0);
        cy.wrap(rect.left).should('equal', 0);
      });
    });
  });

  describe('Local drawer (RTL)', () => {
    const selector = '#local-rtl';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Drawer should be positioned at the right', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.top).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', 400);
        cy.wrap(rect.right).should('be.greaterThan', 900);
      });
    });
  });

  describe('Local drawer at end (RTL)', () => {
    const selector = '#local-end-rtl';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
    };

    it('Drawer should be local, positioned at the left', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.top).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', 0);
        cy.wrap(rect.right).should('be.lessThan', 400);
      });
    });
  });

  describe('Push drawer (RTL)', () => {
    const selector = '#push-rtl';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
      contentDisplay: 'flex',
    };

    const verifyOpenStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.lessThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', -300);
        cy.wrap(rect.right).should('be.lessThan', 1200);
        cy.wrap(rect.right).should('be.greaterThan', 900);
      });
    };

    const verifyClosedStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.lessThan', 100);
        cy.wrap(rect.right).should('be.greaterThan', 1200);
      });
    };

    it('Drawer should push content from the right', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      verifyOpenStateCurrentTest();
    });

    it('Should close using a close button', () => {
      openDrawer();
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyClosedStateCurrentTest();
    });
  });

  describe('Push drawer at end (RTL)', () => {
    const selector = '#push-end-rtl';
    const openDrawer = () => {
      cy.get(selector).contains('Open').click();
    };
    const opts: Opts = {
      isBackdrop: true,
      contentDisplay: 'flex',
    };

    const verifyOpenStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.greaterThan', 0);
        cy.wrap(rect.left).should('be.lessThan', 100);
        cy.wrap(rect.right).should('be.greaterThan', 1200);
      });
    };

    const verifyClosedStateCurrentTest = () => {
      getDrawerContentClientRect(selector, (rect: DOMRect) => {
        cy.wrap(rect.width).should('be.greaterThan', 1200);
        cy.wrap(rect.left).should('be.lessThan', 0);
        cy.wrap(rect.left).should('be.greaterThan', -300);
        cy.wrap(rect.right).should('be.lessThan', 1200);
        cy.wrap(rect.right).should('be.greaterThan', 900);
      });
    };

    it('Drawer should push content from the right', () => {
      openDrawer();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      verifyOpenStateCurrentTest();
    });

    it('Should close using a close button', () => {
      openDrawer();
      verifyOpenedState(selector, opts);
      ensureInteractionPossible(selector);
      cy.get(selector).contains('Close').click();
      cy.wait(SAFE_TRANSITION_DURATION);
      verifyClosedStateCurrentTest();
    });
  });

  describe('Combined local and global drawer', () => {
    const globalSelector = '#no-backdrop';
    const localSelector = '#local';
    const openGlobalDrawer = () => {
      cy.get(globalSelector).contains('Open').click();
    };
    const openLocalDrawer = () => {
      cy.get(localSelector).contains('Open').click();
    };
    const globalOpts: Opts = {
      isBackdrop: false,
    };
    const localOpts: Opts = {
      isBackdrop: true,
    };

    it('Should have inited the drawers', () => {
      verifyInitialState(globalSelector);
      verifyInitialState(localSelector);
      cy.get(globalSelector).contains('Opened').should('not.be.visible');
      cy.get(localSelector).contains('Opened').should('not.be.visible');
    });

    it('Opens and closes the drawers one by one', () => {
      // Open local drawer
      openLocalDrawer();
      verifyOpenedState(localSelector, localOpts);
      cy.get(localSelector).contains('Opened').should('be.visible');
      ensureInteractionPossible(localSelector);

      // Open global drawer
      openGlobalDrawer();
      verifyOpenedState(globalSelector, globalOpts);
      cy.get(globalSelector).contains('Opened').should('be.visible');
      ensureInteractionPossible(globalSelector);

      // Close global drawer first
      cy.get(`${globalSelector} [data-touch]`).click();
      verifyClosedState(globalSelector, globalOpts);

      // Close local drawer last
      cy.get(`${localSelector} [data-touch]`).click();
      verifyClosedState(localSelector, localOpts);
    });
  });
});
