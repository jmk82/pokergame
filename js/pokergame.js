$(document).ready(function() {
  $("#btn").on("click", function() {
    if (confirm("New deal?")) {
      location.reload();
    }
  });

  $("#userNameButton").on("click", handleUserName);

  $("input[value=" + animationSpeed + "]").attr("checked", "checked");
  
  $("input[name='animSpeed']").on("click", function() {
    animationSpeed = localStorage["animationSpeed"] = $(this).val();
  });

  $("#resetHighscores").on("click", function() {
    if (confirm("Reset local high score list?")) {
      localStorage.removeItem("highScores");
      printHighScores();
    }
  })

  if (localStorage["currentUser"]) {
    $("#userNameField").val(localStorage["currentUser"]);

    $("#userForm").hide();
    showUserLogged();
  }

  runGame();
  printHighScores();
});

var deck,
    cardNumber,
    round,
    hands,
    animating = false,
    highScores,
    highScoreTableSize = 5;
    valueScores = [],
    animationSpeed = localStorage["animationSpeed"] || 400;

// Link hand values to their score values
valueScores[9] = 12;
valueScores[8] = 10;
valueScores[7] = 7;
valueScores[6] = 5;
valueScores[5] = 5;
valueScores[4] = 3;
valueScores[3] = 2;
valueScores[2] = 1;

// Create and shuffle the deck, advance to deal first card, create empty arrays for five hands
function runGame() {
  deck = createDeck();
  deck = shuffleDeck(deck);
  cardNumber = 0;
  round = 1;
  hands = [];

  for (var i = 0; i < 5; i++) {
    hands[i] = [];
  }

  dealCard();
}

// Deal a new card
function dealCard() {
  if ($(".newCardPile").draggable()) {
    $(".newCardPile").draggable("destroy");
  }

  $(".newCardPile").removeClass("newCardPile");

  // New round starts after every five cards
  if (cardNumber % 5 === 0) {
    makePilesDroppable();
    round++;
  }

  $("#main").append("<img src='img/" + deck[cardNumber].id + ".png' class='card newCardPile' />");

  // After initial five cards, make dealt card draggable. Animate five first cards to their places.
  if (cardNumber > 4) {
    $(".newCardPile").draggable({
      containment: '#main',
      cursor: 'move',
      stack: "#main",
      revert: "invalid"
    });
  } else {
    animateCard($("#pile" + (cardNumber + 1)), animationSpeed);
  }
}

function animateCard(target) {
  var targetCSS = target.css(["left", "top"]);

  animating = true;

  $(".newCardPile").animate(targetCSS, parseInt(animationSpeed), function() {
    $(target).trigger("drop", false);
    animating = false;
  });
}

function makePilesDroppable() {
  $(".pile").css("top", (round * 30) + "px");
  $(".pile").droppable({
  });
  $(".pile").on("drop", cardDropped);
  $(".pile").droppable('enable');
  $(".pile").dblclick(pileDblClicked);
  $(".pile").css("z-index", "2");
}

function pileDblClicked(event, ui) {
  if (!animating) {
    animateCard($(this));
  }
  //$(this).trigger("drop");
  //console.log(this);
}

function cardDropped(event, ui) {
  var handId;

  if (ui) {
    ui.draggable.position({ of: $(this), my: 'left top', at: 'left top' });
    ui.draggable.draggable("destroy");
  }

  switch (this.id) {
    case 'pile1':
      handId = 0;
      break;
    case 'pile2':
      handId = 1;
      break;
    case 'pile3':
      handId = 2;
      break;
    case 'pile4':
      handId = 3;
      break;
    case 'pile5':
      handId = 4;
      break;
    default:
      break;
  }

  hands[handId].push(deck[cardNumber]);

  $(this).droppable("disable");
  $(this).off("drop");
  $(this).off("dblclick");
  $()
  
  cardNumber++;
  
  if (cardNumber < 25) {
    dealCard();
  } else {
    endGame();
  }
}

