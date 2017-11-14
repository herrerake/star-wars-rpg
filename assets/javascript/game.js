$(document).ready(function() {
  // GLOBAL VARIABLES
  // ===================================================================

  // Creating an object to hold our characters.
  var characters = {
    "Luke Skywalker": {
      name: "Luke Skywalker",
      health: 140,
      attack: 30,
      imageUrl: "assets/images/luke.jpg",
      counterAttack: 15
    },
    "Princess Leia": {
      name: "Princess Leia",
      health: 200,
      attack: 10,
      imageUrl: "assets/images/leia.jpg",
      counterAttack: 20
    },
    "Yoda": {
      name: "Yoda",
      health: 160,
      attack: 20,
      imageUrl: "assets/images/yoda.jpg",
      counterAttack: 40
    },
    "Darth Vader": {
      name: "Darth Vader",
      health: 150,
      attack: 20,
      imageUrl: "assets/images/darth-vader.jpg",
      counterAttack: 40
    }
  }

  // variable place holder for the character choosen by the user
  var attacker;
  // array with the characters that the user didnt choose
  var combatants = [];
  // variable place holder for the character being attacked
  var defender;
  // turns counter
  var turnCounter = 1;
  // tracks number of defeated opponents.
  var killCount = 0;

  // FUNCTIONS
  // ===================================================================

  // Function that will render characters to the pages
  // the character rendered, the area they are rendered to and their status is determined by the arguments passed in

  var renderCharacter = function(character, renderArea) {
    // this block of code builds the character card and renders it to the pages
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<h4 class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text('HP: ' + character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);
  };

  // this function will load all the characters into the character section to be selection to be selected
  var initializeGame = function() {
    // loop through the characters object and call the renderCharacter function on each character to render their card
    for (var key in characters) {
      renderCharacter(characters[key], "#characters-section");
    }
  };
  // call the function
  initializeGame();

  // This function handles updating the selected player or the current defender. If there is no selected player/defender
  // function will also place the character based on the areaRender chosen.
  var updateCharacter = function(charObj, areaRender) {
    // first we empty the area so that we can re-render the new object
    $(areaRender).empty();
    renderCharacter(charObj, areaRender);
  };

  // This function will render the available-to-attack enemies. This should be run once after a character has been selected
  var renderEnemies = function(enemyArr) {
    for (var i = 0; i < enemyArr.length; i++) {
      renderCharacter(enemyArr[i], "#available-to-attack-section");
    }
  };

  // function to handle rendering game messages.
  var renderMessage = function(message) {
    // builds the message and appends it to the page.
    var gameMessageSet = $("#game-message");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);
  };

  // Function which handles restarting the game after victory or defeat
  var restartGame = function(resultMessage) {
    // when the 'restart' button is clicked, reload the pages
    var restart = $("<button>Restart</button>").click(function() {
      location.reload();
    });
    // build div that will display the victory/defeat message
    var gameState = $("<div>").text(resultMessage);

    // Render the restart button and victory/defeat message to the page
    $("body").append(gameState);
    $("body").append(restart);
  };

  // Function to clear the game message section
  var clearMessage = function() {
    var gameMessage = $("#game-message");
    gameMessage.text("");
  };

  // ===================================================================

  // on click event for selecting our character
  $("#characters-section").on("click", ".character", function() {
    // saving the clicked character's name
    var name = $(this).attr("data-name");

    //if a player character has not yet been choosen...
    if (!attacker) {
      // we populate attacker with the selected character's info
      attacker = characters[name];
      // then loop through the remaining characters and push them to the combatants array
      for (var key in characters) {
        if (key !== name) {
          combatants.push(characters[key]);
        }
      }
      // hide the character select div
      $("#characters-section").hide();
      $(".hideTitle").hide();

      // then render our selected characters and our combatants
      updateCharacter(attacker, "#selected-character");
      renderEnemies(combatants);
    }
  });

  // Creates an on click event for each enemy
  $("#available-to-attack-section").on("click", ".character", function() {
    // saving the opponents name
    var name = $(this).attr("data-name");

    // If there is no defender, the clicked enemy will become the defender
    if ($("#defender").children().length === 0) {
      defender = characters[name];
      updateCharacter(defender, "#defender");

      // remove element as it will now be a new defender
      $(this).remove();
      clearMessage();
      $("#available-to-attack-section").hide();
    }
  });

  // when you click the attack button run the following game logic
  $("#attack-button").on("click", function() {
    // If there is a defender, combat will occur
    if($("#defender").children().length !==0) {
      // creates message for our attack and our opponents counter attack
      var attackMessage = "You attacked " + defender.name + " for " + attacker.attack * turnCounter + "damage.";
      var counterAttackMessage = defender.name + " attacked you back for " + defender.counterAttack + " damage.";
      clearMessage();

      // reduce defender's health by your attack value
      defender.health -= attacker.attack * turnCounter;

      // If the enemy still has health
      if (defender.health > 0) {
        // render the enemys updated character card
        updateCharacter(defender, "#defender");

        // render the combat message
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        // reduce your health by the opponents attack value
        attacker.health -= defender.counterAttack;

        // render the players updated character card
        updateCharacter(attacker, "#selected-character");

        // End game if health is below zero
        // call the restart game function to allow the user to restart the game
        if (attacker.health <= 0) {
          clearMessage();
          restartGame("YOU LOSE GAME OVER!");
          $("#attack-button").off("click");
        }
      }
      else {
        // kill the defender and remove their card
        $("#defender").empty();
        $("#available-to-attack-section").show();
        var gameStateMessage = "You have defeated " + defender.name + ", choose another enemy to defeat!";
        renderMessage(gameStateMessage);

        // increment kill count
        killCount++;

        // if all enemies are killed you win
        // call restart function to allow user to play again
        if (killCount >= combatants.length) {
          clearMessage();
          $("#attack-button").off("click");
          restartGame("YOU WIN! GAME OVER!!!");
        }
      }
      //increment turn counter. this is used for determining how much damage the player does
      turnCounter++;
    }
    else {
      // if there is no defender render an error message
      clearMessage();
      renderMessage("No enemy here.")
    }
  });
});
