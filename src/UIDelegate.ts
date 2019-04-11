export default class UIDelegate {

    private links = Array<any>();

    constructor() {

    }

    public called(caller): void {

    }

    public createActionLink(link: any): void {
        this.links.push(link);
    }
}
