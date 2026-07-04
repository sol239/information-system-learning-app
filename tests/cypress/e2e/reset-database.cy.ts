const participantsUrl = '/systems/skolni_tabor_palava/ucastnici';
const databaseUrl = '/systems/skolni_tabor_palava/database';

type QueryOperation = {
  data?: Array<{
    values?: unknown[][];
  }>;
};

function querySelectedSystemDatabase(sql: string) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.selectedSystemDatabaseQuery(sql) as Promise<QueryOperation>);
}

function expectParticipantCount(expectedCount: number) {
  querySelectedSystemDatabase('select count(*) from ucastnici;').then((result) => {
    expect(result.data?.[0]?.values?.[0]?.[0]).to.equal(expectedCount);
  });
}

it('reset database', function () {
  cy.visit(participantsUrl);

  cy.get('#smazat-ucastnika-tlacitko', { timeout: 30000 }).should('be.visible');
  expectParticipantCount(30);

  cy.get('#smazat-ucastnika-tlacitko').first().click();
  expectParticipantCount(29);

  cy.visit(databaseUrl);
  cy.get('#reset-database-button', { timeout: 10000 }).should('be.visible').click();

  expectParticipantCount(30);
});
