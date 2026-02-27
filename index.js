const localStorageKeys = {
    parksLoaded: 'parksLastLoaded',
    wins: 'wins',
    losses: 'losses',
    incorrectGuesses: 'incorrectGuesses',
    guessesLeft: 'guessesLeft',
    hiddenName: 'hiddenName',
    currentPark: 'currentPark',
    previousPark: 'previousPark'
}

const gameElementId = 'game'
const userFormId = 'user-form'
const hiddenNameElementId = 'hidden-name'
const winsElementId = 'wins'
const lossesElementId = 'losses'
const previousParkElementId = 'previous-park'
const incorrectGuessesElementId = 'incorrect-guesses'
const guessesLeftElementId = 'guesses-left'

const userGuessElement = document.getElementById(userFormId)

const maxIncorrectGuesses = 5

// Get the parks from the api
async function getParks (start) {
    const apiKey = 'DzQ19snS6xQGbpY6Uqn6KGSveSvMJnXiXGXKia7w'
    try {
        let response = await fetch(`https://developer.nps.gov/api/v1/parks?start=${start}&api_key=${apiKey}`)
        // if the status code is 200 then we are good to continue else there is an issue
        if (response.status === 200) {
            return await response.json()
        } else {
            const errorObj = {
                errorCode: response.status,
                statusText: response.statusText
            }
            return errorObj
        }
    } catch (error) {
        const errorObj = {
            errorCode: 'Unable to fetch the information',
            statusText: error
        }
        return errorObj
    }
}

// Setup the game
async function setupGame (start = 0) {
    let parksData = JSON.parse(localStorage.getItem(localStorageKeys.parksLoaded))

    // If the game is being restarted then reset the game else get the information for the current game
    if (!parksData) {
        localStorage.setItem(localStorageKeys.wins, 0)
        localStorage.setItem(localStorageKeys.losses, 0)
        localStorage.setItem(localStorageKeys.guessesLeft, maxIncorrectGuesses)
        localStorage.removeItem(localStorageKeys.incorrectGuesses)
    }

    // Set the previous park, incorrect guessed, and guesses left
    const incorrectGuessesElement = document.getElementById(incorrectGuessesElementId)
    incorrectGuessesElement.textContent = (localStorage.getItem(localStorageKeys.incorrectGuesses) ? JSON.parse(localStorage.getItem(localStorageKeys.incorrectGuesses)) : 'None')

    const guessesLeftElement = document.getElementById(guessesLeftElementId)
    guessesLeftElement.textContent = (localStorage.getItem(localStorageKeys.guessesLeft) ? localStorage.getItem(localStorageKeys.guessesLeft) : maxIncorrectGuesses)

    const previousParkElement = document.getElementById(previousParkElementId)
    previousParkElement.textContent = (localStorage.getItem(localStorageKeys.previousPark) ? JSON.parse(localStorage.getItem(localStorageKeys.previousPark)).name : 'None')

    // Display the score card to the user
    displayScoreboard()

    // If we are not in the middle of a game then get the parks
    if (!parksData || Number(parksData.start) !== start) {
        parksData = await getParks(start)

        if (parksData.errorCode) {
            console.error('Unable to get the park information. error ' + parksData.errorCode + ': ' + parksData.statusText)
            return
        } else {
            localStorage.setItem(localStorageKeys.parksLoaded, JSON.stringify(parksData))
        }
    } else {
        parksData = JSON.parse(localStorage.getItem(localStorageKeys.parksLoaded))
    }

    const { data:parks, limit:numberOfParksLoaded, start:startingPoint, total} = parksData

    // Pick a park at random and remove it from the array if we are not already guessing at a park
    if (parks.length !== 0) {
        let park
        if (!localStorage.getItem(localStorageKeys.currentPark)) {
            const parkToSelect = Math.floor(Math.random() * parks.length)
            park = parks[parkToSelect]
            parks.splice(parkToSelect, 1)
            localStorage.setItem(localStorageKeys.parksLoaded, JSON.stringify(parksData))
        } else {
            park = JSON.parse(localStorage.getItem(localStorageKeys.currentPark))
        }
        
        displayPark(park)
    } else {
        // Get the next set of parks if there are any left else the user has finished the game
        const nextStartingPoint = Number(startingPoint) + Number(numberOfParksLoaded) + 1
        if (Number(total) >= nextStartingPoint) {
            setupGame(nextStartingPoint)

        } else {
            localStorage.removeItem(localStorageKeys.parksData)
        }
    }
}

