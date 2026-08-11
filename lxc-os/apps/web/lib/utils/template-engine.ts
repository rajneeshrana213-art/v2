export function replacePlaceholders(template: string, data: Record<string, any>): string {
  if (!template) return "";
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    return data[key.trim()] ?? '';
  });
}
