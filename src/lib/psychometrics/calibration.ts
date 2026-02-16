/**
 * Calibration module for psychometric scoring.
 * 
 * Purpose: LLMs tend to give "neutral" or "agreeable" responses (scores clustering around 3 on a 1-5 scale).
 * This module provides functions to:
 * 1. CENTER: Remove the observed LLM bias (shift distribution)
 * 2. EXPAND: Amplify small deviations from neutral to more clearly distinguish personality traits
 */

// Observed baseline for LLMs on 1-5 Likert scale (most models hover around 3.0-3.5)
export const LLM_BASELINE = {
    likert5Mean: 3.2,  // Typical LLM mean response
    likert5Std: 0.7,   // Typical standard deviation (compressed)
    targetMean: 3.0,   // Neutral point
    targetStd: 1.2,    // Desired spread for human-like variance
};

/**
 * Calibrate a single score using Z-score normalization and variance expansion.
 * 
 * @param rawScore - The raw score to calibrate
 * @param observedMean - The observed mean for this dimension (defaults to LLM baseline)
 * @param observedStd - The observed standard deviation (defaults to LLM baseline)
 * @param targetMean - The target mean after calibration
 * @param targetStd - The target standard deviation after calibration
 * @returns Calibrated score, clamped to valid range
 */
export function calibrateScore(
    rawScore: number,
    observedMean: number = LLM_BASELINE.likert5Mean,
    observedStd: number = LLM_BASELINE.likert5Std,
    targetMean: number = LLM_BASELINE.targetMean,
    targetStd: number = LLM_BASELINE.targetStd,
    minValue: number = 1,
    maxValue: number = 5
): number {
    // Z-score: how many standard deviations from observed mean
    const zScore = (rawScore - observedMean) / observedStd;

    // Transform to target distribution
    const calibrated = zScore * targetStd + targetMean;

    // Clamp to valid range
    return Math.max(minValue, Math.min(maxValue, calibrated));
}

/**
 * Calibrate MBTI dimension scores.
 * MBTI uses 8 items per dimension, scored 1-5. Sum range: 8-40. Midpoint: 24.
 * 
 * @param rawDimensionScore - Sum of 8 items (range 8-40)
 * @returns Calibrated score with expanded variance
 */
export function calibrateMBTIDimension(rawDimensionScore: number): number {
    // Expected neutral: 8 items * 3.0 = 24
    // Observed LLM neutral: 8 items * 3.2 = 25.6
    const observedMean = 25.6;
    const observedStd = 3.5;  // Compressed LLM variance
    const targetMean = 24;     // True neutral
    const targetStd = 5.0;     // Expanded for differentiation

    return calibrateScore(rawDimensionScore, observedMean, observedStd, targetMean, targetStd, 8, 40);
}

/**
 * Calibrate Big Five domain scores.
 * Big Five uses 24 items per domain, scored 1-5 (some reverse coded).
 * After reverse coding, sum range: 24-120. Midpoint: 72.
 * 
 * @param rawDomainScore - Sum of 24 items (range 24-120)
 * @returns Calibrated score with expanded variance
 */
export function calibrateBigFiveDomain(rawDomainScore: number): number {
    // Expected neutral: 24 items * 3.0 = 72
    // Observed LLM neutral: 24 items * 3.2 = 76.8
    const observedMean = 76.8;
    const observedStd = 8.0;   // Compressed LLM variance
    const targetMean = 72;      // True neutral
    const targetStd = 14.0;     // Expanded for differentiation

    return calibrateScore(rawDomainScore, observedMean, observedStd, targetMean, targetStd, 24, 120);
}

/**
 * Calibrate DISC scores.
 * DISC uses 28 word groups with Most/Least selection.
 * Current scoring: (Most - Least + 28) / 2, range 0-28.
 * 
 * @param rawQuadrantScore - The raw DISC quadrant score (range 0-28)
 * @returns Calibrated score
 */
export function calibrateDISCQuadrant(rawQuadrantScore: number): number {
    // For DISC, the issue is more that LLMs tend to pick "safe" options (S, C over D, I).
    // We'll apply a gentler calibration focused on variance expansion.
    const observedMean = 14;   // Theoretical neutral
    const observedStd = 3.5;   // Compressed
    const targetMean = 14;     // Keep centered
    const targetStd = 5.5;     // Expand variance

    return calibrateScore(rawQuadrantScore, observedMean, observedStd, targetMean, targetStd, 0, 28);
}
