const appUrl = 'http://localhost:3000/information-system-learning-app/systems/skolni_tabor_palava/nastenka';

function setTeacherMode(value: boolean) {
  return cy.window().should((win) => {
    expect(win.__informationSystemTestApi).to.not.equal(undefined);
  }).then((win) => win.__informationSystemTestApi!.setTeacherMode(value));
}

function clickButton(name: string, index = 0) {
  cy.get('button').filter(`:contains("${name}")`).eq(index).click()
}

function evaluate(index = 0) {
  clickButton('Vyhodnotit', index)
  cy.wait(400)
}

function fillAnswer(value: string) {
  cy.get('input[placeholder="Vaše odpověď"], input[aria-label="Vaše odpověď"]')
    .first()
    .clear()
    .type(value)
}

function getCodeBlockEditor(codeBlockId: string) {
  return cy.window().should((win) => {
    expect((win as any).__codeBlockEditors?.[codeBlockId]).to.exist
  }).then((win) => (win as any).__codeBlockEditors[codeBlockId])
}

function appendCodeBlockValue(codeBlockId: string, value: string) {
  cy.wait(500)
  getCodeBlockEditor(codeBlockId).then((editor) => {
    const currentValue = editor.getValue()
    editor.setValue(`${currentValue.trimEnd()}\n${value}`)
  })
  cy.wait(500)
}

function replaceCodeBlockValue(codeBlockId: string, search: string, replacement: string) {
  cy.wait(500)
  getCodeBlockEditor(codeBlockId).then((editor) => {
    editor.setValue(editor.getValue().replace(search, replacement))
  })
  cy.wait(500)
}

function expectScore(value: string) {
  cy.contains('.tasks-column span', `Skóre: ${value}`).should('be.visible')
}

function expectEditComponentDialog(componentName: string) {
  cy.contains('[role="dialog"] h2, [role="dialog"] [id^="reka-dialog-title"]', 'Upravit komponentu')
    .should('be.visible')
  cy.contains('[role="dialog"] span.ring', componentName)
    .should('be.visible')
}

