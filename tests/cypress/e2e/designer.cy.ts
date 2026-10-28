it("opens the task designer directly", () => {
  cy.visit(
    "/systems/skolni_tabor_palava/designer?backTo=/systems/skolni_tabor_palava/nastenka",
  );

  cy.contains("h1", "Návrhář úkolů", { timeout: 30000 }).should("be.visible");
});
