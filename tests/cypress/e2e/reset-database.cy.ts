const appUrl = 'http://localhost:3000/information-system-learning-app/systems/2/nastenka';

it('does first two tasks', function() {
  cy.visit(appUrl)

  // Wait for the page to load - wait for 5000 ms
  cy.wait(3000)

  cy.get('#enter-system-button').click();
  // The 'Enter System' button is disabled.
  cy.get('#enter-system-button')
    .should('have.attr', 'disabled')
  // The icon on the 'Enter System' button has changed to a spinning loader.
  cy.get('#enter-system-button span.iconify')
    .should(($el) => {
      expect($el).to.have.class('i-lucide:loader-circle')
      expect($el).to.have.class('animate-spin')
      expect($el).to.not.have.class('i-lucide:rotate-cw')
    })

  cy.get('#task-1 div.items-start').click();
  // The task title '1. Nejstarší účastník' is visible.
  cy.get('h2.font-bold')
    .should('contain.text', '1. Nejstarší účastník')
  // The task description is visible.
  cy.get('p.text-base')
    .should('contain.text', 'V tomto úkolu bude vaším cílem správně určit věk nejstaršího účastníka. Zjistěte, která komponenta zobrazuje věk nejstaršího účastníka a zkontrolujte, jestli správně zobrazuje daný údaj. Správnou hodnotu můžete ověřit v databázi. Poté vyberte správné možnosti níže.')
  // The option 'Věk nejstaršího účastníka je zobrazován správně na nástěnce' is visible.
  cy.get('div.space-y-2 > div:nth-child(1)')
    .should('contain.text', 'Věk nejstaršího účastníka je zobrazován správně na nástěnce')
  // The option 'Komponenta zobrazuje věk nejstaršího vedoucího' is visible.
  cy.get('div.space-y-2 div:nth-child(2)')
    .should('contain.text', 'Komponenta zobrazuje věk nejstaršího vedoucího')
  // The option 'Namísto věku nejstaršího účastníka se zobrazuje věk nejmladšího' is visible.
  cy.get('div.space-y-2 div:nth-child(3)')
    .should('contain.text', 'Namísto věku nejstaršího účastníka se zobrazuje věk nejmladšího')
  // The option 'Žádná odpověď není správná' is visible.
  cy.get('div.space-y-2 div:nth-child(4)')
    .should('contain.text', 'Žádná odpověď není správná')

  cy.get('div:nth-child(3) > span.text-gray-800').click();
  // The task item is highlighted as selected.
  cy.get('div.space-y-2 div:nth-child(3)')
    .should(($el) => {
      expect($el).to.have.class('border-sky-400')
      expect($el).to.have.class('bg-sky-50')
      expect($el).to.not.have.class('border-gray-200')
      expect($el).to.not.have.class('hover:border-gray-300')
    })
  // The checkbox for the task is now checked.
  cy.get('div:nth-child(3) > div.rounded')
    .should(($el) => {
      expect($el).to.have.class('border-sky-500')
      expect($el).to.have.class('bg-sky-500')
      expect($el).to.not.have.class('border-gray-400')
    })

  cy.get('div:nth-child(2) > div.mt-2 > button.bg-primary').click();
  // The maximum age of a participant is now 14.
  cy.get('#statistika-max-vek-ucastnika-number')
    .should('contain.text', '14')
  // The 'Dokončeno' badge styling has been updated.
  cy.get('div:nth-child(2) > div.justify-between > span.flex')
    .should(($el) => {
      expect($el).to.have.class('bg-green/10')
      expect($el).to.have.class('text-green')
      expect($el).to.have.class('ring-green/25')
      expect($el).to.not.have.class('ring-accented')
      expect($el).to.not.have.class('text-default')
      expect($el).to.not.have.class('bg-elevated')
    })
  // A checkmark icon has been added to the 'Dokončeno' badge.
  cy.get('div:nth-child(2) > div.justify-between > span.flex > div.flex')
    .should(($el) => {
      expect($el).to.have.class('border-green-500')
      expect($el).to.have.class('bg-green-500')
      expect($el).to.not.have.class('border-gray-400')
    })
  // The 'Vyhodnotit' button is disabled.
  cy.get('div:nth-child(2) > div.mt-2 > button.bg-primary')
    .should('have.attr', 'disabled')
  // A 'Correct Answer' badge is displayed.
  cy.get('span.gap-1')
    .should('contain.text', 'Správná odpověď')

  cy.get('input.ring').click();
  cy.get('input.ring').type('14');
  // The input field now displays '14'.
  cy.get('input.ring')
    .should('have.value', '14')

  cy.get('div.border.w-full button.bg-primary').click();
  // The selected answer is now styled as correct.
  cy.get('div.border.w-full div.justify-between span.flex')
    .should(($el) => {
      expect($el).to.have.class('bg-green/10')
      expect($el).to.have.class('text-green')
      expect($el).to.have.class('ring-green/25')
      expect($el).to.not.have.class('ring-accented')
      expect($el).to.not.have.class('text-default')
      expect($el).to.not.have.class('bg-elevated')
    })
  // The checkbox for the selected answer is now checked and green.
  cy.get('div.border.w-full span.flex div.flex')
    .should(($el) => {
      expect($el).to.have.class('border-green-500')
      expect($el).to.have.class('bg-green-500')
      expect($el).to.not.have.class('border-gray-400')
    })
  // The submit button is disabled.
  cy.get('div.border.w-full button.bg-primary')
    .should('have.attr', 'disabled')
  // A 'Correct Answer' message is displayed.
  cy.get('div.border.w-full div.gap-3 span.flex')
    .should('contain.text', 'Správná odpověď')
  // The score has increased to 1.
  cy.get('span.score-trigger')
    .should('contain.text', 'Skóre: 1')
  // The answer input field is disabled.
  cy.get('input.ring')
    .should('have.attr', 'disabled')

  cy.get('div.flex.p-4 button:nth-child(3)').click();
  cy.get('#task-2').click();
  // The task title is now '2. Množství různých jídel v systému'.
  cy.get('h2.font-bold')
    .should('contain.text', '2. Množství různých jídel v systému')
  // The task description has been updated for the second task.
  cy.get('p.text-base')
    .should('contain.text', 'Na stránce Nástěnka jsou 4 komponenty, které zobrazují celkové počty účastníků, turnusů, vedoucích a jídel v turnusu. Zkontrolujte, která komponenta špatně zobrazuje daný údaj, a vyberte ji. Správnou hodnotu můžete ověřit v databázi anebo v SQL dotazu komponenty.')
  // A 'Zpět na seznam' button is visible.
  cy.get('div.flex.p-4 > button:nth-child(1)')
    .should('contain.text', 'Zpět na seznam')
  // The 'Vyhodnotit' button is enabled.
  cy.get('div:nth-child(2) > div.gap-3')
    .should('contain.text', 'Vyhodnotit')
  // The answer input field is visible.
  cy.get('input.ring')
    .should(($el) => {
      expect($el).to.have.attr('disabled')
      expect($el).to.have.value('')
    })
  // The 'Vyhodnotit' button for the answer input is visible.
  cy.get('div.border.w-full button.bg-primary')
    .should(($el) => {
      expect($el).to.have.attr('disabled')
      expect($el).to.contain.text('Vyhodnotit')
    })

  cy.get('div[data-component-id="statistika-jidel"] div.content-container').click();
  // The 'Statistika jídel' component is highlighted.
  cy.get('div[data-component-id="statistika-jidel"]')
    .should('have.class', 'is-highlighted')
  // A 'Statistika jídel' badge is displayed.
  cy.get('div:nth-child(2) > div.flex-wrap')
    .should('contain.text', 'Statistika jídel')

  cy.get('div.is-highlighted div.content-container').click();
  // The 'statistika-jidel' component is no longer highlighted.
  cy.get('div[data-component-id="statistika-jidel"]')
    .should('not.have.class', 'is-highlighted')

  cy.get('div[data-component-id="statistika-vedoucich"] div.content-container').click();
  // The 'statistika-vedoucich' component is highlighted.
  cy.get('div[data-component-id="statistika-vedoucich"]')
    .should('have.class', 'is-highlighted')
  // A 'Statistika vedoucích' badge is displayed.
  cy.get('div:nth-child(2) > div.flex-wrap')
    .should('contain.text', 'Statistika vedoucích')

  cy.get('div:nth-child(2) > div.gap-3 > button.bg-primary').click();
  // An 'Incorrect Answer' badge is displayed.
  cy.get('div.gap-3 span.flex')
    .should('contain.text', 'Nesprávná odpověď')
  // The score has changed from 1 to 0.5.
  cy.get('span.score-trigger')
    .should('contain.text', 'Skóre: 0.5')

  cy.get('div[data-component-id="statistika-jidel"] div.content-container').click();
  // The 'statistika-jidel' component is highlighted.
  cy.get('div[data-component-id="statistika-jidel"]')
    .should('have.class', 'is-highlighted')
  // A 'Statistika jídel' badge is displayed.
  cy.get('div:nth-child(2) > div.flex-wrap > span:nth-child(2)')
    .should('contain.text', 'Statistika jídel')

  cy.get('div[data-component-id="statistika-vedoucich"] div.content-container').click();
  // The 'statistika-vedoucich' component is no longer highlighted.
  cy.get('div[data-component-id="statistika-vedoucich"]')
    .should('not.have.class', 'is-highlighted')

  cy.get('div:nth-child(2) > div.gap-3 > button.bg-primary').click();
  // The 'statistika-jidel' component is no longer highlighted.
  cy.get('div[data-component-id="statistika-jidel"]')
    .should(($el) => {
      expect($el).to.not.have.class('highlight-active')
      expect($el).to.not.have.class('is-highlighted')
    })
  // A 'Correct Answer' badge is displayed.
  cy.get('span.gap-1')
    .should('contain.text', 'Správná odpověď')
  // The 'Zpět na seznam' button is visible.
  cy.get('div.flex.p-4 button:nth-child(3)')
    .should('be.visible')
  // The 'statistika-jidel-pocet' value has changed to 30.
  cy.get('#statistika-jidel-pocet')
    .should('contain.text', '30')
  // The input field for the second task is enabled.
  cy.get('input.ring')
    .should('have.value', '')
  // The 'Vyhodnotit' button for the second task is enabled.
  cy.get('div.border.w-full div.gap-3')
    .should('contain.text', 'Vyhodnotit')

  cy.get('input.ring').click();
  cy.get('input.ring').click();
  cy.get('input.ring').click();
  cy.get('input.ring').type('30');
  // The input field now displays '30'.
  cy.get('input.ring')
    .should('have.value', '30')

  cy.get('div.border.w-full button.bg-primary').click();
  // The answer badge is now styled as correct.
  cy.get('div.border.w-full div.justify-between span.flex')
    .should(($el) => {
      expect($el).to.have.class('bg-green/10')
      expect($el).to.have.class('text-green')
      expect($el).to.have.class('ring-green/25')
      expect($el).to.not.have.class('ring-accented')
      expect($el).to.not.have.class('text-default')
      expect($el).to.not.have.class('bg-elevated')
    })
  // A checkmark icon has been added to the answer badge.
  cy.get('div.border.w-full span.flex div.flex')
    .should(($el) => {
      expect($el).to.have.class('border-green-500')
      expect($el).to.have.class('bg-green-500')
      expect($el).to.not.have.class('border-gray-400')
    })
  // The submit button is disabled.
  cy.get('div.border.w-full button.bg-primary')
    .should('have.attr', 'disabled')
  // A 'Correct Answer' badge is displayed.
  cy.get('div.border.w-full div.gap-3 span.flex')
    .should('contain.text', 'Správná odpověď')
  // The score has increased to 1.5.
  cy.get('span.score-trigger')
    .should('contain.text', 'Skóre: 1.5')
  // The answer input field is disabled.
  cy.get('input.ring')
    .should('have.attr', 'disabled')

  cy.get('div.flex.p-4 button:nth-child(3)').click();
  // The 'Účastníci' navigation item is now an enabled link.
  cy.get('a.hover\\:bg-white\\/50')
    .should(($el) => {
      expect($el).to.be.visible
      expect($el).to.have.attr('href', '/information-system-learning-app/systems/2/ucastnici')
    })
  cy.get('a[href="/information-system-learning-app/systems/2/ucastnici"] span.font-medium').click();
  cy.url().should('include', '/systems/2/ucastnici')
  cy.wait(100)

  cy.scrollTo('top', { ensureScrollable: false })
  cy.get('#smazat-ucastnika-tlacitko:visible').first().click()
  cy.wait(500)
  cy.scrollTo('top', { ensureScrollable: false })
  cy.wait(600)

  cy.get('#go-to-database-button').click()
  cy.url().should('include', '/systems/2/database')
  cy.get('#reset-database-button').click()
  cy.wait(1000)

  cy.get('a[href="/information-system-learning-app/systems/2/ucastnici"] span.font-medium').click()
  cy.url().should('include', '/systems/2/ucastnici')
  cy.wait(1000)
})
