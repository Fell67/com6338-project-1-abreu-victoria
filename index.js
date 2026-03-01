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
const shownImageClassName = 'section-image_gallery-image_displayed'
const hiddenImageClassName = 'section-image_gallery-image_hidden'
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
        const response = await fetch(`https://developer.nps.gov/api/v1/parks?start=${start}&api_key=${apiKey}`)
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

// Check if the image src is valid
async function isValidImage (src) {
    if (!src) {
        return false
    }

    try {
        const response = await fetch(src)
        // if the status code is 200 then we are good to continue else there is an issue
        if (response.status === 200) {
            const type = response.headers.get('Content-Type')
            return (type && type.startsWith('image'))
        } else {
            return false
        }
    } catch (error) {
        console.error(`Error checking image ${src}: ${error}`)
        return false
    }
}

// Get an item from localStorage
function getLocalStorage (key, parseObject = true) {
    if (parseObject) {
        return JSON.parse(localStorage.getItem(key))
    }

    return localStorage.getItem(key)
}

// Set an item from localStorage
function setLocalStorage (key, value, stringifyObject = true) {
    if (stringifyObject) {
        localStorage.setItem(key, JSON.stringify(value))
    } else {
        localStorage.setItem(key, value)
    }
}

// Remove an item from localStorage
function removeLocalStorage (key) {
    localStorage.removeItem(key) 
}

// Setup the game
async function setupGame (start = 0) {
    let parksData = getLocalStorage(localStorageKeys.parksLoaded)

    // If the game is being restarted then reset the game else get the information for the current game
    if (!parksData) {
        setLocalStorage(localStorageKeys.wins, 0)
        setLocalStorage(localStorageKeys.losses, 0)
        setLocalStorage(localStorageKeys.guessesLeft, maxIncorrectGuesses)
        removeLocalStorage(localStorageKeys.incorrectGuesses)
    }

    // Set the previous park, incorrect guessed, and guesses left
    const incorrectGuessesElement = document.getElementById(incorrectGuessesElementId)
    incorrectGuessesElement.textContent = (getLocalStorage(localStorageKeys.incorrectGuesses) ? getLocalStorage(localStorageKeys.incorrectGuesses) : 'None')

    const guessesLeftElement = document.getElementById(guessesLeftElementId)
    guessesLeftElement.textContent = (getLocalStorage(localStorageKeys.guessesLeft) ? getLocalStorage(localStorageKeys.guessesLeft) : maxIncorrectGuesses)

    const previousParkElement = document.getElementById(previousParkElementId)
    previousParkElement.textContent = (getLocalStorage(localStorageKeys.previousPark) ? getLocalStorage(localStorageKeys.previousPark).name : 'None')

    // Display the score card to the user
    displayScoreboard()

    // If we are not in the middle of a game then get the parks
    if (!parksData || Number(parksData.start) !== Number(start)) {
        parksData = await getParks(start)

        if (parksData.errorCode) {
            console.error('Unable to get the park information. error ' + parksData.errorCode + ': ' + parksData.statusText)
            return
        }
    }

    const { data:parks, limit:numberOfParksLoaded, start:startingPoint, total} = parksData

    // Pick a park at random and remove it from the array if we are not already guessing at a park
    if (parks.length !== 0) {
        let park
        if (!getLocalStorage(localStorageKeys.currentPark)) {
            const parkToSelect = Math.floor(Math.random() * parks.length)
            park = parks[parkToSelect]
            parksData.data = parks.toSpliced(parkToSelect, 1)
            setLocalStorage(localStorageKeys.parksLoaded, parksData)
        } else {
            park = getLocalStorage(localStorageKeys.currentPark)
        }
        
        await displayPark(park)
    } else {
        // Get the next set of parks if there are any left else the user has finished the game
        const nextStartingPoint = Number(startingPoint) + Number(numberOfParksLoaded) + 1
        if (Number(total) >= nextStartingPoint) {
            setupGame(nextStartingPoint)

        } else {
            removeLocalStorage(localStorageKeys.parksData)
            setupGame()
        }
    }
}

