// One palette for DOM tokens, procedural materials and directed signals.
export const THEME = Object.freeze({
  background: '#030907', panel: '#08130f', ink: '#e5f0eb', muted: '#a8b9b2',
  line: '#234538', emerald: '#29c58d', mint: '#75e5b7', cyan: '#75cdd1',
  metal: '#3b514d', dark: '#0c1918', connection: '#427e69',
});
export function applyTheme() {
  for (const [name, value] of Object.entries(THEME)) document.documentElement.style.setProperty(`--${name}`, value);
  document.documentElement.style.setProperty('--green', THEME.mint);
}
