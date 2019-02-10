//list of cards 
const cards = ['diamond',
    'paper-plane-o',
    'anchor',
    'bolt',
    'cube',
    'leaf',
    'bicycle',
    'bomb'
];

/*
Configurations 
*/
const gameTimeout = 5; // 5mins
const threeStarLimit = 13; // less than 13 moves  
const twoStarLimit = 25;// less than 25 moves  

/*
Global variables 
*/
//last card selected
let lastTarget = null;
/* deckState keeps track of the state of the deck
deckState == 0 - deck is ready for play 
deckState > 0 - deck is busy and do not allow any moves 
*/
let deckState = 0;
let matches = 0;
let moves = 0;
let countDownTime = null;
let timerId = null; // id for the timer function

//double the array before shuffuling 
const shuffledCards = shuffle(cards.concat(cards));

//all the important html elements
const containerElement = document.querySelector('#container');
const deckElement = document.querySelector('#deck');
const movesElement = document.querySelector('#moves');
const successDialog = document.querySelector('#success');
const failDialog = document.querySelector('#fail');
const starElements = document.querySelectorAll('.stars li');
const finalMovesElement = document.querySelector('#final-moves');


/*
Applications main control loop
1) Validate conditions 
2) Start the timer
    2.1) Timeout the game after 5 mins - see calcTime function 
3) Star a move 
4) If not complete a move 
    4.1) if cards match then show them as mathched 
    4.2) if cards  do not match then hide them 
5) Finish the game if all of them are matched 
*/
deckElement.addEventListener('click', function (event) {
    const target = event.target;

    /* validate conditions
    if click target is not a card, 
    or the same card was clicked twice, 
    or a move is in-progress 
    then do nothing
    */
    if (!target.classList.contains('card') ||
        lastTarget === target ||
        deckState > 0) {
        return;
    }

    //start the timer at the first move 
    if (moves == 0) {
        startTimer();
    }

    deckState++;//deck is in-progress

    //start a move
    setTimeout(showCard, 0, target);
    if (lastTarget == null) {
        setTimeout(showMoves, 0, ++moves);
        lastTarget = target;
        deckState--;
    }
    //complete a move
    else {
        const lastTargetCopy = lastTarget;
        //if matched show them as matched
        if (matchCards(target, lastTarget)) {
            matches++;
            setTimeout(showMatchedCards, 0, target, lastTargetCopy);

            if (matches == cards.length) {
                setTimeout(showSuccess, 700);
                // 700ms allowing for card open trasition check css .deck.card.show
            }
        }
        //if not matched hide them. give some time for the
        else {
            setTimeout(hideUnmatchedCards, 1200, target, lastTargetCopy);
            // 1200ms delay allowing the users to spot the card
        }

        lastTarget = null;
    }
});

// popup dialog close button action after sucess
document.querySelector('.dialog .close-success').addEventListener('click', function () {
    successDialog.close();
    containerElement.classList.toggle('backdrop');
    resetAll();
});

// popup dialog close button action after failiure
document.querySelector('.dialog .close-fail').addEventListener('click', function () {
    failDialog.close();
    containerElement.classList.toggle('backdrop');
    resetAll();
});

// restart button action 
document.querySelector('#restart').addEventListener('click', function () {
    resetAll();
});

deckElement.appendChild(generateDeck(shuffledCards));

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

//creates the elements to generate the html for the card deck
function generateDeck(cards) {
    const container = document.createDocumentFragment();

    for (const card of cards) {
        const cardElement = document.createElement('li');
        cardElement.classList.add('card');
        container.appendChild(cardElement);

        const iconElement = document.createElement('i');
        iconElement.classList.add('fa');
        iconElement.classList.add('fa-' + card);
        cardElement.appendChild(iconElement);
    }
    return container;
}

function showCard(target) {
    target.classList.add('show');
}

function showMoves(moveCount) {
    movesElement.textContent = moveCount;
}

function showMatchedCards(current, previous) {
    previous.classList.add('match');
    current.classList.add('match');
    previous.classList.remove('show');
    current.classList.remove('show');
    deckState--;
}

function hideUnmatchedCards(current, previous) {
    previous.classList.remove('show');
    current.classList.remove('show');
    deckState--;
}

function matchCards(current, previous) {
    const targetCard = current.getElementsByTagName('i')[0].classList[1];
    const lastCard = previous.getElementsByTagName('i')[0].classList[1];
    return targetCard == lastCard;
}

/*
calculate the stars according to number of moves
*/
function calcStars(moves) {
    if (moves < threeStarLimit) {
        return 3;
    }
    else if (moves < twoStarLimit) {
        return 2;
    }
    else {
        return 1;
    }
}

function fillStars(stars) {
    starElements.hidden = true;
    for (let index = 0; index < stars; index++) {
        starElements[index].classList.add('fill');
    }
    starElements.hidden = false;
}

function finalMoves(moves){
    finalMovesElement.textContent = moves;    
}

//show success dialog
function showSuccess() {
    fillStars(calcStars(moves));
    finalMoves(moves);
    containerElement.classList.toggle('backdrop');
    successDialog.showModal();
}

//show failiure dialog
function showFail() {
    containerElement.classList.toggle('backdrop');
    failDialog.showModal();
}

function resetAll() {
    resetDeck();
    resetMoves();
    resetStars();
    resetTime();
    matches = 0;
}

function resetDeck() {
    deckElement.hidden = true;
    while (deckElement.lastChild) {
        deckElement.removeChild(deckElement.lastChild);
    }
    deckElement.appendChild(generateDeck(shuffledCards));
    deckElement.hidden = false;
}

function resetTime() {
    showTime(0, 00);
    countDownTime = null;
}

function resetMoves() {
    moves = 0;
    showMoves(0);
}

function resetStars() {
    starElements.hidden = true;
    for (const iterator of starElements) {
        iterator.classList.remove('fill');
    }
    starElements.hidden = false;
}

function startTimer() {
    countDownTime = new Date(new Date().getTime() + gameTimeout * 60000);// 5 minutes timeout
    timerId = setInterval(calcTime, 1000);
}

function stopTimer() {
    if (timerId != null) {
        clearInterval(timerId);
    }
}

/*
user is given 5 minutes to complete a game 
below functions shows the remaining time for the game 
*/
function calcTime() {
    const now = new Date().getTime();
    if (countDownTime == null) {
        return;
    }
    const distance = countDownTime - now;

    // Remaining iime calculations for minutes and seconds
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // If the count down is finished, game over
    if (distance < 0) {
        countDownTime = null;
        minutes = 0;
        seconds = 0;
        setTimeout(showFail, 0);
        setTimeout(stopTimer, 0);
    }
    setTimeout(showTime, 0, minutes, seconds);
}

function showTime(minutes, seconds) {
    document.querySelector('#minutes').textContent = minutes;
    document.querySelector('#seconds').textContent = seconds;
}
