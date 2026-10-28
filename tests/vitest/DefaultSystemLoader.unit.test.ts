import { describe, expect, it } from "vitest";
import { DefaultSystemLoader } from "../../app/core/systems/DefaultSystemLoader";

describe("DefaultSystemLoader", () => {
  it("discovers the bundled task set by its own filename", async () => {
    const loader = new DefaultSystemLoader();
    const files = await loader.getSystemFiles("skolni_tabor_palava");
    expect(files.map((file) => file.name)).toEqual(
      expect.arrayContaining([
        "config.json",
        "create_schema.sql",
        "skolni_tabor_palava_zakladni_ukoly.json",
      ]),
    );
    const sets = await loader.loadTaskSets(["skolni_tabor_palava"]);
    expect(sets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "skolni_tabor_palava_zakladni_ukoly",
          systemId: "skolni_tabor_palava",
        }),
      ]),
    );
    expect(sets[0].tasks.length).toBeGreaterThan(0);
  });
});
