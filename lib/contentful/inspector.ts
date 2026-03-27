export function getInspectorAttributes(
  enabled: boolean,
  entryId?: string,
  fieldId?: string,
  locale = "en-US",
) {
  if (!enabled || !entryId || !fieldId) {
    return {};
  }

  return {
    "data-contentful-entry-id": entryId,
    "data-contentful-field-id": fieldId,
    "data-contentful-locale": locale,
  };
}
