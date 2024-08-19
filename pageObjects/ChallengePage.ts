import { expect, Locator, Page } from "@playwright/test";

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
        return this.page.locator('.result > button')
    }

    // Returns list of weighings locator
    get weighings(): Locator {
        return this.page.locator('.game-info li');
    }

    // Returns latest weighing (latest weighing will always be on the last list element)
    get latestWeighing(): Locator {
        return this.page.locator('.game-info li').last();
    }

    /**
     * Navigate to Fetch SDET Challenge website and verify page title is loaded
     */
    public async navigateToChallenge() {
        await this.page.goto('');
        // Expect a title
        await expect(this.page).toHaveTitle('React App');
    }

    /**
     * Return left bowl cell based on the index
     * @param {number} index
     */
    public leftBowlCell(index: number): Locator {
        return this.page.locator(`#left_${index}`);
    }

    /**
     * Return right bowl cell based on the index
     * @param {number} index
     */
    public rightBowlCell(index: number): Locator {
        return this.page.locator(`#right_${index}`);
    }

    /**
     * Reset weighing by clicking Reset button
     */
    public async resetWeigh() {
        await this.page.getByText('Reset').click()
    }

    /**
     * Return gold bar locator based on index at the end of the page
     * @param {number} index
     */
    public async goldBar(index: number) {
        return this.page.locator(`#coin_${index}`)
    }

    /**
     * Weight gold bars by following series of steps listed below
     * Steps:
     * 1. Reset weight to clear bowl values
     * 2. Enter gold bar numbers in both left and right bowls
     * 3. Click weigh button and wait for weighing results to populate
     * 4. Read the latest weighing result and return 0 or 1 or -1
     * @param {number[]} group1
     * @param {number[]} group2
     * @returns 0 or 1 or -1
     */
    public async weigh(group1: number[], group2: number[]): Promise<0 | 1 | -1> {
        // Reset weighings and clear bowl values
        await this.resetWeigh();

        // Enter gold bar numbers from group1 in left bowls
        for (const i of group1) {
            await this.leftBowlCell(i).fill(`${i}`);
        }

        // Enter gold bar numbers from group2 in right bowls
        for (const j of group2) {
            await this.rightBowlCell(j).fill(`${j}`);
        }

        // Read weight results count prior to clicking weigh button
        const prevWeighingResultsCount = await this.weighings.count();
        // Click weigh button
        await this.weightBtn.click();
        // Verify count is increased from previous Weighing Count
        await expect(this.weighings).toHaveCount(prevWeighingResultsCount + 1)

        // Read the latest weighing result
        let resultDetails = await this.latestWeighing.innerText();
        // Return 0 if both bowl weights are equal
        if (resultDetails.includes('=')) {
            return 0;
        }
        // Return -1 if left bowl is less than right bow;
        else if (resultDetails.includes('<')) {
            return -1;
        }
        // Return 1 if left bowl is greater than right bow;
        else if (resultDetails.includes('>')) {
            return 1;
        } else {
            throw Error(`Invalid weighing result: ${resultDetails}`)
        }
    }

    /**
     * Using divide and conquer method to find fake gold bar and returns the fake gold bar number
     * Steps:
     * 1. Divide gold bars into 3 groups with 3 bars each
     * 2. First weighing: Compare group1 and group2 weights
     * 3. Find fakeGroup based on first wighing results 
     * 4. Second weighing: compare two bars from the fake group
     * 5. Find fake bar based on seond weighing results
     * @param {number[]} goldBars
     * @returns {Promise<number>} fake gold bar number
     */
    public async findFakeGroup(goldBars: number[]): Promise<number> {
        // Divide gold bars into 3 groups with 3 bars each
        const group1 = goldBars.slice(0, 3);
        const group2 = goldBars.slice(3, 6);
        const group3 = goldBars.slice(6, 9);

        // First weighing: Compare group1 and group2 weights
        const result1 = await this.weigh(group1, group2);

        // Find fakeGroup based on first wighing results
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
            return goldBars.indexOf(fakeGroup[2]);
        } else if (result2 === -1) {
            // The first bar is the fake one
            return goldBars.indexOf(fakeGroup[0]);
        } else {
            // The second bar is the fake one
            return goldBars.indexOf(fakeGroup[1]);
        }
    }

}