function endGame() {
  var totalScore = 0,
      scoreString = "(";

  for (var i = 0; i < hands.length; i++) {
    hands[i] = new Hand(i, hands[i]);
    hands[i] = attachHandValue(hands[i]);
    hands[i].score = valueScores[hands[i].handValue] || 0;
    totalScore += hands[i].score;
    scoreString += hands[i].score;
    if (i === 4) {
      scoreString += ")";
    } else {
      scoreString += " + ";
    }
    console.log(hands[i].score);
  }
  $("#latestScore").html("Your score: " + totalScore + " points!<br>" + scoreString);

  if (localStorage["currentUser"]) {
    storeScoreLocal(localStorage["currentUser"], totalScore);
    updateHighScores({ name: localStorage["currentUser"], score: totalScore });
  }
  printHighScores();

  $("#btn").off("click");
  $("#btn").on("click", function() {
    location.reload();
  });
}

function storeScoreLocal(user, score) {
  //var user = localStorage["currentUser"];
  user = "user_" + user;
  var scores;

  if (localStorage[user] === undefined) {
    localStorage[user] = JSON.stringify([]);
  }

  scores = JSON.parse(localStorage[user]);
  scores.push(score);
  localStorage[user] = JSON.stringify(scores);

  showUserLogged();
}

function handleUserName() {
  var name = $("#userNameField").val();
  
  if (name !== "") {
    localStorage["currentUser"] = name;

    $("#userForm").hide();
    showUserLogged();   
  }
}

function showUserLogged() {
  var userScoreArrayName = "user_" + localStorage["currentUser"],
      scoreArray = [];
  if (localStorage[userScoreArrayName]) {
    scoreArray = JSON.parse(localStorage[userScoreArrayName]);
  };
  $("#userLogged").html("Playing: " + localStorage["currentUser"] + " (Games played: " + scoreArray.length + ", average score: " + countPlayerAverageScore(scoreArray) + ") <a href='#' id='resetUserStats'>Reset stats</a><br><button type='button' id='userNameChangeButton'>Change</button><button type='button' id='userResetButton'>Play anonymously</button>").show();
  $("#userNameChangeButton").on("click", handleUserNameChange);
  $("#userResetButton").on("click", handleUserReset);
  $("#resetUserStats").on("click", function() {
    handleUserStatsReset(localStorage["currentUser"]);
  });
}

function handleUserNameChange() {
  $("#userLogged").hide();
  $("#userForm").show();
}

function handleUserReset() {
  localStorage.removeItem("currentUser");
  $("#userLogged").hide();
  $("#userNameField").val("");
  $("#userForm").show();
}

function handleUserStatsReset(user) {
  if (confirm("Reset playing data for user " + user + "?")) {
    user = "user_" + user;
    localStorage.removeItem(user);
  }

  showUserLogged();
}

function updateHighScores(score) {
  score = score || {name: "Anon", score: 0};

  console.log("Score " + score.score);

  if (localStorage["highScores"]) {
    highScores = JSON.parse(localStorage["highScores"]);
    console.log("no " + highScores.length);

    for (var i = 0; i < highScores.length; i++) {
      if (score.score > highScores[i].score) {
        console.log("i: " + i);
        highScores.splice(i, 0, score);
        break;
      } else if (i === highScores.length - 1) {
        highScores.push(score);
        break;
      }
    }
  } else {
    highScores = [];
    highScores.push(score);
  }

  if (highScores.length > highScoreTableSize) {
    highScores.splice(highScoreTableSize, 1);
  }

  localStorage["highScores"] = JSON.stringify(highScores);  
}

function printHighScores() {
  var hsString = "<tr><th>#</th><th>Player</th><th>Score</th><tr>";
  var highScores = [];

  if (localStorage["highScores"]) {
    highScores = JSON.parse(localStorage["highScores"]);

    for (var i = 0; i < highScores.length; i++) {
      hsString += "<tr><td>" + (i + 1) + "</td><td>" + highScores[i].name + "</td><td>" + highScores[i].score + "</td></tr>";
    }
  }

  $("#highScoreTable").html(hsString);
}

function countPlayerAverageScore(scores) {
  var temp = 0,
      average;
      scores = scores || [];
  if (scores.length > 0) {
    for (var i = 0; i < scores.length; i++) {
      console.log(scores[i]);
      temp += scores[i];
    }

    average = temp / scores.length;
    average = average.toFixed(2);

    return average;
  } else {
    return "-";
  }
}