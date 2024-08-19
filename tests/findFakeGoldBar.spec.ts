import { test, expect, Locator } from '@playwright/test';
import { ChallengePage } from '../pageObjects/ChallengePage';

let goldBars: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]
let fakeBar: Locator;
let alertMessage: string;
let weighingsList: string[];

test('Fetch Coding Exercise - SDET: Find fake gold bar', async ({ page }) => {
  const challengePage = new ChallengePage(page);

  // Navigate to Fetch SDET Challenge website
  await challengePage.navigateToChallenge();

  // Verify page is loaded and 2 bowls are displayed (i.e., left bowl, right bowl)
  await expect(challengePage.bowls).toHaveText(['left bowl', 'right bowl']);

  // Using divide and conquer to find the fake gold bar
  // Find fake gold bar number which weighs less than others
  const fakeBarNumber = await challengePage.findFakeGroup(goldBars);

  // Fake gold bar locator
  fakeBar = await challengePage.goldBar(goldBars[fakeBarNumber]);

  // Wait for dialog event and execute below commands after dialog event is triggered
  page.on('dialog', async (dialog) => {
    alertMessage = dialog.message();
    // Verify dialog message to contains success message
    expect(alertMessage).toEqual('Yay! You find it!');
    // Close dialog by OK button
    await dialog.accept();
  });

  // Trigger dialog event by clicking fake bar
  await fakeBar.click();

  // Print log statement with fake gold bar number
  console.log(`\nFake Gold Bar Number: ${await fakeBar.innerText()}`);
  // Print alert message
  console.log(`\nAlert message: ${alertMessage}`);
  // Print number of weighings
  console.log(`\nNumber of weighings: ${await challengePage.weighings.count()}`);
  weighingsList = await challengePage.weighings.allInnerTexts();
  // List of weighings made
  console.log(`\nList of weighings made:`);
  weighingsList.forEach((weighing, index) => {
    console.log(`${index + 1}. ${weighing}`);
  });
});