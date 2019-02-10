/*todo
perf improvement
open animation
dialog box adjustments
score panel emboss 
*/

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

//last card clicked
let lastTarget = null;

/*
deckState keep track of the state of the deck
deckState == 0 - deck is ready for play 
deckState > 0 - deck is busy
*/
let deckState = 0;

let matches = 0;

let moves = 0;

//double the array before shuffuling 
const shuffledCards = shuffle(cards.concat(cards));
// console.log(shuffledCards);

// const containerElement = document.querySelector('#container');
const deckElement = document.querySelector('#deck');
const movesElement = document.querySelector('#moves');
const successDialog = document.querySelector('#success');
const starElements = document.querySelectorAll('.stars li');

deckElement.addEventListener('click', function (event) {
    const target = event.target;

    /*if click target is not a card, 
    or the same card was clicked twice, 
    or a move is in-progress 
    then do nothing
    */
    if (!target.classList.contains('card') ||
        lastTarget === target ||
        deckState > 0) {
        console.log('no action');
        return;
    }
    deckState++;//deck is in-progress

    //start a move
    setTimeout(showCard, 0, target);//to do animation
    if (lastTarget == null) {
        setTimeout(setMoves, 0, ++moves);
        lastTarget = target;
        deckState--;
    }
    //complete a move
    else {
        const lastTargetCopy = lastTarget;
        if (matchCards(target, lastTarget)) {
            matches++;
            console.log('matches:' + matches);

            setTimeout(showMatchedCards, 100, target, lastTargetCopy);
            // if (matches == cards.length) {
            if (matches == 1) {
                fillStars(calcStars(moves));
                successDialog.showModal();
            }
        }
        else {
            setTimeout(hideUnmatchedCards, 1200, target, lastTargetCopy);
        }

        lastTarget = null;
        console.log('move completed - moves:' + moves);
    }
});

document.querySelector('.dialog .close').addEventListener('click', function () {
    successDialog.close();
    resetAll();
});

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
        iconElement.classList.add('back');
        cardElement.appendChild(iconElement);

        const iconElement = document.createElement('div');
        iconElement.classList.add('front');
        cardElement.appendChild(iconElement);
    }
    return container;
}

function showCard(target) {
    target.classList.add('open');//to do animation
    target.classList.add('show');
}

function setMoves(moveCount) {
    movesElement.textContent = moveCount;
}

function showMatchedCards(current, previous) {
    previous.classList.add('match');
    current.classList.add('match');
    previous.classList.remove('open', 'show');
    current.classList.remove('open', 'show');
    deckState--;
}

function hideUnmatchedCards(current, previous) {
    previous.classList.remove('open', 'show');
    current.classList.remove('open', 'show');
    deckState--;
}

function matchCards(current, previous) {
    const targetCard = current.getElementsByTagName('i')[0].classList[1];
    const lastCard = previous.getElementsByTagName('i')[0].classList[1];
    return targetCard == lastCard;
}

function calcStars(moves) {
    if (moves < 13) {
        return 3;
    }
    else if (moves < 19) {
        return 2;
    }
    else if (moves < 25) {
        return 1;
    }
    else {
        return 0;
    }
}

function fillStars(stars){
    starElements.hidden = true;
    for (let index = 0; index < stars; index++) {
        starElements[index].classList.add( 'fill');    
    }   
    starElements.hidden = false;
}

function resetAll() {
    resetDeck();
    resetMoves();
    resetStars();
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

function resetMoves() {
    moves = 0;
    setMoves(0);
}

function resetStars(){
    starElements.hidden = true;
    for (const iterator of starElements) {
        iterator.classList.remove('fill');
    }   
    starElements.hidden = false;
}
