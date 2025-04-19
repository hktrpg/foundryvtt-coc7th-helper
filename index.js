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

// Define effect file mapping based on attack type and success level
// These will be overridden by settings when the module is loaded
let effectFiles = {
    melee: {
        fumble: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_12_Regular_Blue_400x400.webm", // Melee Fumble: Blue failure effect
        failure: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_01_Regular_Blue_400x400.webm", // Melee Failure: Light blue impact
        regular: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_02_Regular_White_800x600.webm", // Melee Regular Success: Basic sword strike
        hard: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_04_Regular_White_800x600.webm", // Melee Hard Success: Powerful sword strike
        extreme: "modules/JB2A_DnD5e/Library/Generic/Impact/GroundCrackImpact_03_Regular_Orange_600x600.webm" // Melee Extreme Success: Ground crack effect
    },
    range: {
        fumble: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_10_Regular_Orange_400x400.webm", // Range Fumble: Orange failure effect
        failure: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_White_15ft_1000x400.webm", // Range Failure: Basic arrow
        regular: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_01_Regular_Orange_30ft_1600x400.webm", // Range Regular Success: Basic bullet
        hard: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_02_Regular_Orange_60ft_2800x400.webm", // Range Hard Success: Powerful bullet
        extreme: "modules/JB2A_DnD5e/Library/Generic/Impact/GroundCrackImpact_01_Regular_Orange_600x600.webm" // Range Extreme Success: Ground explosion effect
    }
};

// Define scale factor mapping
// These will be overridden by settings when the module is loaded
let scaleFactors = {
    fumble: 1.0, // Exaggerated effect
    failure: 0.7,
    regular: 0.7,
    hard: 0.9,
    extreme: 1.2
};

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
    const rollResult = content.find(".coc7.roll-result");
    const chatCard = content.find(".coc7.chat-card");

    if (!rollResult.length) {
        console.warn(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogRollResultNotFound")}`);
        return;
    }

    // Extract roll result attributes
    const successLevel = parseInt(rollResult.data("success-level") || 0);
    const isSuccess = rollResult.data("is-success") === "true";
    const isFumble = rollResult.data("is-fumble") === "true";
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
    }

    // Method 2: Try using the direct actor ID
    if (!attacker && directActorId) {
        attacker = canvas.tokens.placeables.find(t => t.actor.id === directActorId);
    }

    // Method 3: Try using the full actor key as is
    if (!attacker && fullActorKey) {
        attacker = canvas.tokens.placeables.find(t => t.actor.id === fullActorKey);
    }

    if (!attacker) {
        console.warn(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogAttackerNotFound", {actorKey: fullActorKey, actorId: directActorId})}`);
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
        
        console.log(`${MODULE_NAME} | ${game.i18n.localize("Fvtt_CoC7th_Helper.LogWeaponRoll", {
            attackType: attackTypeLocalized,
            attackerName: attacker.name,
            targetName: target ? target.name : game.i18n.localize("Fvtt_CoC7th_Helper.NoTarget"),
            weaponId: itemId,
            result: resultText,
            effectFile: effectFile
        })}`);
    }
});