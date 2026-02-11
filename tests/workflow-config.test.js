/**
 * Workflow Configuration Tests
 * Tests for WORKFLOW_CONFIG, PHASES constant, and getPhaseMetadata
 */

import {
  WORKFLOW_CONFIG,
  PHASES,
  getPhaseMetadata,
} from '../shared/js/workflow.js';

describe('WORKFLOW_CONFIG', () => {
  it('should have required structure', () => {
    expect(WORKFLOW_CONFIG).toBeDefined();
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    expect(WORKFLOW_CONFIG.phases).toBeInstanceOf(Array);
    expect(WORKFLOW_CONFIG.phases.length).toBe(3);
  });

  it('should have required phase properties', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(typeof phase.name).toBe('string');
      expect(typeof phase.description).toBe('string');
      expect(typeof phase.aiModel).toBe('string');
      expect(typeof phase.icon).toBe('string');
    });
  });

  it('should have phase types generate/critique/synthesize', () => {
    expect(WORKFLOW_CONFIG.phases[0].type).toBe('generate');
    expect(WORKFLOW_CONFIG.phases[1].type).toBe('critique');
    expect(WORKFLOW_CONFIG.phases[2].type).toBe('synthesize');
  });
});

describe('PHASES constant', () => {
  it('should be same as WORKFLOW_CONFIG.phases', () => {
    expect(PHASES).toBe(WORKFLOW_CONFIG.phases);
  });
});

describe('getPhaseMetadata', () => {
  it('should return phase 1 metadata', () => {
    const meta = getPhaseMetadata(1);
    expect(meta.number).toBe(1);
    expect(meta.name).toBe('Generate');
  });

  it('should return phase 2 metadata', () => {
    const meta = getPhaseMetadata(2);
    expect(meta.number).toBe(2);
    expect(meta.name).toBe('Critique');
  });

  it('should return phase 3 metadata', () => {
    const meta = getPhaseMetadata(3);
    expect(meta.number).toBe(3);
    expect(meta.name).toBe('Synthesize');
  });

  it('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(99)).toBeUndefined();
    expect(getPhaseMetadata(0)).toBeUndefined();
  });
});

