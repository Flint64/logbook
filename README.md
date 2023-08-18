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

## Changelog v0.2.1

### Added
- Spells now have an accuracy rating, and can miss
- Any effects active on a party member are now displayed above their ATB gauge
- Both spells & potions now have the ability (depending on the spell/item) to target your own party, enemies, or both

### Changed
- Reworked CSS for whole page, now limited to a smaller size and looks better on mobile screens with less empty space at screen edge
- Removed min/max damage on spells; they now scale based on intelligence & spell power
- Reworked how effects are calculated and applied to enemies/party members
- Enemy ATB now uses the same base as party member ATB

### Fixed
- Fixed poison damage not applying correctly
- Fixed poison damage minimum to 1
- Fixed strength effect not applying due to wrong name reference
- Fixed rage effect. It now functions correctly with the new addition of 3 party members.
- Info window popup now scales size correctly on larger screens
