import Ajv from "ajv";
import taskSetSchema from "~/model/schemas/task-set.schema.json";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(taskSetSchema);

export function validateTaskSetJson(data: unknown): string[] {
  if (validate(data)) return [];

  return (validate.errors ?? []).map((error) => {
    const path = error.instancePath || "tasks.json";
    const field =
      error.keyword === "required"
        ? `${path}/${String(error.params.missingProperty)}`
        : path;
    return `${field}: ${error.message ?? "invalid value"}`;
  });
}
