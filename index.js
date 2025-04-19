// Import settings
import {
    MODULE_NAME,
    registerSettings,
    getEffectFiles,
    getScaleFactors,
    areEffectsEnabled,
    areMeleeEffectsEnabled,
    areRangeEffectsEnabled,
    isDebugModeEnabled,
    isTokenDebugModeEnabled
} from './settings.js';

// Initialize variables for effect files and scale factors
let effectFiles = {};
let scaleFactors = {};

// Initialize module
Hooks.once('init', () => {
    registerSettings();
    console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogInitializing")}`);
});

// Update effect files and scale factors from settings when ready
Hooks.once('ready', () => {
    effectFiles = getEffectFiles();
    scaleFactors = getScaleFactors();
    console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogSettingsLoaded")}`);
});

Hooks.on("updateChatMessage", async (message) => {
    // Debug logging if enabled
    if (isDebugModeEnabled()) {
        console.log("updateChatMessage", message);
    }

    // Check if effects are enabled
    if (!areEffectsEnabled()) {
        if (isDebugModeEnabled()) {
            console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogEffectsDisabled")}`);
        }
        return;
    }

    // Ensure message is from CoC7 system's weapon roll (melee or range)
    if (!message.content.includes("coc7 chat-card")) return;

    // Determine attack type
    let attackType = null;
    if (message.content.includes("melee initiator")) {
        attackType = "melee";
        // Check if melee effects are enabled
        if (!areMeleeEffectsEnabled()) {
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogMeleeEffectsDisabled")}`);
            }
            return;
        }
    } else if (message.content.includes("range initiator")) {
        attackType = "range";
        // Check if range effects are enabled
        if (!areRangeEffectsEnabled()) {
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogRangeEffectsDisabled")}`);
            }
            return;
        }
    } else {
        return; // Not a melee or range roll, exit
    }

    // Parse chat message HTML content
    const content = $(message.content);
    const rollResult = content.find(".dice-roll");
    const chatCard = content.find(".coc7.chat-card");

    if (!rollResult.length) {
        console.warn(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogRollResultNotFound")}`);
        return;
    }

    // Extract roll result attributes
    const successLevel = parseInt(rollResult.data("success-level") || 0);
    const isSuccess = successLevel > 0;
    const isFumble = rollResult.data("fumble") === "true";
    const targetKey = chatCard.data("target-key"); // Target token ID
    const fullActorKey = rollResult.data("actor-key"); // Attacker actor ID
    const directActorId = rollResult.data("actor-id"); // Direct actor ID
    const itemId = chatCard.data("item-id"); // Weapon ID

    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Roll Result:`, {
            successLevel,
            isSuccess,
            isFumble,
            targetKey,
            fullActorKey,
            directActorId,
            itemId
        });
    }

    // Try to find the token using different methods
    let attacker = null;

    // Method 1: Try using the scene-scoped actor key
    if (fullActorKey && fullActorKey.includes(".")) {
        const sceneScopedTokenId = fullActorKey.split(".").pop();
        attacker = canvas.tokens.placeables.find(t => t.id === sceneScopedTokenId);
        
        if ((isDebugModeEnabled() || isTokenDebugModeEnabled()) && attacker) {
            console.log(`${MODULE_NAME} | Found attacker using scene-scoped token ID: ${sceneScopedTokenId}`);
        }
    }

    // Method 2: Try using the direct actor ID
    if (!attacker && directActorId) {
        attacker = canvas.tokens.placeables.find(t => t.actor.id === directActorId);
        
        if ((isDebugModeEnabled() || isTokenDebugModeEnabled()) && attacker) {
            console.log(`${MODULE_NAME} | Found attacker using direct actor ID: ${directActorId}`);
        }
    }

    // Method 3: Try using the full actor key as is
    if (!attacker && fullActorKey) {
        attacker = canvas.tokens.placeables.find(t => t.actor.id === fullActorKey);
        
        if ((isDebugModeEnabled() || isTokenDebugModeEnabled()) && attacker) {
            console.log(`${MODULE_NAME} | Found attacker using full actor key: ${fullActorKey}`);
        }
    }
    
    // Method 4: Try using the actor ID from the speaker
    if (!attacker && message.speaker && message.speaker.actor) {
        attacker = canvas.tokens.placeables.find(t => t.actor.id === message.speaker.actor);
        
        if ((isDebugModeEnabled() || isTokenDebugModeEnabled()) && attacker) {
            console.log(`${MODULE_NAME} | Found attacker using speaker actor ID: ${message.speaker.actor}`);
        }
    }
    
    // Method 5: Try using the token ID from the speaker
    if (!attacker && message.speaker && message.speaker.token) {
        attacker = canvas.tokens.placeables.find(t => t.id === message.speaker.token);
        
        if ((isDebugModeEnabled() || isTokenDebugModeEnabled()) && attacker) {
            console.log(`${MODULE_NAME} | Found attacker using speaker token ID: ${message.speaker.token}`);
        }
    }

    if (!attacker) {
        console.warn(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogAttackerNotFound", {actorKey: fullActorKey, actorId: directActorId})}`);
        
        // Try to find the actor in the game actors collection
        let actor = null;
        if (directActorId) {
            actor = game.actors.get(directActorId);
        } else if (fullActorKey) {
            actor = game.actors.get(fullActorKey);
        }
        
        if (actor) {
            console.warn(`${MODULE_NAME} | Actor found in game.actors but no token on canvas. Actor name: ${actor.name}`);
            
            // If token debug mode is enabled, log all tokens on the canvas
            if (isTokenDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | All tokens on canvas:`, canvas.tokens.placeables.map(t => ({
                    id: t.id,
                    name: t.name,
                    actorId: t.actor.id
                })));
            }
            
            // If we have a target, we can still show an effect at the target location
            if (target) {
                try {
                    // Create Sequencer sequence
                    const sequence = new Sequence()
                        .effect()
                        .file(effectFiles[attackType]["fumble"])
                        .scale(scaleFactors["fumble"])
                        .atLocation(target)
                        .center()
                        .missed(!isSuccess);
                    
                    sequence.play();
                    
                    if (isDebugModeEnabled()) {
                        console.log(`${MODULE_NAME} | Showing effect at target location since attacker token not found`);
                    }
                } catch (error) {
                    console.error(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogSequencerError", {error: error.message})}`);
                }
            }
        }
        
        return;
    }

    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Found attacker:`, {
            name: attacker.name,
            id: attacker.id,
            actorId: attacker.actor.id
        });
    }

    // Find target token, handle empty targetKey case
    let target = null;
    if (targetKey) {
        target = canvas.tokens.get(targetKey) || canvas.tokens.placeables.find(t => t.actor.id === targetKey);
    } else {
        // If targetKey is empty, check selected token
        const controlledTokens = canvas.tokens.controlled;
        if (controlledTokens.length === 1 && controlledTokens[0].id !== attacker.id) {
            target = controlledTokens[0];
            if (isDebugModeEnabled()) {
                console.warn(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogUsingSelectedToken", {tokenName: target.name})}`);
            }
        }
    }

    // Select effect and scale based on roll result
    let effectKey;
    if (isFumble) {
        effectKey = "fumble";
    } else if (!isSuccess) {
        effectKey = "failure";
    } else {
        switch (successLevel) {
            case 3:
                effectKey = "extreme";
                break;
            case 2:
                effectKey = "hard";
                break;
            case 1:
                effectKey = "regular";
                break;
            default:
                effectKey = "regular";
        }
    }

    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Selected effect:`, {
            effectKey,
            successLevel,
            isSuccess,
            isFumble
        });
    }

    // Select effect file based on attack type and success level
    const effectFile = effectFiles[attackType][effectKey];
    const scale = scaleFactors[effectKey];

    // Check if Sequencer module is available
    if (!game.modules.get("sequencer")) {
        console.warn(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogSequencerNotEnabled")}`);
        return;
    }

    try {
        // Create Sequencer sequence
        const sequence = new Sequence()
            .effect()
            .file(effectFile)
            .scale(scale);

        if (target) {
            // Has target: shoot from attacker to target
            sequence
                .atLocation(attacker)
                .stretchTo(target)
                .missed(!isSuccess); // Show offset effect when missed
        } else {
            // No target: show at attacker location
            sequence
                .atLocation(attacker)
                .center()
                .missed(!isSuccess);
            if (isDebugModeEnabled()) {
                console.warn(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogNoTargetToken", {tokenName: attacker.name})}`);
            }
        }

        sequence.play();
    } catch (error) {
        console.error(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogSequencerError", {error: error.message})}`);
    }

    // Log results (for debugging)
    if (isDebugModeEnabled()) {
        const attackTypeLocalized = game.i18n.localize(`Fvtt_CoC7th_Helper.AttackType${attackType.charAt(0).toUpperCase() + attackType.slice(1)}`);
        const resultText = isFumble 
            ? game.i18n.localize("Fvtt_CoC7th_Helper.EffectFumble") 
            : isSuccess 
                ? `${game.i18n.localize("Fvtt_CoC7th_Helper.EffectRegular")} (${game.i18n.localize("Fvtt_CoC7th_Helper.EffectLevel")} ${successLevel})` 
                : game.i18n.localize("Fvtt_CoC7th_Helper.EffectFailure");
        
        console.log(`${MODULE_NAME} | CoC7 ${attackType} 武器擲骰：${attacker.name} 對抗 ${target ? target.name : game.i18n.localize("Fvtt_CoC7th_Helper.NoTarget")}，武器ID：${itemId}，結果：${resultText}，效果：${effectFile}`);
    }
});