// Display the chosen park to the user
async function displayPark (park) {
    const gameElement = document.getElementById(gameElementId)

    // Remove anything that is already there
    gameElement.replaceChildren()

    const { images, designation, weatherInfo, name } = park 

    // Display the designation and the name as dashes
    const hiddenNameSectionElement = document.createElement('section')
    hiddenNameSectionElement.className = 'section-text_center'
    const hiddenNameElement = document.createElement('h2')
    // If we are already in the middle of a game get the current status of the word else create one and save it. NOTE: If there are any parks with letters that have accents then those will be shown by default.
    let hiddenName = ''
    if (!getLocalStorage(localStorageKeys.hiddenName, false)) {
        hiddenName = name.replaceAll(' ', ' / ').replace(/[a-zA-Z]/g, '_ ').toUpperCase() + ' ' + (designation === '' ? 'Public Lands' : designation)
        setLocalStorage(localStorageKeys.hiddenName, hiddenName, false)
    } else {
        hiddenName = getLocalStorage(localStorageKeys.hiddenName, false)
    }
    hiddenNameElement.textContent = hiddenName
    hiddenNameElement.id = hiddenNameElementId
    hiddenNameSectionElement.appendChild(hiddenNameElement)
    gameElement.appendChild(hiddenNameSectionElement)

    // Display the image section
    const imageGallerySectionElement = document.createElement('section')
    imageGallerySectionElement.className = 'section-image_gallery'

    const imagePrevButtonElement = document.createElement('button')
    imagePrevButtonElement.textContent = '<'
    imagePrevButtonElement.ariaLabel = 'previous'
    imagePrevButtonElement.classList = 'section-image_gallery-button'
    imagePrevButtonElement.addEventListener('click', (e) => {
        e.stopPropagation()
        changeImage('previous')
    })
    imageGallerySectionElement.appendChild(imagePrevButtonElement)

    const imageSectionElement = document.createElement('section')
    imageSectionElement.className = 'section-image_gallery-image_container'
    imageGallerySectionElement.appendChild(imageSectionElement)

    for (const image of images) {
        if (await isValidImage(image.url)) {
            const imageElement = document.createElement('img')
            imageElement.src = image.url
            imageElement.alt = image.altText
    
            if (images.indexOf(image) === 0) {
                imageElement.className = shownImageClassName
            } else {
                imageElement.className = hiddenImageClassName
            }
    
            imageSectionElement.appendChild(imageElement)
        }
    }

    const imageNextButtonElement = document.createElement('button')
    imageNextButtonElement.textContent = '>'
    imageNextButtonElement.ariaLabel = 'next'
    imageNextButtonElement.classList = 'section-image_gallery-button'
    imageNextButtonElement.addEventListener('click', (e) => {
        e.stopPropagation()
        changeImage('next')
    })
    imageGallerySectionElement.appendChild(imageNextButtonElement)

    gameElement.appendChild(imageGallerySectionElement)

    // Display the weatherInfo
    const weatherInfoElement = document.createElement('section')
    weatherInfoElement.className = 'section-anywhere_overflow_wrap'
    // Remove the name of the place where it exists and replace it with "PARK NAME"
    weatherInfoElement.textContent = weatherInfo.replaceAll(name, 'PARK NAME')
    gameElement.appendChild(weatherInfoElement)
    
    // add the chosen park to the local storage
    setLocalStorage(localStorageKeys.currentPark, park)
}

// Display Scoreboard
function displayScoreboard () {
    const winsElement = document.getElementById(winsElementId)
    const lossesElement = document.getElementById(lossesElementId)

    winsElement.textContent = (getLocalStorage(localStorageKeys.wins) ? getLocalStorage(localStorageKeys.wins) : '0')
    lossesElement.textContent = (getLocalStorage(localStorageKeys.losses) ? getLocalStorage(localStorageKeys.losses) : '0')
}

