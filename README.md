"# pokergame" 

can be played at: http://jmk82.github.io/pokergame/

This is a simple one player poker game which was developed while practising JavaScript/jQuery/jQueryUI/LocalStorage. The appearance of the game isn't too polished but the functionality should work :)

Game instructions:

Your object is to make as many points as possible by forming five poker hands. Initial deal is one card for each hand. Each column is a poker hand. On a round you must insert one card to each hand. You can't add a third card to a hand before each hand has two cards and the round is completed. When all hands are ready five card poker hands (totally 25 cards are dealt) the score is calculated for each hand and the sum is your final score.

How to play:
- drag and drop the dealt card from the pile to a hand or double click the pile where you want to insert the card
- animation speed for card when pile is doubleclicked can be changed (or disable the animation)
- You can enter a name so your score can be recorded to local TOP-5 list (on browser LocalStorage). Also number of your games and average score is kept.
- High scores and player scores can be reseted any time
- new deal can be started anytime

pokergame.js includes game and UI logic
pokerhandevaluator.js includes card, deck and poker logic. In this game it is used to evaluate poker hand value. Includes also functionality to compare which hand of two hands wins a poker deal (or if it is a tie). This functionality is tested with project Euler problem #54 "Poker hands" test material.
