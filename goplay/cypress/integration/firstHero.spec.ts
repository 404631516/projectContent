/// <reference types="cypress" />

describe('change hero', () => {
  it('visit', () => {
    cy.visit('http://localhost:6874')
  })
  it('login', () => {
    cy.login('114613-1534712', '123')
    cy.wait(1000)
  })
  it('chouse last card', () => {
    cy.wait(1000)
    cy.get('[data="FIRST_HERO_CONTAINER"]').scrollTo('right', {duration: 2000})
    cy.wait(1000)
    cy.get('[data="HERO_CARD_13"]').click()
  })
  it('confirm hero card', () => {
    cy.get('[data="FIRST_SELECT_BUTTON"]').click()
    cy.wait(1000)
    cy.get('[data="CONFIRM_BUTTON"]').contains('確定')
  })
})