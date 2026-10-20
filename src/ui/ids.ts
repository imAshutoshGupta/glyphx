// Element ids linking the search input (a combobox) to the list it controls.
export const listboxId = (baseId: string) => `${baseId}-listbox`;
export const optionId = (baseId: string, index: number) =>
  `${baseId}-option-${index}`;
