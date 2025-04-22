# Foundry VTT CoC7th Helper

A Foundry VTT module that enhances Call of Cthulhu 7th Edition combat by adding visual effects for weapon attacks.

## Features

- Visual effects for both melee and ranged weapon attacks
- Different effects based on success levels:
  - Fumble
  - Failure
  - Regular Success
  - Hard Success
  - Extreme Success
- Customizable effect files and scale factors
- Support for both targeted and untargeted attacks
- Debug mode for troubleshooting

## Dependencies

- Foundry VTT
- Call of Cthulhu 7th Edition System
- [Sequencer](https://foundryvtt.com/packages/sequencer) module
- [JB2A Free](https://foundryvtt.com/packages/JB2A_DnD5e) or [JB2A Patreon](https://www.patreon.com/JB2A) module for animations

## Installation

1. In Foundry VTT, go to the "Add-on Modules" tab
2. Click "Install Module"
3. Enter the following URL:
   ```
   https://github.com/hktrpg/foundryvtt-coc7th-helper/releases/latest/download/module.json
   ```
4. Click "Install"

## Configuration

The module includes several configurable settings:

### Effect Files

You can customize the visual effects for different attack types and success levels:

- Melee attacks (fumble, failure, regular, hard, extreme)
- Ranged attacks (fumble, failure, regular, hard, extreme)

### Scale Factors

Adjust the size of effects for different success levels:

- Fumble: 1.0
- Failure: 0.7
- Regular: 0.7
- Hard: 0.9
- Extreme: 1.2

### General Settings

- Enable/Disable all effects
- Enable/Disable melee effects
- Enable/Disable ranged effects
- Debug mode

## Usage

The module automatically adds visual effects when:

1. A weapon attack is made (melee or ranged)
2. The attack roll is processed
3. A target is selected (optional)

Effects will play based on the success level of the attack roll.

## License

MIT License

## Credits

- Created by Sad
- Uses animations from JB2A
- Built for Foundry VTT and the Call of Cthulhu 7th Edition system
