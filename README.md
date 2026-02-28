# Project 1 - Create a Web Application Using ES6 and New JavaScript Features
## Assignment Directions
### Background
In this solo project, you will create a web application using modern JavaScript that responds to user input with dynamic data from an external web API.

### Requirements
To receive full credit for this assignment, the finished application MUST:

- Incorporate the following ES6 features:
    - [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
    - [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
    - [Object or Array Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)
    - [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
    - [`let` and `const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)

- Respond to user input with dynamic data from one or more REST APIs that return JSON data. 
    - You may use a site like [publicapis.dev](https://publicapis.dev/) to search for APIs. Ensure the API uses HTTPS, supports CORS, and is open use or requires an API key.
- Have a consistent theme and purpose.
- Include enough styling to present a polished, usable interface. While this is a JavaScript project, the application should not appear unfinished or unstyled.
- Use `localStorage` to save and retrieve user-specific data (e.g., favorites, preferences, or last search results).
- Be responsive on mobile, tablet, and desktop devices.
- Be deployed to GitHub Pages.
- Include a README.md describing the project purpose, API used, and note where key ES6 features were implemented.

In addition, the application **MUST NOT**:
- Use the OpenWeather API or the PokeAPIs.
- Contain any lorem text.
- Use Bootstrap, jQuery, or any other 3rd party JavaScript libraries.

### Example Project Themes

Project ideas that would meet the above requirements:

1. **Movie Database/Search**: Use a movie API (e.g., OMDb API) to allow users to search for movies, view details, and potentially save favorites.
1. **News Aggregator**: Integrate with a news API (e.g., News API) to display headlines and articles, potentially with filtering by category or source.
1. **Recipe Finder**: Utilize a recipe API (e.g., Spoonacular API) to search for recipes based on ingredients, diet, or cuisine, and display detailed instructions.

Project ideas that would **NOT** meet the above requirements:

1. **Random Dog/Cat Image**: A website with a button to fetch a random animal image.
1. **Random Quote**: Click a button to fetch a random quote, or load a quote at random when the page loads.

### Submission

Please include **BOTH** the repository link as well as the live site link in your submission.

## Information About The Project
### Project Purpose
The purpose of this project is to bring awareness to the different parks and public lands that the National Park Service protects and maintains. Using the [National Park Service API](https://www.nps.gov/subjects/developer/index.htm) this web application creates a fun game where users guess what national park is being displayed.

### Where ES6 features were implemented
- [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
    - In the following functions:
        - getParks (lines 31, and 34)
        - setupGame (line 101)
- [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
    - In the following functions:
        - getParks (line 31)
        - changeImage (line 229)
- [Object or Array Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)
    - In the following functions:
        - setupGame (line 109)
        - displayPark (line 144)
- [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
    - outside of the functions (line 335)
    - In the following functions:
        - displayPark (lines 171 and 199)
- [`let` and `const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
    - outside of the functions (lines 1, 12-25, and 335)
    - In the following functions:
        - getParks (lines 29, 31, 36, and 43)
        - setupGame (lines 76, 87, 90, 93, 109, 113, 115, and 126)
        - displayPark (lines 139, 144, 147, 149, 151, 164, 167, 177, 181, 182, 195, and 208)
        - displayScoreboard (lines 219-220)
        - changeImage (lines 229, and 230)
        - isLetter (line 265)
        - processUserGuess (lines 275, 282, 283, 286, 290, 303, 307, 310, 316, and 319)
        - Arrow functions (lines 339 and 341)

### Where localStorage was implemented
In the following functions:
    - getLocalStorage
    - setLocalStorage
    - removeLocalStorage

### Important URLs
Github URL: https://github.com/Fell67/com6338-project-1-abreu-victoria
Website URL: https://fell67.github.io/com6338-project-1-abreu-victoria/
