import Ajv from "ajv";
import fs from "fs";

// Načti JSON data (asynchronně)
const data = JSON.parse(fs.readFileSync("C:\\Users\\David\\Documents\\Projects\\rp-valek\\concept\\001\\assets\\data\\information_system_1\\config.json", "utf-8"));
const schema = JSON.parse(fs.readFileSync("C:\\Users\\David\\Documents\\Projects\\rp-valek\\concept\\001\\assets\\data\\information_system_1\\json-schema.json", "utf-8"));

const ajv = new Ajv();
const validate = ajv.compile(schema);

const valid = validate(data);
if (valid) {
  console.log("✅ JSON je validní podle schématu.");
} else {
  console.log("❌ Chyby validace:", validate.errors);
}
