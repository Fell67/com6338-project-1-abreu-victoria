const localStorageKeys = {
    parksLoaded: 'parksLastLoaded',
    wins: 'wins',
    loses: 'loses',
    currentPark: 'currentPark',
    lastPark: 'lastPark'
}

const gameElementId = 'game'
const scoreCardId = 'score-card'
const userFormId = 'user-form'
const userGuessElement = document.getElementById(userFormId)

const incorrectGuesses = []
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
async function setupGame(start=0) {
    let parksData = JSON.parse(localStorage.getItem(localStorageKeys.parksLoaded))

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

    // Pick a park at random and remove it from the array
    if (parks.length !== 0) {
        const parkToSelect = Math.floor(Math.random() * parks.length)
        const park = parks[parkToSelect]
        parks.splice(parkToSelect, 1)
        localStorage.setItem(localStorageKeys.parksLoaded, JSON.stringify(parksData))
        
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
    console.log(park)
    const { images, fullName, designation, weatherInfo, name } = park 

    // Display the designation and the name as dashes
    const designationSectionElement = document.createElement('section')
    designationSectionElement.className = 'section-text_center'
    const designationElement = document.createElement('h2')
    const hiddenName = name.replaceAll(' ', '/').replace(/[a-zA-Z]/g, '_ ')
    designationElement.textContent = hiddenName + ' ' + (designation === '' ? 'Public Lands' : designation)
    designationSectionElement.appendChild(designationElement)
    gameElement.appendChild(designationSectionElement)

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
    localStorage.setItem(localStorageKeys.currentPark, name)
    console.log(name)
}

setupGame()
userGuessElement.addEventListener('submit', function (e) {
    e.preventDefault()
    e.stopPropagation()
    const input = userGuessElement.querySelector('input')
    console.log('this happened: ', input.value.trim())
})