// Display the chosen park to the user
function displayPark (park) {
    const gameElement = document.getElementById(gameElementId)

    // Remove anything that is already there
    gameElement.replaceChildren()

    const { images, fullName, designation, weatherInfo, name } = park 

    // Display the designation and the name as dashes
    const hiddenNameSectionElement = document.createElement('section')
    hiddenNameSectionElement.className = 'section-text_center'
    const hiddenNameElement = document.createElement('h2')
    // If we are already in the middle of a game get the current status of the word else create one and save it
    let hiddenName = ''
    if (!localStorage.getItem(localStorageKeys.hiddenName)) {
        hiddenName = name.replaceAll(' ', '/').replace(/[a-zA-Z]/g, '_ ') + ' ' + (designation === '' ? 'Public Lands' : designation)
        localStorage.setItem(localStorageKeys.hiddenName, hiddenName)
    } else {
        hiddenName = localStorage.getItem(localStorageKeys.hiddenName)
    }
    hiddenNameElement.textContent = hiddenName
    hiddenNameElement.id = hiddenNameElementId
    hiddenNameSectionElement.appendChild(hiddenNameElement)
    gameElement.appendChild(hiddenNameSectionElement)

    // Display the image
    const imageElement = document.createElement('img')
    const imageSectionElement = document.createElement('section')
    
    // Select a random image from the list
    const randomImage = images[Math.floor(Math.random() * images.length)]
    imageElement.src = randomImage.url
    imageElement.alt = randomImage.altText
    imageSectionElement.className = 'section-text_center'
    imageSectionElement.appendChild(imageElement)
    gameElement.appendChild(imageSectionElement)

    // Display the weatherInfo
    const weatherInfoElement = document.createElement('section')
    // Remove the name of the place where it exists and replace it with "PARK NAME"
    weatherInfoElement.textContent = weatherInfo.replaceAll(fullName, 'PARK NAME').replaceAll(name, 'PARK NAME')
    gameElement.appendChild(weatherInfoElement)
    
    // add the chosen park to the local storage
    localStorage.setItem(localStorageKeys.currentPark, JSON.stringify(park))
}

// Display Scoreboard
function displayScoreboard () {
    const winsElement = document.getElementById(winsElementId)
    const lossesElement = document.getElementById(lossesElementId)

    winsElement.textContent = (localStorage.getItem(localStorageKeys.wins) ? localStorage.getItem(localStorageKeys.wins) : '0')
    lossesElement.textContent = (localStorage.getItem(localStorageKeys.losses) ? localStorage.getItem(localStorageKeys.losses) : '0')
}

// Check if the character is a letter using regex
function isLetter (letter) {
  // if there was more then one letter passes in or no letter then return false
  if (!letter || letter.length !== 1) {
    return false
  }

  const regex = new RegExp('[a-zA-Z]') // this is the regex for a letter

  return regex.test(letter)
}

// Process user's guess
function processUserGuess (letter) {
    letter = letter.toUpperCase()

    // Check that the letter is the letter and has not already been guessed
    const incorrectGuesses = (localStorage.getItem(localStorageKeys.incorrectGuesses) ? JSON.parse(localStorage.getItem(localStorageKeys.incorrectGuesses)) : [])

    if (!isLetter(letter) || incorrectGuesses.includes(letter)) {
        return
    }

    // Get the hidden park value and the park we are currently guessing then format them to look the same
    let hiddenName = document.getElementById(hiddenNameElementId).textContent.toUpperCase().replaceAll('_ ', '_')
    let parkName = JSON.parse(localStorage.getItem(localStorageKeys.currentPark))?.name.toUpperCase().replaceAll(' ', '/')

    // see if the user entered the correct letter
    const indexOfFirstRightLetter = parkName.indexOf(letter)

    if (indexOfFirstRightLetter !== -1) {
        // Search for the letter starting at the first index where we found it
        for (let i = indexOfFirstRightLetter; i < parkName.length; i++) {
            // If the letter exists at that location replace it
            if (parkName[i] === letter) {
                hiddenName = hiddenName.substring(0,i) + letter + hiddenName.substring(i+1)
            }
        }

        // Display the new hidden name to the user and save off the progress
        document.getElementById(hiddenNameElementId).textContent = hiddenName.replaceAll('_', '_ ')
        localStorage.setItem(localStorageKeys.hiddenName, hiddenName.replaceAll('_', '_ '))
    } else {
        // If the letter doesn't exist then add the letter to the incorrectGuesses, and decrement the number of guesses remaining
        incorrectGuesses.push(letter)
        let guessesLeft = Number(localStorage.getItem(localStorageKeys.guessesLeft)) - 1
        localStorage.setItem(localStorageKeys.incorrectGuesses, JSON.stringify(incorrectGuesses))
        localStorage.setItem(localStorageKeys.guessesLeft, guessesLeft)

        const incorrectGuessesElement = document.getElementById(incorrectGuessesElementId)
        incorrectGuessesElement.textContent = incorrectGuesses

        const guessesLeftElement = document.getElementById(guessesLeftElementId)
        guessesLeftElement.textContent = guessesLeft
    }

    // if the user is out of guesses or if the park was figured out then restart the game
    if (Number(localStorage.getItem(localStorageKeys.guessesLeft)) <= 0) {
        let losses = Number(localStorage.getItem(localStorageKeys.losses)) + 1
        localStorage.setItem(localStorageKeys.losses, losses)
    } else if (!hiddenName.includes('_')) {
        let wins = Number(localStorage.getItem(localStorageKeys.wins)) + 1
        localStorage.setItem(localStorageKeys.wins, wins)
    }
    
    if (Number(localStorage.getItem(localStorageKeys.guessesLeft)) <= 0 || !hiddenName.includes('_')) {
        localStorage.setItem(localStorageKeys.previousPark, localStorage.getItem(localStorageKeys.currentPark))
        localStorage.setItem(localStorageKeys.guessesLeft, maxIncorrectGuesses)
        localStorage.removeItem(localStorageKeys.currentPark)
        localStorage.removeItem(localStorageKeys.hiddenName)
        localStorage.removeItem(localStorageKeys.incorrectGuesses)
    
        setupGame(JSON.parse(localStorage.getItem(localStorageKeys.parksLoaded)).start)
    }
}


setupGame()
userGuessElement.addEventListener('submit', (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Process what the user entered and clear the field
    const input = userGuessElement.querySelector('input').value.trim()
    processUserGuess(input)
    userGuessElement.querySelector('input').value = ''
})