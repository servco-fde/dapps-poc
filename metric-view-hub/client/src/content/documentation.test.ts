import { describe, expect, it } from 'vitest';
import {
  APP_CAPABILITIES,
  DOCUMENTATION_ROUTES,
  DOCUMENTATION_SECTION_IDS,
  PUBLIC_BINDINGS,
  REFERENCE_CLASSIFICATIONS,
  REFERENCE_ITEMS,
  REPOSITORY_GUIDES,
  SOURCE_MAP,
  USER_GUIDE_FAQS,
} from './documentation';

describe('in-app documentation content', () => {
  it('defines stable, unique documentation routes and section ids', () => {
    expect(new Set(Object.values(DOCUMENTATION_ROUTES)).size).toBe(Object.keys(DOCUMENTATION_ROUTES).length);

    const sectionIds = Object.values(DOCUMENTATION_SECTION_IDS);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    sectionIds.forEach((sectionId) => expect(sectionId).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
  });

  it('includes the required user and FDE guide content', () => {
    expect(APP_CAPABILITIES).toHaveLength(4);
    expect(USER_GUIDE_FAQS.length).toBeGreaterThanOrEqual(4);
    expect(REFERENCE_ITEMS.length).toBeGreaterThanOrEqual(8);

    const documentedClassifications = new Set(REFERENCE_ITEMS.flatMap((item) => item.classifications));
    expect(documentedClassifications).toEqual(new Set(REFERENCE_CLASSIFICATIONS));
  });

  it('only uses controlled classification values', () => {
    REFERENCE_ITEMS.forEach((item) => {
      expect(item.classifications.length).toBeGreaterThan(0);
      item.classifications.forEach((classification) => {
        expect(REFERENCE_CLASSIFICATIONS).toContain(classification);
      });
    });
  });

  it('keeps the public binding inventory deliberately small and non-secret', () => {
    expect(Object.keys(PUBLIC_BINDINGS).sort()).toEqual(
      ['appName', 'lakebaseProject', 'lakebaseSchema', 'metricView', 'metricViewAlias', 'sqlWarehouse'].sort()
    );

    const prohibitedValuePatterns = [
      /@/,
      /bearer/i,
      /client[_-]?secret/i,
      /password/i,
      /roberto/i,
      /token/i,
      /^adb-\d/i,
    ];

    Object.values(PUBLIC_BINDINGS).forEach((value) => {
      prohibitedValuePatterns.forEach((pattern) => expect(value).not.toMatch(pattern));
    });
  });

  it('uses reviewable repository links for source and operational guidance', () => {
    [...SOURCE_MAP, ...REPOSITORY_GUIDES].forEach((item) => {
      expect(item.href).toMatch(/^https:\/\/github\.com\/rdelgd\/dapps-poc\/blob\/main\//);
    });
  });
});
