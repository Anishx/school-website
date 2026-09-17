import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const component = (name) => `src/components/${name}.tsx`;
const page = (name) => `src/app/(frontend)/${name}/page.tsx`;

// Only public, static page copy belongs here. CMS content is indexed through
// anonymous public loaders at request time, using the same sources as the page.
export const searchSources = {
  '/': ['hero-section', 'welcome-section', 'academic-programmes-section', 'highlights-grid', 'cta-bar'].map(component),
  '/about-us': [[component('about-us-client'), 'OverviewTab']],
  '/about-us?tab=teachers': [[component('about-us-client'), 'TeachersTab']],
  '/about-us?tab=infrastructure': [[component('about-us-client'), 'InfrastructureTab']],
  '/leadership': [page('leadership')],
  '/our-management': [page('our-management')],
  '/why-us': [page('why-us')],
  '/admissions': [page('admissions')],
  '/apply': [page('apply'), component('apply-client')],
  '/gallery': [page('gallery')],
  '/future-vision': [page('future-vision')],
  // These fallbacks are selected only when their public page uses legacy copy.
  'legacy-contact': [component('contact-section')],
};

const textFields = new Set(['title', 'subtitle', 'subtext', 'description', 'label', 'value', 'name', 'text', 'heading', 'eyebrow', 'stat', 'date', 'age', 'class', 'grade', 'role', 'quote', 'message', 'intro', 'organization', 'alt', 'note', 'stage', 'meta', 'category', 'number']);
const entities = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ' };
export function extractPublicText(source, scope) {
  const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const parts = [];
  const add = (text) => {
    const clean = text.replace(/&(#x[\da-f]+|#\d+|amp|apos|quot|lt|gt|nbsp);/gi, (match, entity) => {
      if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
      if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
      return entities[entity] ?? match;
    }).replace(/\s+/g, ' ').trim();
    if (clean && !/^(?:\/|https?:|tel:|mailto:|#)/.test(clean)) parts.push(clean);
  };
  const visit = (node) => {
    // Never index styling, event handlers, imports, comments, URLs or image paths.
    if (ts.isJsxAttribute(node)) {
      if (node.name.getText(ast) === 'alt' && node.initializer && ts.isStringLiteral(node.initializer)) add(node.initializer.text);
      return;
    }
    if (ts.isImportDeclaration(node)) return;
    if (ts.isJsxText(node)) add(node.text);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      if ((ts.isPropertyAssignment(parent) && textFields.has(parent.name.getText(ast))) ||
          ts.isArrayLiteralExpression(parent) || ts.isJsxExpression(parent) ||
          (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && ts.isJsxExpression(parent.parent)) ||
          (ts.isVariableDeclaration(parent) && parent.name.getText(ast).endsWith('_DISPLAY'))) add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  if (scope) {
    const target = ast.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === scope);
    if (!target) throw new Error(`Missing public content scope: ${scope}`);
    visit(target);
  } else visit(ast);
  return [...new Set(parts)].join('\n');
}

export function generateSearchContent() {
  return Object.fromEntries(Object.entries(searchSources).map(([href, sources]) => [href,
    sources.map((entry) => {
      const [file, scope] = Array.isArray(entry) ? entry : [entry];
      return extractPublicText(fs.readFileSync(path.join(root, file), 'utf8'), scope);
    }).join('\n'),
  ]));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = `${JSON.stringify(generateSearchContent(), null, 2)}\n`;
  const destination = 'src/data/page-search-content.json';
  if (process.argv.includes('--patch')) {
    console.log(`*** Begin Patch\n*** Add File: ${destination}\n${output.trimEnd().split('\n').map((line) => `+${line}`).join('\n')}\n*** End Patch`);
  } else {
    fs.writeFileSync(path.join(root, destination), output);
    console.log('Updated public page search content.');
  }
}
