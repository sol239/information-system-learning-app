/**
 * A class representing a UI component.
 */
export class Component {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public html: string,
        public css: string,
        public js: string) 
    {}
}