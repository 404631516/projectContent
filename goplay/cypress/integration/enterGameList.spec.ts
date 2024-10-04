/// <reference types="cypress" />

describe('change hero', () => {
  beforeEach(() => {
    cy.viewport('macbook-15');
  });
  before(() => {
    cy.visit('http://localhost:6874');
    cy.login('213642-arwin2014', '123');
  })
  it('enter answer game list', () => {
    cy.wait(3000)
    cy.get('[data="MAIN_ENTRY_0"]').contains('答題遊戲').click();
  });
  it('choose option', () => {
    cy.get('[data="SUBJECT_RADIO_2"]').click()
    cy.wait(1000)
    const COURSE_NAME = '觀測太陽'
    cy.get('[data="COURSE_BUTTON_0"]').contains(COURSE_NAME).click()
    cy.get('[data="GAME_TITLE"]').contains(COURSE_NAME)
  })
});
