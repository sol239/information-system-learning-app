export class ComponentErrorDefinition {
    public componentId: string;
    public overrides: Record<string, string>;

    constructor(componentId: string, overrides: Record<string, string>) {
        this.componentId = componentId;
        this.overrides = overrides;
    }

    public setOverride(variableName: string, value: string) {
        this.overrides[variableName] = value;
    }
}