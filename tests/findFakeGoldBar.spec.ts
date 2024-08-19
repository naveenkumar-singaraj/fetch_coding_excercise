import { test, expect, Locator } from '@playwright/test';
import { ChallengePage } from '../pageObjects/ChallengePage';

let goldBars: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]
let fakeBar: Locator;

test('Fetch Coding Exercise - SDET: Find fake gold bar', async ({ page }) => {
  const challengePage = new ChallengePage(page);

  // Navigate to Fetch SDET Challenge websire
  await challengePage.navigateToChallenge();

  // Verify page is loaded and 2 bowls are displayed (i.e., left bowl, right bowl)
  await expect(challengePage.bowls).toHaveText(['left bowl', 'right bowl'])

  // Find fake gold bar number which weighs less than others
  const fakeBarNumber = await challengePage.findFakeGroup(goldBars);

  // Fake gold bar locator
  fakeBar = await challengePage.goldBar(goldBars[fakeBarNumber]);

  // Wait for dialog event and execute below commands
  page.on('dialog', async (dialog) => {
    // Verify dialog message to contains success message
    expect(dialog.message()).toEqual('Yay! You find it!');
    // Close dialog by OK button
    await dialog.accept();
  });

  // Trigger dialog event by clicking fake bar
  await fakeBar.click()

  console.log(`Fake Gold Bar: ${await fakeBar.innerText()}`)
});