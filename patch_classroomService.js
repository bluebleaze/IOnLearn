const fs = require('fs');
let content = fs.readFileSync('src/services/classroomService.ts', 'utf8');

// Replace all occurrences with safe wrappers
content = content.replace(/\(typeof window !== 'undefined' \? localStorage\.getItem : \(\) => null\)\(([^)]+)\)/g, "safeGetItem($1)");
content = content.replace(/\(typeof window !== 'undefined' \? localStorage\.setItem : \(\) => \{\}\)\(([^,]+),\s*([^)]+)\)/g, "safeSetItem($1, $2)");
content = content.replace(/\(typeof window !== 'undefined' \? localStorage\.removeItem : \(\) => \{\}\)\(([^)]+)\)/g, "safeRemoveItem($1)");

// Inject safe wrappers at the top
const wrappers = `
function safeGetItem(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
}
`;

content = content.replace("export interface UserProfile", wrappers + "\nexport interface UserProfile");

fs.writeFileSync('src/services/classroomService.ts', content);
