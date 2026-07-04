const appUrl = 'http://localhost:3000/information-system-learning-app/systems/skolni_tabor_palava/nastenka';

function setTeacherMode(value: boolean) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.setTeacherMode(value));
}

function expectScore(value: string) {
  cy.contains('.tasks-column span', `Skóre: ${value}`).should('be.visible');
}

it('reset system', function () {
  cy.visit(appUrl);
  cy.get('#task-1 div.items-start', { timeout: 30000 }).should('be.visible');


  setTeacherMode(false);

  cy.get('#task-1 div.items-start', { timeout: 30000 }).should('be.visible').click();



  cy.get('h2.font-bold')
    .should('contain.text', '1. Nejstarší účastník');
  cy.get('p.text-base')
    .should('contain.text', 'V tomto úkolu bude vaším cílem správně určit věk nejstaršího účastníka. Zjistěte, která komponenta zobrazuje věk nejstaršího účastníka a zkontrolujte, jestli správně zobrazuje daný údaj. Správnou hodnotu můžete ověřit v databázi. Poté vyberte správné možnosti níže.');
  cy.get('div.space-y-2 > div:nth-child(1)')
    .should('contain.text', 'Věk nejstaršího účastníka je zobrazován správně na nástěnce');
  cy.get('div.space-y-2 div:nth-child(2)')
    .should('contain.text', 'Komponenta zobrazuje věk nejstaršího vedoucího');
  cy.get('div.space-y-2 div:nth-child(3)')
    .should('contain.text', 'Namísto věku nejstaršího účastníka se zobrazuje věk nejmladšího');
  cy.get('div.space-y-2 div:nth-child(4)')
    .should('contain.text', 'Žádná odpověď není správná');

  cy.get('div:nth-child(3) > span.text-gray-800').click();
  cy.get('div.space-y-2 div:nth-child(3)')
    .should(($el) => {
      expect($el).to.have.class('border-sky-400');
      expect($el).to.have.class('bg-sky-50');
      expect($el).to.not.have.class('border-gray-200');
      expect($el).to.not.have.class('hover:border-gray-300');
    });
  cy.get('div:nth-child(3) > div.rounded')
    .should(($el) => {
      expect($el).to.have.class('border-sky-500');
      expect($el).to.have.class('bg-sky-500');
      expect($el).to.not.have.class('border-gray-400');
    });

  cy.get('div:nth-child(2) > div.mt-2 > button.bg-primary').first().click();
  cy.get('#statistika-max-vek-ucastnika-number')
    .should('contain.text', '14');
  cy.get('div:nth-child(2) > div.justify-between > span.flex')
    .should(($el) => {
      expect($el).to.have.class('bg-green/10');
      expect($el).to.have.class('text-green');
      expect($el).to.have.class('ring-green/25');
      expect($el).to.not.have.class('ring-accented');
      expect($el).to.not.have.class('text-default');
      expect($el).to.not.have.class('bg-elevated');
    });
  cy.get('div:nth-child(2) > div.justify-between > span.flex > div.flex')
    .should(($el) => {
      expect($el).to.have.class('border-green-500');
      expect($el).to.have.class('bg-green-500');
      expect($el).to.not.have.class('border-gray-400');
    });
  cy.get('div:nth-child(2) > div.mt-2 > button.bg-primary')
    .should('have.attr', 'disabled');
  cy.get('span.gap-1')
    .should('contain.text', 'Správná odpověď');

  cy.get('input.ring').click();
  cy.get('input.ring').type('14');
  cy.get('input.ring')
    .should('have.value', '14');

  cy.get('div.border.w-full button.bg-primary').first().click();
  cy.get('div.border.w-full div.justify-between span.flex')
    .should(($el) => {
      expect($el).to.have.class('bg-green/10');
      expect($el).to.have.class('text-green');
      expect($el).to.have.class('ring-green/25');
      expect($el).to.not.have.class('ring-accented');
      expect($el).to.not.have.class('text-default');
      expect($el).to.not.have.class('bg-elevated');
    });
  cy.get('div.border.w-full span.flex div.flex')
    .should(($el) => {
      expect($el).to.have.class('border-green-500');
      expect($el).to.have.class('bg-green-500');
      expect($el).to.not.have.class('border-gray-400');
    });
  cy.get('div.border.w-full button.bg-primary')
    .should('have.attr', 'disabled');
  cy.get('div.border.w-full div.gap-3 span.flex')
    .should('contain.text', 'Správná odpověď');
  expectScore('1');
  cy.get('input.ring')
    .should('have.attr', 'disabled');

  cy.get('div.flex.p-4 button:nth-child(3)').click();
  cy.get('#task-2').click();
  cy.get('h2.font-bold')
    .should('contain.text', '2. Nalezení chybné komponenty');
  cy.get('p.text-base')
    .should('contain.text', 'Na stránce Nástěnka jsou 4 komponenty, které zobrazují celkové počty účastníků, turnusů, vedoucích a jídel v turnusu. Zkontrolujte, která komponenta špatně zobrazuje daný údaj, a vyberte ji. Správnou hodnotu můžete ověřit v databázi anebo v SQL dotazu komponenty.');
  cy.get('div.flex.p-4 > button:nth-child(1)')
    .should('contain.text', 'Zpět na seznam');
  cy.get('div:nth-child(2) > div.gap-3')
    .should('contain.text', 'Vyhodnotit');
  cy.get('input.ring')
    .should(($el) => {
      expect($el).to.have.attr('disabled');
      expect($el).to.have.value('');
    });
  cy.get('div.border.w-full button.bg-primary')
    .should(($el) => {
      expect($el).to.have.attr('disabled');
      expect($el).to.contain.text('Vyhodnotit');
    });

  cy.get('div[data-component-id="statistika-jidel"] div.content-container').click();
  cy.get('div[data-component-id="statistika-jidel"]')
    .should('have.class', 'is-highlighted');
  cy.get('div:nth-child(2) > div.flex-wrap')
    .should('contain.text', 'Statistika jídel');

  cy.get('div.is-highlighted div.content-container').click();
  cy.get('div[data-component-id="statistika-jidel"]')
    .should('not.have.class', 'is-highlighted');

  cy.get('div[data-component-id="statistika-vedoucich"] div.content-container').click();
  cy.get('div[data-component-id="statistika-vedoucich"]')
    .should('have.class', 'is-highlighted');
  cy.get('div:nth-child(2) > div.flex-wrap')
    .should('contain.text', 'Statistika vedoucích');

  cy.get('div:nth-child(2) > div.gap-3 > button.bg-primary').first().click();
  cy.get('div.gap-3 span.flex')
    .should('contain.text', 'Nesprávná odpověď');
  expectScore('0.5');

  cy.get('div[data-component-id="statistika-jidel"] div.content-container').click();
  cy.get('div[data-component-id="statistika-jidel"]')
    .should('have.class', 'is-highlighted');
  cy.get('div:nth-child(2) > div.flex-wrap > span:nth-child(2)')
    .should('contain.text', 'Statistika jídel');

  cy.get('div[data-component-id="statistika-vedoucich"] div.content-container').click();
  cy.get('div[data-component-id="statistika-vedoucich"]')
    .should('not.have.class', 'is-highlighted');

  cy.get('div:nth-child(2) > div.gap-3 > button.bg-primary').first().click();
  cy.get('div[data-component-id="statistika-jidel"]')
    .should(($el) => {
      expect($el).to.not.have.class('highlight-active');
      expect($el).to.not.have.class('is-highlighted');
    });
  cy.get('span.gap-1')
    .should('contain.text', 'Správná odpověď');
  cy.get('div.flex.p-4 button:nth-child(3)')
    .should('be.visible');
  cy.get('#statistika-jidel-pocet')
    .should('contain.text', '30');
  cy.get('input.ring')
    .should('have.value', '');
  cy.get('div.border.w-full div.gap-3')
    .should('contain.text', 'Vyhodnotit');

  cy.get('input.ring').click();
  cy.get('input.ring').click();
  cy.get('input.ring').click();
  cy.get('input.ring').type('30');
  cy.get('input.ring')
    .should('have.value', '30');

  cy.get('div.border.w-full button.bg-primary').first().click();
  cy.get('div.border.w-full div.justify-between span.flex')
    .should(($el) => {
      expect($el).to.have.class('bg-green/10');
      expect($el).to.have.class('text-green');
      expect($el).to.have.class('ring-green/25');
      expect($el).to.not.have.class('ring-accented');
      expect($el).to.not.have.class('text-default');
      expect($el).to.not.have.class('bg-elevated');
    });
  cy.get('div.border.w-full span.flex div.flex')
    .should(($el) => {
      expect($el).to.have.class('border-green-500');
      expect($el).to.have.class('bg-green-500');
      expect($el).to.not.have.class('border-gray-400');
    });
  cy.get('div.border.w-full button.bg-primary')
    .should('have.attr', 'disabled');
  cy.get('div.border.w-full div.gap-3 span.flex')
    .should('contain.text', 'Správná odpověď');
  expectScore('1.5');
  cy.get('input.ring')
    .should('have.attr', 'disabled');

  cy.wait(500);
  cy.get('#reset-system-button', { timeout: 10000 }).click();
  cy.wait(500);
  cy.get('#reset-all-button', { timeout: 10000 }).click();
  cy.wait(500);

  expectScore('0');
});
