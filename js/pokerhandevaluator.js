'use strict';

var HANDVALUES = {
  STRAIGHTFLUSH: 9,
  QUADS: 8,
  FULLHOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  TRIPS: 4,
  TWOPAIR: 3,
  PAIR: 2,
  HIGHCARD: 1
};

function Card(id, value, suit) {
  this.id = id;
  this.value = value;
  this.suit = suit;
}

function Hand(id, cards) {
  this.id = id;
  this.cards = cards;

  this.pairs = [];
  this.trips = 0;
  this.quads = 0;
  this.handValue = 0;
  this.isStraight = false;
  this.isFlush = false;

  this.sortCards = function() {
    this.cards.sort(function(a, b) {
      return a.value < b.value;
    });
  };

  this.sortCards();
}

// Returns a full 52 card deck in order
function createDeck() {
  var deck = [],
      value,
      suit;

  for (var i = 0; i < 52; i++) {
    if (i % 13 === 0) {
      value = 14;
    } else {
      value = i % 13 + 1;
    }

    if (i < 13) suit = 's';
    else if (i >= 13 && i < 26) suit = 'h';
    else if (i >= 26 && i < 39) suit = 'd';
    else suit = 'c';

    deck.push(new Card(i + 1, value, suit));
  }

  return deck;
}

