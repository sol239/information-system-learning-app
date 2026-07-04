const participantsUrl = '/systems/skolni_tabor_palava/nastenka';

function setTeacherMode(value: boolean) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.setTeacherMode(value));
}

function setBypassPageVisibility(value: boolean) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.setBypassPageVisibility(value));
}

function setEditModeActive(value: boolean) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.setEditModeActive(value));
}

function setComponentCodeSQL(componentId: string, queryName: string, code: string) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.setComponentCodeSQL(componentId, queryName, code));
}

function getComponentCodeSQL(componentId: string, queryName: string) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.getComponentCodeSQL(componentId, queryName));
}

function applyTestSettings() {
  setTeacherMode(false).then(() => {
    setBypassPageVisibility(true);
    setEditModeActive(false);
  });
}

it('reset components', function () {
  cy.visit(participantsUrl);
  cy.get('#statistika-ucastniku-karta', { timeout: 30000 }).should('be.visible');
  applyTestSettings();
  cy.get('#statistika-ucastniku-pocet').should('contain.text', '30');
  cy.get('#toggle-edits-button', { timeout: 30000 }).should('be.visible').click();

  setComponentCodeSQL(
    'statistika-ucastniku',
    'statistika-ucastniku',
    'SELECT COUNT(*) + 4 as pocet_ucastniku FROM ucastnici'
  );
  cy.get('#statistika-ucastniku-pocet', { timeout: 10000 }).should('contain.text', '34');
  getComponentCodeSQL('statistika-ucastniku', 'statistika-ucastniku')
    .should('contain', '+ 4');

  cy.get('#reset-system-button', { timeout: 10000 }).click();
  cy.get('#reset-components-button', { timeout: 10000 }).click();

  cy.get('#statistika-ucastniku-pocet', { timeout: 10000 }).should('contain.text', '30');
  getComponentCodeSQL('statistika-ucastniku', 'statistika-ucastniku')
    .should('not.contain', '+ 4');
});
