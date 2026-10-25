const systemPath = "/systems/skolni_tabor_palava";

it("shows Jídelníček in navigation, route and database tables", () => {
  cy.visit(`${systemPath}/jidelnicek`);
  cy.window({ timeout: 30000 })
    .should((win) => {
      expect(win.__informationSystemTestApi).to.not.equal(undefined);
    })
    .then((win) => {
      win.__informationSystemTestApi!.setBypassPageVisibility(true);
      win.__informationSystemTestApi!.setTeacherMode(false);
    });
  cy.contains("h1", "Jídelníček").should("be.visible");
  cy.contains("nav a", "Jídelníček").should(
    "have.attr",
    "href",
    `/information-system-learning-app${systemPath}/jidelnicek`,
  );
  cy.contains("nav a", "Kniha jídel").should("not.exist");
  cy.get('[data-component-id="jidelnicek-hlavicka-turnusu"]', {
    timeout: 30000,
  })
    .first()
    .should("contain.text", "Turnus 1")
    .click();
  cy.get('[data-component-id="jidelnicek-hlavicka-dne"]')
    .first()
    .should("be.visible")
    .click();
  cy.get('[data-component-id="jidelnicek-radek-jidla"]')
    .first()
    .should("be.visible");
  cy.window()
    .then((win) =>
      win.__informationSystemTestApi!.selectedSystemDatabaseQuery(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
      ),
    )
    .then((result) => {
      const tables = (
        result as { data: Array<{ values: string[][] }> }
      ).data[0].values.flat();
      expect(tables).to.include("jidelnicek");
      expect(tables).not.to.include("kniha_jidel");
    });
  cy.visit(`${systemPath}/kniha-jidel?source=bookmark#day`);
  cy.location("pathname").should(
    "eq",
    `/information-system-learning-app${systemPath}/jidelnicek`,
  );
  cy.location("search").should("eq", "?source=bookmark");
  cy.location("hash").should("eq", "#day");
});
