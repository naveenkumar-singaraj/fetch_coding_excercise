import { expect, Locator, Page } from "@playwright/test";

/**
 * Page object class for Fetch: SDET Challenge webpage
 * Contains getters, api/methods interacting locators in SDET challenge web page
 */
export class ChallengePage {
    private page: Page
    constructor(page: Page) {
        this.page = page;
    }

    // Returns bowl locator (matches left and right bowl)
    get bowls(): Locator {
        return this.page.locator('.game-board');
    }

    // Returns Weigh button locator
    get weightBtn(): Locator {
        return this.page.locator('#weigh');
    }

    // Returns Result (=) button locator 
    get resultBtn(): Locator {
        return this.page.locator('.result > button');
    }

    // Returns list of weighings locator
    get weighings(): Locator {
        return this.page.locator('.game-info li');
    }

    // Returns latest weighing (latest weighing will always be on the last list element)
    get latestWeighing(): Locator {
        return this.page.locator('.game-info li').last();
    }

    // Returns locator of left bowl cells
    get leftBowlCells(): Locator {
        return this.page.locator('[data-side="left"]');
    }

    // Returns locator of right bowl cells
    get rightBowlCells(): Locator {
        return this.page.locator('[data-side="right"]');
    }

    /**
     * Navigate to Fetch SDET Challenge website and verify page title is loaded
     */
    public async navigateToChallengeWebPage() {
        // Navigate to base URL mentioned in Config file
        await this.page.goto('');
        // Expect a title
        await expect(this.page).toHaveTitle('React App');
    }

    /**
     * Reset weighing by clicking Reset button
     */
    public async resetWeigh() {
        await this.page.getByText('Reset').click();
        // Verify reset is applied, Result icon changes ? from =
        await expect(this.page.locator('.result #reset')).toHaveText('?');
    }

    /**
     * Return gold bar locator based on index at the end of the page
     * @param {number} index
     */
    public async goldBar(index: number) {
        return this.page.locator(`#coin_${index}`);
    }

    /**
     * Weigh gold bars by following series of steps listed below
     * Steps:
     * 1. Reset weight to clear bowl values
     * 2. Enter gold bar numbers in both left and right bowls
     * 3. Click weigh button and wait for weighing results to populate
     * 4. Read the latest weighing result and return 0 or 1 or -1 based on result
     * @param {number[]} group1
     * @param {number[]} group2
     * @returns 0 or 1 or -1
     */
    public async weigh(group1: number[], group2: number[]): Promise<0 | 1 | -1> {
        // Reset weighings and clear bowl values
        await this.resetWeigh();

        // Enter gold bar numbers from group1 in left bowl & group 2 in right bowl
        await this.fillBowls(group1, this.leftBowlCells);
        await this.fillBowls(group2, this.rightBowlCells);

        // Read weight results count prior to clicking weigh button
        const prevWeighingResultsCount = await this.weighings.count();
        // Click weigh button
        await this.weightBtn.click();
        // Verify count is increased from previous Weighing Count
        await expect(this.weighings).toHaveCount(prevWeighingResultsCount + 1)

        // Read the latest weighing result
        let resultDetails = await this.latestWeighing.innerText();
        return this.parseWeighingResult(resultDetails);
    }

    /**
     * Fill bowl cell values with numbers
     * @param {number[]} group numbers to be filled
     * @param {Locator} bowlCell locator of the left/right bowl cell
     */
    private async fillBowls(group: number[], bowlCell: Locator) {
        for (const i of group) {
            await bowlCell.nth(i).fill(`${i}`);
        }
    }
    /**
     * Parse weight results based on comparaision indicator i.e., =,<,>
     * @param {string} resultDetails weighing result string
     * @returns {0 | 1 | -1}
     */
    private parseWeighingResult(resultDetails: string): 0 | 1 | -1 {
        if (resultDetails.includes('=')) {
            return 0;
        } else if (resultDetails.includes('<')) {
            return -1;
        } else if (resultDetails.includes('>')) {
            return 1;
        } else {
            throw new Error(`Invalid weighing result: ${resultDetails}`);
        }
    }

    /**
     * Using divide and conquer method to find fake gold bar and returns the fake gold bar number
     * Steps:
     * 1. Divide gold bars into 3 groups with 3 bars each
     * 2. First weighing: Compare group1 and group2 weights
     * 3. Find fakeGroup based on first weighing results 
     * 4. Second weighing: compare two bars from the fake group
     * 5. Find fake bar based on seond weighing results
     * @param {number[]} goldBarIndexes
     * @returns {Promise<number>} fake gold bar number
     */
    public async findFakeGoldBar(goldBarIndexes: number[]): Promise<number> {
        // Divide gold bars into 3 groups with 3 bars each
        const group1 = goldBarIndexes.slice(0, 3);
        const group2 = goldBarIndexes.slice(3, 6);
        const group3 = goldBarIndexes.slice(6, 9);

        // First weighing: Compare group1 and group2 weights
        const result1 = await this.weigh(group1, group2);

        // Find fakeGroup based on first weighing results
        let fakeGroup: number[];
        if (result1 === 0) {
            // Group1 and group2 are equal, the fake bar is in group3
            fakeGroup = group3;
        } else if (result1 === -1) {
            // Group1 is lighter, the fake bar is in group1
            fakeGroup = group1;
        } else {
            // Group2 is lighter, the fake bar is in group2
            fakeGroup = group2;
        }

        // Second weighing: compare two bars from the fake group
        const result2 = await this.weigh([fakeGroup[0]], [fakeGroup[1]]);

        // Find fake bar based on seond weighing results
        if (result2 === 0) {
            // The third bar is the fake one
            return goldBarIndexes.indexOf(fakeGroup[2]);
        } else if (result2 === -1) {
            // The first bar is the fake one
            return goldBarIndexes.indexOf(fakeGroup[0]);
        } else {
            // The second bar is the fake one
            return goldBarIndexes.indexOf(fakeGroup[1]);
        }
    }

}