// Import settings
import {
    MODULE_NAME,
    registerSettings,
    getEffectFiles,
    getScaleFactors,
    areEffectsEnabled,
    areMeleeEffectsEnabled,
    areRangeEffectsEnabled,
    isDebugModeEnabled
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

function getToken(tokenKey) {
    if (tokenKey) {
        const [sceneId, tokenId] = tokenKey.split('.')
        if (!sceneId || !tokenId) return null

        const scene = game.scenes.get(sceneId)
        if (!scene) return null

        const token = scene.getEmbeddedDocument('Token', tokenId)
        if (!token) return null

        return token
    }
    return null
}

Hooks.on("updateChatMessage", async (message) => {
    // Initial debug logging
    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogInitializing")}`);
        console.log(`${MODULE_NAME} | Debug - Processing new chat message:`, {
            messageId: message._id,
            speaker: message.speaker,
            content: message.content.substring(0, 100) + "..."
        });
    }

    // Check if effects are enabled
    if (!areEffectsEnabled()) {
        if (isDebugModeEnabled()) {
            console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogEffectsDisabled")}`);
        }
        return;
    }

    // Check if message is from CoC7 system
    if (!message.content.includes("coc7 chat-card")) {
        if (isDebugModeEnabled()) {
            console.log(`${MODULE_NAME} | Debug - Not a CoC7 chat card, skipping`);
        }
        return;
    }

    // Determine attack type
    let attackType = null;
    if (message.content.includes("melee initiator")) {
        attackType = "melee";
        if (!areMeleeEffectsEnabled()) {
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogMeleeEffectsDisabled")}`);
            }
            return;
        }
    } else if (message.content.includes("range initiator")) {
        attackType = "range";
        if (!areRangeEffectsEnabled()) {
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogRangeEffectsDisabled")}`);
            }
            return;
        }
    } else {
        if (isDebugModeEnabled()) {
            console.log(`${MODULE_NAME} | Debug - Not a melee or range attack, skipping`);
        }
        return;
    }

    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Processing ${game.i18n.localize(`Fvtt_CoC7th_Helper.AttackType${attackType.charAt(0).toUpperCase() + attackType.slice(1)}`)} attack`);
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
    const targetKey = rollResult.data("target-key") || chatCard.data("target-key");
    const fullActorKey = rollResult.data("actor-key") || chatCard.data("actor-key");
    const itemId = chatCard.data("item-id");

    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Extracted data:`, {
            successLevel,
            isSuccess,
            isFumble,
            targetKey,
            fullActorKey,
            itemId
        });
    }

    // Find attacker token
    let attacker = getToken(fullActorKey);
    if (!attacker) {
        // Try to get token from speaker data if available
        if (message.speaker?.scene && message.speaker?.token) {
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | Debug - Trying to find attacker from speaker data:`, {
                    scene: message.speaker.scene,
                    token: message.speaker.token
                });
            }
            attacker = getToken(`${message.speaker.scene}.${message.speaker.token}`);
        }

        if (!attacker) {
            console.warn(`${MODULE_NAME} | ${game.i18n.format("Fvtt_CoC7th_Helper.LogAttackerNotFound", { actorKey: fullActorKey, actorId: message.speaker?.actor })}`);
            return;
        }
    }

    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Found attacker:`, {
            name: attacker.name,
            id: attacker.id,
            actorId: attacker.actor.id
        });
    }

    // Find target token
    let target = null;
    if (targetKey && targetKey !== "0") {
        if (isDebugModeEnabled()) {
            console.log(`${MODULE_NAME} | Debug - Looking for target with key: ${targetKey}`);
        }
        target = getToken(targetKey);
    } else {
        // If targetKey is empty or "0", check selected token
        const controlledTokens = canvas.tokens.controlled;
        if (controlledTokens.length === 1 && controlledTokens[0].id !== attacker.id) {
            target = controlledTokens[0];
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | ${game.i18n.format("Fvtt_CoC7th_Helper.LogUsingSelectedToken", { tokenName: target.name })}`);
            }
        } else {
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | Debug - No valid target found`);
            }
        }
    }

    if (target && isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Found target:`, {
            name: target.name,
            id: target.id,
            actorId: target.actor.id
        });
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

    if (isDebugModeEnabled()) {
        console.log(`${MODULE_NAME} | Debug - Effect details:`, {
            effectFile,
            scale,
            attackType
        });
    }

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
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | Debug - Creating effect from attacker to target`);
            }
            sequence
                .atLocation(attacker)
                .stretchTo(target)
                .missed(!isSuccess);
        } else {
            // No target: show at attacker location
            if (isDebugModeEnabled()) {
                console.log(`${MODULE_NAME} | ${game.i18n.format("Fvtt_CoC7th_Helper.LogNoTargetToken", { tokenName: attacker.name })}`);
            }
            sequence
                .atLocation(attacker)
                .center()
                .randomSpriteRotation()
                .missed(!isSuccess);
        }

        if (isDebugModeEnabled()) {
            console.log(`${MODULE_NAME} | Debug - Playing sequence`);
        }
        sequence.play();
    } catch (error) {
        console.error(`${MODULE_NAME} | ${game.i18n.format("Fvtt_CoC7th_Helper.LogSequencerError", { error: error.message })}`);
    }

    // Final debug log
    if (isDebugModeEnabled()) {
        const resultText = isFumble
            ? game.i18n.localize("Fvtt_CoC7th_Helper.EffectFumble")
            : isSuccess
                ? `${game.i18n.localize("Fvtt_CoC7th_Helper.EffectRegular")} (${game.i18n.localize("Fvtt_CoC7th_Helper.EffectLevel")} ${successLevel})`
                : game.i18n.localize("Fvtt_CoC7th_Helper.EffectFailure");

        console.log(`${MODULE_NAME} | ${game.i18n.format("Fvtt_CoC7th_Helper.LogWeaponRoll", {
            attackType: game.i18n.localize(`Fvtt_CoC7th_Helper.AttackType${attackType.charAt(0).toUpperCase() + attackType.slice(1)}`),
            attackerName: attacker.name,
            targetName: target ? target.name : game.i18n.localize("Fvtt_CoC7th_Helper.NoTarget"),
            weaponId: itemId,
            result: resultText,
            effectFile: effectFile
        })}`);
    }
});