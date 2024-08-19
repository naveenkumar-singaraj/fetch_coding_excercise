# Fetch Coding Exercise - SDET
This repository contains solution for Fetch coding excercise - SDET.

#  How to setup and run tests in local machine
#   Prerequisites
1. Before you can run the program, make sure you have the `Node.js` (>= 20.16.0) installed. You can install `Node.js` by visiting the official [Node.js](https://nodejs.org/en) website and downloading the latest LTS version. 

2. Install `git` to clone the repository in local machine. Download and install the latest version of [Git](https://git-scm.com/downloads).

#   Setup
Clone this repository to your local machine using Git - HTTPS:
```
git clone https://github.com/naveenkumar-singaraj/fetch_coding_excercise.git
```

Navigate to the project directory:
```
cd fetch_coding_excercise
```
#   Install the project dependencies:
Install project dependencies and playwight browsers (including chromium) to run tests. By default, playwright tests are launched in chromium browsers
```
npm ci

npx playwright install --with-deps
```
#   Running the Tests
Run the test in headed mode using below command:
```
npm run test
```