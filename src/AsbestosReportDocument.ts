import * as jsPDF from 'jspdf';

export default class AsbestosReportDocument extends jsPDF {

    constructor() {
        super();
    }

    public resetFont(size: number, bold?: boolean): void {

        this.setFont('helvetica');
        this.setFontType('normal');

        if (bold) {
            this.setFontType('bold');
        } else {
            this.setFontType('normal');
        }

        this.setFontSize(size);
    }
}
