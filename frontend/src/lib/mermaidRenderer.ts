import mermaid from 'mermaid';

let initialized = false;

export function initMermaid() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    suppressErrorRendering: true, // CRITICAL: Never append error SVG bomb icons to document.body
    securityLevel: 'loose',
    theme: 'neutral',
    themeVariables: {
      darkMode: false,
      background: '#FFFFFF',
      primaryColor: '#F4F5F5',
      primaryTextColor: '#232427',
      primaryBorderColor: '#232427',
      lineColor: '#E34A32',
      secondaryColor: '#FFFFFF',
      tertiaryColor: '#F4F5F5',
    },
  });
  initialized = true;
}

/**
 * Removes any stray Mermaid error elements that Mermaid might have inserted into document.body.
 */
export function cleanMermaidDOMArtifacts() {
  if (typeof document === 'undefined') return;
  try {
    const errorElements = document.querySelectorAll(
      '[id^="dmermaid"], [id^="mermaid-"][class*="error"], .error-icon, [aria-roledescription="error"]'
    );
    errorElements.forEach((el) => {
      // Only remove if it was appended directly to body
      if (el.parentElement === document.body) {
        el.remove();
      }
    });
  } catch (err) {
    // Ignore DOM cleanup errors
  }
}

/**
 * Auto-heals common Mermaid ERD and Flowchart syntax bugs before parsing:
 * 1. ERD: Fixes invalid cardinality symbols like '||..|' -> '||..||'
 * 2. ERD: Converts hyphens in entity names to underscores ('VENDOR-TYPE' -> 'VENDOR_TYPE')
 * 3. Flowchart: Quotes labels with slashes or ampersands like [I Want / e-SHOP] -> ["I Want / e-SHOP"]
 * 4. Flowchart: Removes trailing semicolons from 'class' statements
 */
export function sanitizeMermaidSyntax(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();

  // Strip Markdown code fences if present
  if (cleaned.startsWith('```mermaid')) {
    cleaned = cleaned.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  // --- ER DIAGRAM SANITIZATION ---
  if (cleaned.startsWith('erDiagram')) {
    // Fix invalid relationship cardinality symbols: single pipe on right side like '..| ' -> '..|| '
    cleaned = cleaned.replace(/(\|\||\}\||\|o|\}o)(\.\.|\-\-)\|(?![\|o\{\w])/g, '$1$2||');

    const lines = cleaned.split('\n').map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('erDiagram') || trimmed.startsWith('%%')) {
        return line;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        let leftSide = line.slice(0, colonIdx);
        const rightSide = line.slice(colonIdx);
        // Replace hyphens inside entity names: e.g. VENDOR-TYPE -> VENDOR_TYPE
        while (/([A-Za-z0-9_]+)-([A-Za-z0-9_]+)/.test(leftSide)) {
          leftSide = leftSide.replace(/([A-Za-z0-9_]+)-([A-Za-z0-9_]+)/g, '$1_$2');
        }
        return `${leftSide}${rightSide}`;
      }
      let fixedLine = line;
      while (/([A-Za-z0-9_]+)-([A-Za-z0-9_]+)/.test(fixedLine)) {
        fixedLine = fixedLine.replace(/([A-Za-z0-9_]+)-([A-Za-z0-9_]+)/g, '$1_$2');
      }
      return fixedLine;
    });

    return lines.join('\n');
  }

  // --- FLOWCHART / GRAPH SANITIZATION ---
  if (cleaned.startsWith('graph') || cleaned.startsWith('flowchart')) {
    // Remove trailing semicolons from class declarations: 'class A verified;' -> 'class A verified'
    cleaned = cleaned.replace(/^\s*class\s+([a-zA-Z0-9_,]+)\s+([a-zA-Z0-9_]+)\s*;?\s*$/gm, '    class $1 $2');

    // Quote unquoted node labels with slashes or ampersands: e.g. [I Want / e-SHOP] -> ["I Want / e-SHOP"]
    cleaned = cleaned.replace(/\[([a-zA-Z0-9_]+[ \t]+(?:\/|&)[ \t]+[a-zA-Z0-9_ \t\-\.]+)\]/g, '["$1"]');
    return cleaned;
  }

  return cleaned;
}

/**
 * Safely renders a Mermaid diagram without polluting document.body on error.
 */
export async function renderMermaidSafe(
  containerId: string,
  diagramText: string,
  fallbackText?: string
): Promise<string> {
  initMermaid();
  cleanMermaidDOMArtifacts();

  const sanitized = sanitizeMermaidSyntax(diagramText);

  try {
    const id = `mermaid-render-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { svg } = await mermaid.render(id, sanitized);
    cleanMermaidDOMArtifacts();
    return svg;
  } catch (err: any) {
    console.warn('Primary Mermaid render failed, attempting simplified retry:', err?.message || err);
    cleanMermaidDOMArtifacts();

    // If flowchart failed, attempt stripping styling classes
    if (sanitized.startsWith('graph') || sanitized.startsWith('flowchart')) {
      try {
        const stripped = sanitized
          .split('\n')
          .filter((l) => !l.trim().startsWith('classDef') && !l.trim().startsWith('class '))
          .join('\n');
        const id2 = `mermaid-retry-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(id2, stripped);
        cleanMermaidDOMArtifacts();
        return svg;
      } catch (retryErr) {
        cleanMermaidDOMArtifacts();
      }
    }

    // Attempt fallback if available
    if (fallbackText) {
      try {
        const id3 = `mermaid-fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(id3, sanitizeMermaidSyntax(fallbackText));
        cleanMermaidDOMArtifacts();
        return svg;
      } catch (fbErr) {
        cleanMermaidDOMArtifacts();
      }
    }

    cleanMermaidDOMArtifacts();
    throw err;
  }
}
