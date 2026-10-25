export type CodeEditPermissionKey =
  "html" | "css" | "js" | "sql" | "js_click" | "sql_click";

export type CodeEditPermissions = Record<CodeEditPermissionKey, boolean>;

export const CODE_EDIT_PERMISSION_KEYS: CodeEditPermissionKey[] = [
  "html",
  "css",
  "js",
  "sql",
  "js_click",
  "sql_click",
];

export const CODE_EDIT_PERMISSION_LABELS: Record<
  CodeEditPermissionKey,
  string
> = {
  html: "HTML",
  css: "CSS",
  js: "JS",
  sql: "SQL",
  js_click: "JS click",
  sql_click: "SQL click",
};

export function isPublicFlagEnabled(
  value: unknown,
  fallback: boolean,
): boolean {
  return (
    String(value ?? fallback)
      .trim()
      .toLowerCase() === "true"
  );
}

export function codeEditEnvironmentFromRuntimeConfig(
  publicConfig: Record<string, unknown>,
): CodeEditPermissions {
  return {
    html: isPublicFlagEnabled(publicConfig.htmlAvailable, true),
    css: isPublicFlagEnabled(publicConfig.cssAvailable, true),
    js: isPublicFlagEnabled(publicConfig.jsAvailable, true),
    sql: isPublicFlagEnabled(publicConfig.sqlAvailable, true),
    js_click: isPublicFlagEnabled(publicConfig.jsClickAvailable, false),
    sql_click: isPublicFlagEnabled(publicConfig.sqlClickAvailable, true),
  };
}

export function normalizeCodeEditPermissions(
  permissions: Partial<CodeEditPermissions> | null | undefined,
  defaults: CodeEditPermissions,
): CodeEditPermissions {
  return CODE_EDIT_PERMISSION_KEYS.reduce((result, key) => {
    result[key] =
      typeof permissions?.[key] === "boolean"
        ? Boolean(permissions[key])
        : defaults[key];
    return result;
  }, {} as CodeEditPermissions);
}

export function effectiveCodeEditPermissions(
  permissions: Partial<CodeEditPermissions> | null | undefined,
  environment: CodeEditPermissions,
): CodeEditPermissions {
  const normalized = normalizeCodeEditPermissions(permissions, environment);

  return CODE_EDIT_PERMISSION_KEYS.reduce((result, key) => {
    result[key] = environment[key] && normalized[key];
    return result;
  }, {} as CodeEditPermissions);
}
