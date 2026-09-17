import { describe, expect, it } from 'vitest';
import { extractPublicText, generateSearchContent } from '../../scripts/generate-search-content.mjs';
import generated from '../../src/data/page-search-content.json';

describe('public page search content generation', () => {
  it('indexes visible copy while excluding comments, imports, CSS and media paths', () => {
    const content = extractPublicText(`
      import PrivateModule from 'private-module';
      const cards = [{ title: 'Card heading', description: 'Actual card detail', image: '/private-image.jpg', className: 'secret-style' }];
      function Page() { return <section className="hidden-style"><h1>School &amp; Community</h1>{/* Removed secret content */}<p>{'Visible expression'}</p></section> }
    `);
    expect(content).toContain('School & Community');
    expect(content).toContain('Actual card detail');
    expect(content).toContain('Visible expression');
    expect(content).not.toMatch(/secret|private|hidden-style/);
  });

  it('keeps tab content separate and fails if a configured scope disappears', () => {
    const source = 'function First() { return <p>First tab</p> } function Second() { return <p>Second tab</p> }';
    expect(extractPublicText(source, 'Second')).toBe('Second tab');
    expect(() => extractPublicText(source, 'Missing')).toThrow('Missing public content scope');
  });

  it('keeps the checked-in index synchronized with public page copy', () => {
    expect(generateSearchContent()).toEqual(generated);
  });
});
