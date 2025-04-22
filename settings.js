export const MODULE_NAME = "foundryvtt-coc7th-helper";
export const MODULE_VERSION = "1.0.0";
export const MODULE_DESCRIPTION = "A module for CoC 7th edition";

// Default effect file paths
export const DEFAULT_EFFECT_FILES = {
    melee: {
        fumble: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_12_Regular_Blue_400x400.webm",
        failure: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_01_Regular_Blue_400x400.webm",
        regular: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Flurry_Of_Blows/FlurryOfBlows_01_Regular_Blue_Magical02_800x600.webm",
        hard: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Flurry_Of_Blows/FlurryOfBlows_01_Regular_Blue_Magical02_800x600.webm",
        extreme: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Physical02_800x600.webm"
    },
    range: {
        fumble: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_10_Regular_Orange_400x400.webm",
        failure: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_03_Regular_Blue_90ft_4000x400.webm",
        regular: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_01_Regular_Orange_30ft_1600x400.webm",
        hard: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_02_Regular_Orange_60ft_2800x400.webm",
        extreme: "modules/JB2A_DnD5e/Library/Generic/Impact/GroundCrackImpact_01_Regular_Orange_600x600.webm"
    }
};

// Default scale factor mapping
export const DEFAULT_SCALE_FACTORS = {
    fumble: 1.0,
    failure: 0.7,
    regular: 0.7,
    hard: 0.9,
    extreme: 1.2
};

// Register module settings
export function registerSettings() {
    // Enable/disable effects
    game.settings.register(MODULE_NAME, "enableEffects", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEnableEffects"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEnableEffectsHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    // Enable/disable melee effects
    game.settings.register(MODULE_NAME, "enableMeleeEffects", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEnableMeleeEffects"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEnableMeleeEffectsHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    // Enable/disable range effects
    game.settings.register(MODULE_NAME, "enableRangeEffects", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEnableRangeEffects"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEnableRangeEffectsHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    // Melee effect files
    game.settings.register(MODULE_NAME, "meleeFumbleEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingMeleeFumbleEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.melee.fumble,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "meleeFailureEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingMeleeFailureEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.melee.failure,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "meleeRegularEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingMeleeRegularEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.melee.regular,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "meleeHardEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingMeleeHardEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.melee.hard,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "meleeExtremeEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingMeleeExtremeEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.melee.extreme,
        requiresReload: true
    });

    // Range effect files
    game.settings.register(MODULE_NAME, "rangeFumbleEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingRangeFumbleEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.range.fumble,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "rangeFailureEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingRangeFailureEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.range.failure,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "rangeRegularEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingRangeRegularEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.range.regular,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "rangeHardEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingRangeHardEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.range.hard,
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "rangeExtremeEffect", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingRangeExtremeEffect"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingEffectFilesHint"),
        scope: "world",
        config: true,
        type: String,
        default: DEFAULT_EFFECT_FILES.range.extreme,
        requiresReload: true
    });

    // Custom scale factors
    game.settings.register(MODULE_NAME, "fumbleScaleFactor", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactors"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactorsHint"),
        scope: "world",
        config: true,
        type: String,
        default: "1.0",
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "failureScaleFactor", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactors"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactorsHint"),
        scope: "world",
        config: true,
        type: String,
        default: "0.7",
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "regularScaleFactor", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactors"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactorsHint"),
        scope: "world",
        config: true,
        type: String,
        default: "0.7",
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "hardScaleFactor", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactors"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactorsHint"),
        scope: "world",
        config: true,
        type: String,
        default: "0.9",
        requiresReload: true
    });

    game.settings.register(MODULE_NAME, "extremeScaleFactor", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactors"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingScaleFactorsHint"),
        scope: "world",
        config: true,
        type: String,
        default: "1.2",
        requiresReload: true
    });

    // Debug mode
    game.settings.register(MODULE_NAME, "debugMode", {
        name: game.i18n.localize("Fvtt_CoC7th_Helper.SettingDebugMode"),
        hint: game.i18n.localize("Fvtt_CoC7th_Helper.SettingDebugModeHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
}

// Get the current effect files based on settings
export function getEffectFiles() {
    return {
        melee: {
            fumble: game.settings.get(MODULE_NAME, "meleeFumbleEffect"),
            failure: game.settings.get(MODULE_NAME, "meleeFailureEffect"),
            regular: game.settings.get(MODULE_NAME, "meleeRegularEffect"),
            hard: game.settings.get(MODULE_NAME, "meleeHardEffect"),
            extreme: game.settings.get(MODULE_NAME, "meleeExtremeEffect")
        },
        range: {
            fumble: game.settings.get(MODULE_NAME, "rangeFumbleEffect"),
            failure: game.settings.get(MODULE_NAME, "rangeFailureEffect"),
            regular: game.settings.get(MODULE_NAME, "rangeRegularEffect"),
            hard: game.settings.get(MODULE_NAME, "rangeHardEffect"),
            extreme: game.settings.get(MODULE_NAME, "rangeExtremeEffect")
        }
    };
}

// Get the current scale factors based on settings
export function getScaleFactors() {
    return {
        fumble: parseFloat(game.settings.get(MODULE_NAME, "fumbleScaleFactor")),
        failure: parseFloat(game.settings.get(MODULE_NAME, "failureScaleFactor")),
        regular: parseFloat(game.settings.get(MODULE_NAME, "regularScaleFactor")),
        hard: parseFloat(game.settings.get(MODULE_NAME, "hardScaleFactor")),
        extreme: parseFloat(game.settings.get(MODULE_NAME, "extremeScaleFactor"))
    };
}

// Check if effects are enabled
export function areEffectsEnabled() {
    return game.settings.get(MODULE_NAME, "enableEffects");
}

// Check if melee effects are enabled
export function areMeleeEffectsEnabled() {
    return game.settings.get(MODULE_NAME, "enableMeleeEffects");
}

// Check if range effects are enabled
export function areRangeEffectsEnabled() {
    return game.settings.get(MODULE_NAME, "enableRangeEffects");
}

// Check if debug mode is enabled
export function isDebugModeEnabled() {
    return game.settings.get(MODULE_NAME, "debugMode");
}
