export class HighlightHandler {
    public isHighlightOn: boolean = false;
    public selectedElementIds: string[] = [];
    public highlightedElements: WeakMap<HTMLElement, boolean> = new WeakMap();

    constructor() {
        this.isHighlightOn = false;
        this.selectedElementIds = [];
    }

    public selectElement(id: string, event: any): void {
        if (this.isHighlightOn) {
            console.log("HIGHLIGHT ON:", this.isHighlightOn)
            const element = event.currentTarget;
            if (!this.selectedElementIds.includes(id)) {
                this.selectedElementIds.push(id);
                this.highlightedElements.set(element, true);
            } else {
                this.selectedElementIds = this.selectedElementIds.filter(selectedId => selectedId !== id);
                this.highlightedElements.set(element, false);
            }
            console.log("Selected Ids:", this.selectedElementIds)
        }
    }

    public loadHighlightableElements(): void {
        this.highlightedElements = new WeakMap();
        const elements = Array.from(document.querySelectorAll('.highlightable'));
        elements.forEach(el => this.highlightedElements.set(el as HTMLElement, false));
    }

    public getHighlightedElements(): string[] {
        return this.selectedElementIds;
    }

    public clearSelection(): void {
        this.selectedElementIds = [];
    }
}