it('task', function () {
  cy.visit(appUrl)


  // Wait for the page to load - wait for 5000 ms
  /*
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
  */

  cy.get('#task-1 div.items-start', { timeout: 30000 }).should('be.visible');
  setTeacherMode(false);
  cy.get('#task-1 div.items-start', { timeout: 30000 }).click();
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

  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
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

  cy.get('input.ring').first().click();
  cy.get('input.ring').type('14');
  // The input field now displays '14'.
  cy.get('input.ring')
    .should('have.value', '14')

  cy.get('#evaluate-finish-button').click();
  cy.wait(300)
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
  expectScore('1')
  // The answer input field is disabled.
  cy.get('input.ring')
    .should('have.attr', 'disabled')

  cy.contains('button', 'Zpět na seznam').click();
  cy.get('#task-2').click();
  // The task title is now '2. Nalezení chybné komponenty'.
  cy.get('h2.font-bold')
    .should('contain.text', '2. Nalezení chybné komponenty')
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

  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
  // An 'Incorrect Answer' badge is displayed.
  cy.get('div.gap-3 span.flex')
    .should('contain.text', 'Nesprávná odpověď')
  // The score has changed from 1 to 0.5.
  expectScore('0.5')

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

  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
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

  cy.get('input.ring').first().click();
  cy.get('input.ring').first().click();
  cy.get('input.ring').first().click();
  cy.get('input.ring').type('30');
  // The input field now displays '30'.
  cy.get('input.ring')
    .should('have.value', '30')

  cy.get('#evaluate-finish-button').click();
  cy.wait(300)
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
  expectScore('1.5')
  // The answer input field is disabled.
  cy.get('input.ring')
    .should('have.attr', 'disabled')

  cy.contains('button', 'Zpět na seznam').click();
  // The 'Účastníci' navigation item is now an enabled link.
  cy.get('a[href="/information-system-learning-app/systems/skolni_tabor_palava/ucastnici"]')
    .should('be.visible')
  // Task 6 is now visible.
  cy.get('#task-6')
    .should('have.attr', 'aria-disabled', 'true')
  // Task 7 is now visible.
  cy.get('#task-7')
    .should('have.attr', 'aria-disabled', 'true')
  // Task 8 is now visible.
  cy.get('#task-8')
    .should('have.attr', 'aria-disabled', 'true')

  cy.get('#task-3').click();
  // The 'Zpět na seznam' button is visible.
  cy.get('div.flex.p-4 > button:nth-child(1)')
    .should('contain.text', 'Zpět na seznam')
  // The task title is now '3. Alergeny účastníka'.
  cy.get('h2.font-bold')
    .should('contain.text', '3. Alergeny účastníka')
  // The task description has been updated for the third task.
  cy.get('p.text-base')
    .should('contain.text', 'Denisa Kolmanová je alergická na sezam a mléko, ale v systému je uvedeno pouze, že je alergická na mléko. Upravte záznam účastníka, aby měl oba alergeny, a zjistěte, v čem je problém.')

  cy.get('a[href="/information-system-learning-app/systems/skolni_tabor_palava/ucastnici"] span.font-medium').click();
  cy.get('div:nth-child(2) > span.text-gray-800').click();
  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
  cy.get('div:nth-child(6) button.ring span.truncate').first().click();
  cy.get('#edit-vstup_alergeny_ucastnika-27 label:nth-child(11)').click();
  cy.get('#edit-vstup_alergeny_ucastnika-27 input[value="11"]').check();
  cy.get('#system-edit_btn_ulozit_ucastnika').click();
  cy.get('#evaluate-finish-button').click();
  cy.wait(300)
  cy.contains('button', 'Zpět na seznam').click();
  cy.get('#task-4 div.items-start').click();
  cy.get('div:nth-child(2) > span.text-gray-800').click();
  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
  cy.contains('button', 'Zpět na seznam').click();
  cy.get('#task-5 span.font-medium').click();
  cy.get('div:nth-child(2) > span.text-gray-800').click();
  cy.get('div:nth-child(3) > span.text-gray-800').click();
  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
  cy.get('input[placeholder="Vaše odpověď..."]').first().click();
  cy.get('input[placeholder="Vaše odpověď..."]').first().click();
  cy.get('input[placeholder="Vaše odpověď..."]').type('10');
  cy.get('#evaluate-finish-button').click();
  cy.wait(300)
  cy.contains('button', 'Zpět na seznam').click();
  cy.get('#task-6 div.items-start').click();
  cy.get('a[href="/information-system-learning-app/systems/skolni_tabor_palava/turnusy"] span.font-medium').click();
  cy.get('span.mobile-hidden').first().click();
  // The first turnus is now in edit mode.
  cy.get('div:nth-child(1) > div.border-b.flex > div.component-wrapper > div.content-container')
    .should('have.class', 'edit-mode')
  // The second turnus is now in edit mode.
  cy.get('div:nth-child(1) > div.flex-wrap > div[data-component-id="datum-turnusu"] > div.content-container')
    .should('have.class', 'edit-mode')
  // The third turnus is now in edit mode.
  cy.get('div:nth-child(1) > div.flex-wrap > div[data-component-id="pocet-dni-turnusu"] > div.content-container')
    .should('have.class', 'edit-mode')
  // The fourth turnus is now in edit mode.
  cy.get('div:nth-child(1) > div[data-component-id="kapacita-turnusu"] > div.content-container')
    .should('have.class', 'edit-mode')
  // The fifth turnus is now in edit mode.
  cy.get('div:nth-child(1) > div[data-component-id="stitek-poctu-ucastniku-turnusu"] > div.content-container')
    .should('have.class', 'edit-mode')
  // The sixth turnus is now in edit mode.
  cy.get('div:nth-child(1) > div[data-component-id="seznam-ucastniku-turnusu"] > div.content-container')
    .should('have.class', 'edit-mode')
  // The seventh turnus is now in edit mode.
  cy.get('div:nth-child(1) > div[data-component-id="stitek-poctu-vedoucich-turnusu"] > div.content-container')
    .should('have.class', 'edit-mode')
  // The eighth turnus is now in edit mode.
  cy.get('div:nth-child(1) > div[data-component-id="seznam-vedoucich-turnusu"] > div.content-container')
    .should('have.class', 'edit-mode')

  cy.get('div:nth-child(3) > div.flex-wrap > div[data-component-id="pocet-dni-turnusu"] > div.edit-mode > div:nth-child(1) > span.edit-icon > svg').click();
  // The page body is now unclickable and hidden from overflow.
  cy.get('body')
    .should('have.attr', 'style', 'pointer-events: none; overflow: hidden;')
  // The main application content is now hidden from assistive technologies.
  cy.get('div.isolate')
    .should('have.attr', 'aria-hidden', 'true')
  // A new dialog box has appeared.
  cy.get('div.h-full')
    .should('be.visible')
  // The dialog box title is 'Upravit komponentu'.
  expectEditComponentDialog('Počet dní turnusu')
  // The dialog box is editing the 'Počet dní turnusu' component.
  // The 'Uložit změny' button is visible.
  cy.get('button.ml-auto')
    .should(($el) => {
      expect($el).to.be.visible
      expect($el).to.contain.text('Uložit změny')
    })
  // The close button for the dialog is visible.
  cy.get('button.absolute')
    .should('be.visible')
  // The SQL code is marked as 'Správně'.
  cy.get('span.ring')
    .should(($el) => {
      expect($el).to.be.visible
      expect($el).to.contain.text('Správně')
    })

  appendCodeBlockValue('code-js', 'const pocet = pocet_dni_turnusu + 1')
  replaceCodeBlockValue('code-html', 'pocet_dni_turnusu', 'pocet')

  cy.contains('button', 'Uložit změny').click();
  // The page body is now clickable and overflow is no longer hidden.
  cy.get('body.underline-links')
    .should('have.attr', 'style', '')
  // The main application content is no longer hidden from assistive technologies.
  cy.get('div.isolate')
    .should('not.have.attr', 'aria-hidden')

  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
  // The 'Dokončeno' badge is now green with a checkmark.
  cy.get('div:nth-child(2) > div.justify-between > span.flex')
    .should(($el) => {
      expect($el).to.have.class('bg-green/10')
      expect($el).to.have.class('text-green')
      expect($el).to.have.class('ring-green/25')
      expect($el).to.not.have.class('ring-accented')
      expect($el).to.not.have.class('text-default')
      expect($el).to.not.have.class('bg-elevated')
    })
  // The 'Vyhodnotit' button is disabled.
  cy.get('div:nth-child(2) > div.gap-3 > button.bg-primary')
    .should('have.attr', 'disabled')
  // A 'Správná odpověď' badge is displayed.
  cy.get('span.gap-1')
    .should('contain.text', 'Správná odpověď')
  // The answer input field is enabled.
  cy.get('input.ring')
    .should('have.value', '')
  // The 'Vyhodnotit' button for the answer input is enabled.
  cy.get('div.border.w-full div.gap-3')
    .should('contain.text', 'Vyhodnotit')

  cy.get('input.ring').first().click();
  cy.get('input.ring').type('7');
  cy.get('#evaluate-finish-button').click();
  cy.wait(300)
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
  // The score has increased to 10.5.
  expectScore('10.5')
  // The answer input field is disabled.
  cy.get('input.ring')
    .should('have.attr', 'disabled')

  cy.contains('button', 'Zpět na seznam').click();
  // Task 8 is now visible.
  cy.get('#task-8')
    .should('have.attr', 'aria-disabled', 'true')

  cy.get('#task-7').click();
  // The task title is now '7. Naplnění turnusu'.
  cy.get('h2.font-bold')
    .should('contain.text', '7. Naplnění turnusu')
  // The task description has been updated for the seventh task.
  cy.get('p.text-base')
    .should('contain.text', 'Zjistěte stav zaplnění turnusu č. 1. Turnus je skoro plný (tj. štítek SKORO PLNO), pokud má zaplnění větší nebo rovno 80% kapacity. Funguje komponenta pro stav turnusu správně? Pokud ne, bude ji potřeba opravit.')
  // A 'Zpět na seznam' button is visible.
  cy.get('div.flex.p-4 > button:nth-child(1)')
    .should('contain.text', 'Zpět na seznam')

  cy.get('div:nth-child(3) > div.border-b.flex > div.component-wrapper > div.edit-mode > div:nth-child(1) > span.edit-icon > svg').click();
  // The page body is now unclickable and hidden from overflow.
  cy.get('body.underline-links')
    .should('have.attr', 'style', 'pointer-events: none; overflow: hidden;')
  // The main application content is now hidden from assistive technologies.
  cy.get('div.isolate')
    .should('have.attr', 'aria-hidden', 'true')
  // A new dialog box has appeared.
  cy.get('div.h-full')
    .should('be.visible')
  // The dialog box title is 'Upravit komponentu'.
  expectEditComponentDialog('Štítek stavu turnusu')
  // The dialog box is editing the 'Štítek stavu turnusu' component.
  // The 'Uložit změny' button is visible.
  cy.get('button.ml-auto')
    .should(($el) => {
      expect($el).to.be.visible
      expect($el).to.contain.text('Uložit změny')
    })
  // The close button for the dialog is visible.
  cy.get('button.absolute')
    .should('be.visible')
  // The SQL code is marked as 'Správně'.
  cy.get('span.ring')
    .should(($el) => {
      expect($el).to.be.visible
      expect($el).to.contain.text('Správně')
    })

  replaceCodeBlockValue('code-js', 'celkova_kapacita * 0.3', 'celkova_kapacita * 0.8')
  cy.contains('button', 'Uložit změny').click();
  // The page body is now clickable and overflow is no longer hidden.
  cy.get('body.underline-links')
    .should('have.attr', 'style', '')
  // The main application content is no longer hidden from assistive technologies.
  cy.get('div.isolate')
    .should('not.have.attr', 'aria-hidden')

  cy.get('#evaluate-activity-button').click();
  cy.wait(300)
  // The 'Dokončeno' badge is now green with a checkmark.
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
  cy.get('div:nth-child(2) > div.gap-3 > button.bg-primary')
    .should('have.attr', 'disabled')
  // A 'Správná odpověď' badge is displayed.
  cy.get('span.gap-1')
    .should('contain.text', 'Správná odpověď')
  // The 'Vyhodnotit' button for the answer input is enabled.
  cy.get('div.border.w-full div.mt-2')
    .should('contain.text', 'Vyhodnotit')

  cy.get('div:nth-child(3) > div.rounded').click();
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

  cy.get('#evaluate-finish-button').click();
  cy.wait(300)
  cy.contains('button', 'Zpět na seznam').click();
  cy.get('a[href="/information-system-learning-app/systems/skolni_tabor_palava/vedouci"] span.font-medium').click();
  cy.get('div:nth-child(6) button.ring span.truncate').first().click();
  cy.get('div[data-component-id="edit-vstup-jmeno-vedouciho"] svg').click();
  replaceCodeBlockValue('code-js', 'delka_jmena === 2', 'delka_jmena >= 2')
  cy.contains('button', 'Uložit změny').click();
  cy.get('#system-edit_vstup_jmeno_vedouciho').click();
  cy.get('#system-edit_vstup_jmeno_vedouciho').clear();
  cy.get('#system-edit_vstup_jmeno_vedouciho').type('Tomáš Garrigue Masaryk');
  cy.get('#system-edit_btn_ulozit_vedouciho')
    .should('not.be.disabled')
    .click();
  cy.get('#task-8 span.font-medium').click();
  cy.get('#evaluate-finish-button').click();
  cy.wait(300)
  expectScore('15.5')
});
