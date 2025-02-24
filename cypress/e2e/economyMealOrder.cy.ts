/// <reference types="cypress" />

describe('Business Class Meal Order Flow', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      cy.clearLocalStorage();
      // Visit the business class page
      cy.visit('/economy');
    });
  
    it('should complete a full order flow', () => {
      // Wait for the page to load
      cy.get('[data-testid="meal-page"]').should('be.visible');
  
      // Select meals from different categories
      // First meal selection
      cy.contains('h3', 'Denver Omelette')
        .closest('.MuiCard-root')
        .click();
      
      // Verify selection
      cy.contains('h3', 'Denver Omelette')
        .closest('.MuiCard-root')
        .should('have.css', 'border-color')
        .and('not.equal', 'rgb(229, 231, 235)'); // Not gray border
  
      // Second meal selection
      cy.contains('h3', 'Steak-n-Cheese Sliders')
        .closest('.MuiCard-root')
        .click();
  
      // Verify cart updates
      cy.contains('Your Cart').should('be.visible');
  
      // Test cart confirmation
      cy.contains('button', 'Confirm').click();
      
      // Verify order summary dialog
      cy.contains('Order Summary').should('be.visible');
      
      // Confirm order
      cy.get('#confirm-order-dialog').click({ force: true });
      cy.get('#cart-item-Denver-Omelette').should('exist');
  
      // Verify success message
      cy.contains('Your order has been placed successfully!').should('be.visible');
  
      // Verify confirmed order state
      cy.contains('Your order has been placed successfully!').should('be.visible');
      cy.contains('Confirmed Order').should('be.visible');
    });
  
    it('should allow editing a confirmed order', () => {
      // Select and confirm initial order
      cy.contains('h3', 'Denver Omelette')
        .closest('.MuiCard-root')
        .click();
      cy.contains('button', 'Confirm').click();
      cy.get('#confirm-order-dialog').click({ force: true });
  
      // Edit the order
      cy.contains('button', 'Edit').click();
  
      // Remove existing item
      cy.contains('button', 'Remove').click();
  
      // Add new item
      cy.contains('h3', 'Everything Bagel')
        .closest('.MuiCard-root')
        .click();
  
      // Confirm edited order
      cy.contains('button', 'Confirm').click();
      // Confirm order
      cy.get('#confirm-order-dialog').click({ force: true });
  
      // Verify success message
      cy.contains('Your order has been placed successfully!').should('be.visible');
    });
  
    it('should handle cart reset functionality', () => {
      // Select multiple items
      cy.contains('h3', 'Denver Omelette')
        .closest('.MuiCard-root')
        .click();
      cy.contains('h3', 'Chicken Parm Panini')
        .closest('.MuiCard-root')
        .click();
  
      // Verify items in cart
      cy.contains('Your Cart').should('be.visible');
      cy.get('#cart-item-Denver-Omelette').should('exist');
      cy.get('#cart-item-Chicken-Parm-Panini').should('exist');
  
      // Click reset button
      cy.contains('button', 'Reset').click();
  
      // Verify cart is empty
      cy.contains('No meals in your cart').should('be.visible');
  
      // Verify meal cards are deselected
      cy.contains('h3', 'Denver Omelette')
        .closest('.MuiCard-root')
        .should('have.css', 'border-color', 'rgb(229, 231, 235)'); // Gray border
      
      cy.contains('h3', 'Steak-n-Cheese Sliders')
        .closest('.MuiCard-root')
        .should('have.css', 'border-color', 'rgb(229, 231, 235)'); // Gray border
    });
  
    it('should handle individual item removal from cart', () => {
      // Select multiple items
      cy.contains('h3', 'Denver Omelette')
        .closest('.MuiCard-root')
        .click();
      cy.contains('h3', 'Steak-n-Cheese Sliders')
        .closest('.MuiCard-root')
        .click();
  
      // Remove one item
      cy.get('#cart-item-Denver-Omelette')
        .parent()
        .contains('Remove')
        .click();
  
      // Verify item was removed
      cy.get('#cart-item-Denver-Omelette').should('not.exist');
      cy.contains('Steak-n-Cheese Sliders').should('be.visible');
  
      // Verify meal card is deselected
      cy.contains('h3', 'Denver Omelette')
        .closest('.MuiCard-root')
        .should('have.css', 'border-color', 'rgb(229, 231, 235)'); // Gray border
    });
  });