# The Logbook

I've always liked games and the idea of building one myself one day.
I had an idea for a text-based game, and one day I figured, why not try building it?
And so, we have The Logbook. Currently, it's nothing more than a combat test page, 
allowing you to fight in a turn-based active time battle. I wanted a more robust text adventure, 
rather than your standard "read story, pick choices." I opted for a more 
RPG focused approach. Currently, it boasts the ability to cast spells and 
drink potions that can add various effects to yourself or the enemies you target. 
This is very much a work in progress.

## Playing the game
You can play The Logbook [here](https://flint64.github.io/logbook/combat-test).
The current version allows you to fight in a simple combat with 3 random enemies.
You have to 7 different potions and 2 spells, some of which have lingering
effects such as poison or burn damage. Once the battle is over, win or lose,
if you wish to play again, simply refresh the page and 3 new enemies will
be picked at random, and your stats/items will be refreshed.

The game plays equally well on both mobile and desktop screen sizes, and if
you're on a desktop, you can also use the numbers on your keyboard to select
menu options! 

## The Story
There is currently no formal story in this version of The Logbook, but if
you navigate to [the home page](https://flint64.github.io/logbook/) you
can get a bit of a preview of what is to come in later versions, starting
with the Path of the Sacrifice.

## Changelog v0.1.0
Since I wasn't keeping a record previously, the most recent release out 8/2/23
will start our versioning! Changes since the previous live release are as follows:

### Added
- Added ability to view help text for magic, functions the same as viewing help text for potions
- Added 3 party members rather than playing through with just a single player entity. Game auto selects first party member much like it auto selects the first enemy
- Added red flash to party borders when attacked to better reflect being hit

### Changed
- Renamed main menu 'Inventory' to 'Potions'
- Enrage spell now also increases attack power at the cost of more mana
- Changed how info is displayed in the history window, asterisks denote new entries, colors specific to players/enemy actions for easier reading

### Fixed
- Fixed duplicate enemies being linked together when added to the game and being treated as a single entity
- Fixed duplicate effects from applying to the player when they should be merged in to one effect with a longer duration
- Fixed spells not being grayed out if selected party member's ATB is less than 100
- Fixed rounding errors and preventing decimals when taking percent based health damage
- Fixed decrementing effects preventing enemy from dying when at 0 hp
- Fixed attacking an enemy not displaying red flash correctly
