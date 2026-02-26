const localStorageKeys = {
    parksLoaded: 'parksLastLoaded',
    wins: 'wins',
    loses: 'loses',
    incorrectGuesses: 'incorrectGuesses',
    guessesLeft: 'guessesLeft',
    hiddenName: 'hiddenName',
    currentPark: 'currentPark',
    lastPark: 'lastPark'
}

const gameElementId = 'game'
const scoreCardId = 'score-card'
const userFormId = 'user-form'
const hiddenNameElementId = 'hidden-name'
const userGuessElement = document.getElementById(userFormId)

const maxIncorrectGuesses = 5

// Get the parks from the api
async function getParks(start) {
    const apiKey = 'DzQ19snS6xQGbpY6Uqn6KGSveSvMJnXiXGXKia7w'
    try {
        let response = await fetch(`https://developer.nps.gov/api/v1/parks?start=${start}&api_key=${apiKey}`)
        console.log(response)
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
async function setupGame(start = 0) {
    let parksData = JSON.parse(localStorage.getItem(localStorageKeys.parksLoaded))

    // If the same is being restarted then reset the score
    if (start === 0) {
        localStorage.setItem(localStorageKeys.wins, 0)
        localStorage.setItem(localStorageKeys.loses, 0)
        localStorage.setItem(localStorageKeys.incorrectGuesses, JSON.stringify([]))
        localStorage.setItem(localStorageKeys.guessesLeft, maxIncorrectGuesses)
    }

    // If we are not in the middle of a game then get the parks
    if (!parksData || Number(parksData.start) !== start) {
        console.log('getting parks')
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
            console.log('getting new park')
            const parkToSelect = Math.floor(Math.random() * parks.length)
            park = parks[parkToSelect]
            parks.splice(parkToSelect, 1)
            localStorage.setItem(localStorageKeys.parksLoaded, JSON.stringify(parksData))
        } else {
            console.log('getting old park')
            park = JSON.parse(localStorage.getItem(localStorageKeys.currentPark))
        }
        
        displayPark(park)
    } else {
        // Get the next set of parks if there are any left else the user has finished the game
        const nextStartingPoint = Number(startingPoint) + Number(numberOfParksLoaded) + 1
        if (Number(total) >= nextStartingPoint) {
            console.log('Ran out looking for more parks')
            setupGame(nextStartingPoint)

        } else {
            console.log('parks have all been guessed')
        }
    }
}

// Display the chosen park to the user
function displayPark(park) {
    const gameElement = document.getElementById(gameElementId)

    // Remove anything that is already there
    gameElement.replaceChildren()

    console.log(park)
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
    console.log(randomImage) 
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
    console.log(name)
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

// Processed user guessed
function processUserGuess (letter) {
    console.log('this happened: ', letter)
    // Check that the letter is the letter and has not already been guessed
    const incorrectGuesses = JSON.parse(localStorage.getItem(localStorageKeys.incorrectGuesses))
    if (!isLetter(letter) || (incorrectGuesses && incorrectGuesses.includes(letter))) {
        return
    }

    // Get the hidden park value and the park we are currently guessing then format them to look the same
    let hiddenName = document.getElementById(hiddenNameElementId).textContent.toUpperCase().replaceAll('_ ', '_')
    let parkName = JSON.parse(localStorage.getItem(localStorageKeys.currentPark))?.name.toUpperCase().replaceAll(' ', '/')
    letter = letter.toUpperCase()

    console.log('hiddenName: ' + hiddenName)
    console.log('parkName: ' + parkName)

    // see if the user entered the correct letter
    const indexOfFirstRightLetter = parkName.indexOf(letter)

    if (indexOfFirstRightLetter !== -1) {
        console.log('right')
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
        console.log('wrong')
        // If the letter doesn't exist then add the letter to the incorrectGuesses, and decrement the number of guesses remaining
        incorrectGuesses.push(letter)
        let guessesLeft = Number(localStorage.getItem(localStorageKeys.guessesLeft)) - 1
        localStorage.setItem(localStorageKeys.incorrectGuesses, JSON.stringify(incorrectGuesses))
        localStorage.setItem(localStorageKeys.guessesLeft, guessesLeft)
        console.log('incorrectGuesses ', incorrectGuesses)
        console.log('guessesLeft ', guessesLeft)
    }

    // if the user is out of guesses or if the park was figured out then restart the game
    if (Number(localStorage.getItem(localStorageKeys.guessesLeft)) <= 0) {
        let losses = Number(localStorage.getItem(localStorageKeys.loses)) - 1
        localStorage.setItem(localStorageKeys.losses, losses)
    } else if (!hiddenName.includes('_')) {
        let wins = Number(localStorage.getItem(localStorageKeys.wins)) + 1
        localStorage.setItem(localStorageKeys.wins, wins)
    }
    
    if (Number(localStorage.getItem(localStorageKeys.guessesLeft)) <= 0 || !hiddenName.includes('_')) {
        localStorage.setItem(localStorageKeys.lastPark, localStorage.getItem(localStorageKeys.currentPark))
        localStorage.removeItem(localStorageKeys.currentPark)
        localStorage.removeItem(localStorageKeys.hiddenName)
    
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