export default class LinkedElement {

    protected documentUniqueId: string;
    protected documentReference: HTMLElement;

    constructor(documentUniqueId: string) {
        this.documentUniqueId = documentUniqueId;
    }

    public link(): void {

        let documentReference = document.getElementById(this.documentUniqueId);

        if (documentReference !== null) {
            this.documentReference = documentReference;
        }
    }

}
