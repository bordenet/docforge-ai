/**
 * Validator Prompts Module - LLM prompt generation for document validation
 *
 * Generates three types of prompts:
 * 1. LLM Scoring - Get AI to score the document
 * 2. Critique - Get AI to ask clarifying questions
 * 3. Rewrite - Get AI to rewrite the document to score 85+
 *
 * @module validator-prompts
 */

/**
 * Generate scoring rubric from plugin dimensions
 * @param {Object} plugin - Plugin configuration
 * @returns {string} Formatted rubric
 */
function generateScoringRubric(plugin) {
  const dimensions = plugin.scoringDimensions || [];
  return dimensions
    .map(
      (dim, i) =>
        `### ${i + 1}. ${dim.name} (${dim.maxPoints} points)\n- ${dim.description}`
    )
    .join('\n\n');
}

/**
 * Generate LLM scoring prompt for a document
 * @param {string} content - Document content to score
 * @param {Object} plugin - Plugin configuration
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(content, plugin) {
  const rubric = generateScoringRubric(plugin);
  const totalPoints = plugin.scoringDimensions?.reduce((sum, d) => sum + d.maxPoints, 0) || 100;

  return `You are an expert evaluating a ${plugin.name} document.

Score this document using the following rubric (0-${totalPoints} points total).

## SCORING RUBRIC

${rubric}

## CALIBRATION GUIDANCE
- Be HARSH. Most documents score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for stakeholder review.
- Deduct points for vague qualifiers without specific metrics.
- Deduct points for weasel words ("should be able to", "might", "could potentially").
- Deduct points for marketing fluff ("best-in-class", "cutting-edge", "world-class").
- Reward quantified metrics with baselines AND targets.

## DOCUMENT TO EVALUATE

\`\`\`
${content}
\`\`\`

<output_rules>
Your response must be EXACTLY in this format - no deviations:
- Start with "**TOTAL SCORE:**" (no preamble)
- End after "Top 3 Strengths" (no sign-off)
- NO markdown code fences wrapping your response
</output_rules>

## REQUIRED OUTPUT FORMAT

**TOTAL SCORE: [X]/${totalPoints}**

${plugin.scoringDimensions?.map((dim) => `### ${dim.name}: [X]/${dim.maxPoints}\n[2-3 sentence justification]`).join('\n\n')}

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} content - Document content to critique
 * @param {Object} plugin - Plugin configuration
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(content, plugin, currentResult) {
  const issues = currentResult?.issues?.slice(0, 5).map((i) => `- ${i}`).join('\n') || '- None detected';
  const totalPoints = plugin.scoringDimensions?.reduce((sum, d) => sum + d.maxPoints, 0) || 100;

  return `You are a senior expert helping improve a ${plugin.name}.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult?.totalScore || 0}/${totalPoints}

Key issues detected:
${issues}

## DOCUMENT TO CRITIQUE

\`\`\`
${content}
\`\`\`

## YOUR TASK

Help the author improve this document by asking clarifying questions.

## REQUIRED OUTPUT FORMAT

**Score Summary:** ${currentResult?.totalScore || 0}/${totalPoints}

**Top 3 Issues:**
1. [Most critical gap - be specific]
2. [Second most critical gap]
3. [Third most critical gap]

**Questions to Improve Your Document:**
1. **[Question about missing/weak area]**
   _Why this matters:_ [How answering this improves the score]

2. **[Question about another gap]**
   _Why this matters:_ [Score impact]

3. **[Question about specificity/metrics]**
   _Why this matters:_ [Score impact]

(Provide 3-5 questions total, focused on the weakest dimensions)

**Quick Wins (fix these now):**
- [Specific fix that doesn't require user input]
- [Another immediate improvement]

<output_rules>
- Start directly with "**Score Summary:**" (no preamble)
- Do NOT include a rewritten document
- Only provide questions and quick wins
- NO markdown code fences wrapping the output
</output_rules>`;
}

/**
 * Generate rewrite prompt
 * @param {string} content - Document content to rewrite
 * @param {Object} plugin - Plugin configuration
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(content, plugin, currentResult) {
  const rubric = generateScoringRubric(plugin);
  const totalPoints = plugin.scoringDimensions?.reduce((sum, d) => sum + d.maxPoints, 0) || 100;

  return `You are a senior expert rewriting a ${plugin.name} to achieve a score of 85+.

## CURRENT SCORE: ${currentResult?.totalScore || 0}/${totalPoints}

## ORIGINAL DOCUMENT

\`\`\`
${content}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished ${plugin.name} that scores 85+ across all dimensions:

${rubric}

**Additional Requirements:**
- No vague qualifiers, weasel words, marketing fluff
- Include specific metrics with baselines and targets
- Be concise but complete

<output_rules>
- Output ONLY the rewritten document
- Start with "# [Title]" (no preamble)
- End after the last section (no sign-off)
- NO markdown code fences wrapping the output
- Ready to paste directly
</output_rules>`;
}