// Update the image in the gallery
function changeImage (direction) {
    // get current image that is displayed and a list of all the images for the park
    const currentImageDisplayedElement = document.querySelector(`.${shownImageClassName}`)
    if (!currentImageDisplayedElement) {
        return
    }
    let nextImageElement
    if (direction === 'next') {
        // get the next image
        nextImageElement = currentImageDisplayedElement.nextElementSibling

        // If that was the last image loop back to the first image
        if (nextImageElement === null) {
            nextImageElement = currentImageDisplayedElement.parentElement.firstChild
        }
    } else if (direction === 'previous') {
        // get the previous image
        nextImageElement = currentImageDisplayedElement.previousElementSibling

        // If that was the first image loop to the last image
        if (nextImageElement === null) {
            nextImageElement = currentImageDisplayedElement.parentElement.lastChild
        }
    }

    // Update the displayed image
    currentImageDisplayedElement.classList.remove(shownImageClassName)
    currentImageDisplayedElement.classList.add(hiddenImageClassName)
    nextImageElement.classList.remove(hiddenImageClassName)
    nextImageElement.classList.add(shownImageClassName)
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

    // Check that the letter is a letter, has not already been guessed, and that there is a park loaded
    const incorrectGuesses = (getLocalStorage(localStorageKeys.incorrectGuesses) ? getLocalStorage(localStorageKeys.incorrectGuesses) : [])

    if (!isLetter(letter) || incorrectGuesses.includes(letter) || !getLocalStorage(localStorageKeys.parksLoaded)) {
        return
    }

    // Get the hidden park value and the park we are currently guessing then format them to look the same
    let hiddenName = document.getElementById(hiddenNameElementId).textContent.toUpperCase().replaceAll('_ ', '_')
    const parkName = getLocalStorage(localStorageKeys.currentPark)?.name.toUpperCase().replaceAll(' ', ' / ')

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
        setLocalStorage(localStorageKeys.hiddenName, hiddenName.replaceAll('_', '_ '), false)
    } else {
        // If the letter doesn't exist then add the letter to the incorrectGuesses, and decrement the number of guesses remaining
        incorrectGuesses.push(letter)
        const guessesLeft = Number(getLocalStorage(localStorageKeys.guessesLeft)) - 1
        setLocalStorage(localStorageKeys.incorrectGuesses, incorrectGuesses)
        setLocalStorage(localStorageKeys.guessesLeft, guessesLeft)

        const incorrectGuessesElement = document.getElementById(incorrectGuessesElementId)
        incorrectGuessesElement.textContent = incorrectGuesses

        const guessesLeftElement = document.getElementById(guessesLeftElementId)
        guessesLeftElement.textContent = guessesLeft
    }

    // if the user is out of guesses or if the park was figured out then restart the game
    if (Number(getLocalStorage(localStorageKeys.guessesLeft)) <= 0) {
        const losses = Number(getLocalStorage(localStorageKeys.losses)) + 1
        setLocalStorage(localStorageKeys.losses, losses)
    } else if (!hiddenName.includes('_')) {
        const wins = Number(getLocalStorage(localStorageKeys.wins)) + 1
        setLocalStorage(localStorageKeys.wins, wins)
    }
    
    if (Number(getLocalStorage(localStorageKeys.guessesLeft)) <= 0 || !hiddenName.includes('_')) {
        setLocalStorage(localStorageKeys.previousPark, getLocalStorage(localStorageKeys.currentPark))
        setLocalStorage(localStorageKeys.guessesLeft, maxIncorrectGuesses)
        removeLocalStorage(localStorageKeys.currentPark)
        removeLocalStorage(localStorageKeys.hiddenName)
        removeLocalStorage(localStorageKeys.incorrectGuesses)

        setupGame(getLocalStorage(localStorageKeys.parksLoaded).start)
    }
}

setupGame()
userGuessElement.addEventListener('submit', (e) => {
    e.preventDefault()
    e.stopPropagation()

    const inputElement = userGuessElement.querySelector('input')
    // Process what the user entered and clear the field
    const input = inputElement.value.trim()
    processUserGuess(input)
    inputElement.value = ''
    inputElement.focus()
})