// Shuffles the deck given as argument and return it
function shuffleDeck(deck) {
  for (var i = deck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

// Return a hand object and put five first cards from given deck to its cards array, starting from card 0 or gives start card
function getHand(deck, start) {
  var cards = [];
  
  start = start || 0;

  for (var i = start; i < start + 5; i++) {
    cards.push(deck[i]);
  }
  return new Hand(null, cards);
}

// Adds ranks of possible pairs, trips and quads to given hand object and returns the hand
function findSameRankTypeHands(hand) {
  var ranks = [],
      cards = hand.cards;

  // Initialize array for 13 card ranks with zeros, indices 2...14
  for (var i = 2; i <= 14; i++) {
    ranks[i] = 0;
  }

  // Add one to cards rank in array 'ranks'
  for (i = 0; i < cards.length; i++) {
    ranks[cards[i].value]++;
  }

  // add ranks array to hand object
  hand.ranks = ranks;

  // Loop through ranks and check if pairs, trips or quads were found
  // Pair values are pushed to array 'pairs', trips and quads by their value
  for (i = 2; i < ranks.length; i++) {
    if (ranks[i] === 2) {
      hand.pairs = hand.pairs || [];
      hand.pairs.push(i);
    }
    else if (ranks[i] === 3) {
      hand.trips = i;
    }
    else if (ranks[i] === 4) {
      hand.quads = i;
    }
  }

  if (hand.quads) {
    hand.handValue = HANDVALUES.QUADS;
  } else if (hand.trips && hand.pairs.length === 1) {
    hand.handValue = HANDVALUES.FULLHOUSE;
  } else if (hand.trips) {
    hand.handValue = HANDVALUES.TRIPS;
  } else if (hand.hasOwnProperty('pairs') && hand.pairs.length === 2) {
    hand.handValue = HANDVALUES.TWOPAIR;
  } else if (hand.hasOwnProperty('pairs') && hand.pairs.length === 1) {
    hand.handValue = HANDVALUES.PAIR;
  } else {
    hand.handValue = HANDVALUES.HIGHCARD;
  }

  return hand;
}

// If hand is a straight add straight property and handValue to hand, assumes hand is sorted
function findStraight(hand) {
  var cards;

  cards = hand.cards;

  // Check for wheel (A...5 straight)
  if (cards[0].value === 14 &&
    cards[1].value === 5 &&
    cards[2].value === 4 &&
    cards[3].value === 3 &&
    cards[4].value === 2) {
    hand.handValue = HANDVALUES.STRAIGHT;
    hand.highestCardValue = 5;
    hand.isStraight = true;
  } else if (cards[0].value - cards[4].value === 4) {
    hand.handValue = HANDVALUES.STRAIGHT;
    hand.highestCardValue = cards[0].value;
    hand.isStraight = true;
  }

  return hand;
}

// If hand is a flush add straight property and handValue to hand
function findFlush(hand) {

  var suit = hand.cards[0].suit;

  // Return immediately if another suit vas found
  for (var i = 1; i < hand.cards.length; i++) {
    if (hand.cards[i].suit != suit) return hand;
  }

  // If we get here we have a flush
  hand.handValue = HANDVALUES.FLUSH;
  hand.isFlush = true;

  return hand;
}

// Return true if given hand is a straight and a flush
function findStraightFlush(hand) {
  if (hand.isFlush && hand.isStraight) {
    hand.handValue = HANDVALUES.STRAIGHTFLUSH;
  }

  return hand;
}

function attachHandValue(hand) {
  hand = findSameRankTypeHands(hand);
    // if no same ranks found (handValue is currently 1), we can have straights and/or flushes
    if (hand.handValue === 1) {
      hand = findStraight(hand);
      hand = findFlush(hand);
      hand = findStraightFlush(hand);
    }
  return hand;
}

// Compare two hands to find out which hand wins in showdown. NOT USED IN 5 x 5 Poker Point Game, for future use
// Return winning hand number as int (1 or 2), 0 if hands are equal and winner can't be determined
function compareHands(h1, h2) {

  // Higher hand wins automatically, no further check needed
  if (h1.handValue > h2.handValue) {
    return 1;
  }
  if (h1.handValue < h2.handValue) {
    return 2;
  }

  // Comparison of hands with same value
  switch (h1.handValue) {
    case HANDVALUES.STRAIGHTFLUSH:
    case HANDVALUES.STRAIGHT:
      if (h1.highestCardValue > h2.highestCardValue) {
        return 1;
      } else if (h1.highestCardValue < h2.highestCardValue) {
        return 2;
      }
      break;
    case HANDVALUES.QUADS:
      if (h1.quads > h2.quads) {
        return 1;
      } else if (h1.quads < h2.quads) {
        return 2;
      }
      break;
    case HANDVALUES.FULLHOUSE:
    case HANDVALUES.TRIPS:
      if (h1.trips > h2.trips) {
        return 1;
      } else if (h1.trips < h2.trips) {
        return 2;
      }
      break;
    case HANDVALUES.FLUSH:
    case HANDVALUES.HIGHCARD:
      return compareHigh(h1, h2);
    case HANDVALUES.TWOPAIR:
      return compareTwoPair(h1, h2);
    case HANDVALUES.PAIR:
      return comparePair(h1, h2);
    default:
      break;
  }
  return 0;
}

function compareHigh(h1, h2) {
  for (var i = 0; i < h1.cards.length; i++) {
    if (h1.cards[i].value > h2.cards[i].value) {
      return 1;
    } else if (h1.cards[i].value < h2.cards[i].value) {
      return 2;
    }
  }

  return 0;
}

function comparePair(h1, h2) {
  if (h1.pairs[0] > h2.pairs[0]) {
    return 1;
  } else if (h1.pairs[0] < h2.pairs[0]) {
    return 2;
  }
  return compareHigh(h1, h2);
}

function compareTwoPair(h1, h2) {
  h1.pairs.sort(function(a, b) {
      return a < b;
  });
  h2.pairs.sort(function(a, b) {
      return a < b;
  });

  if (h1.pairs[0] > h2.pairs[0]) {
    return 1;
  } else if (h1.pairs[0] < h2.pairs[0]) {
    return 2;
  } else if (h1.pairs[1] > h2.pairs[1]) {
    return 1;
  } else if (h1.pairs[1] < h2.pairs[1]) {
    return 2;
  }

  return compareHigh(h1, h2);
}