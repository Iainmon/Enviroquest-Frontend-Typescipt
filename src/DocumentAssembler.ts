import AsbestosReportDocument from './AsbestosReportDocument';
import Sample from './Sample';

const Models = {
    HeaderModel: require('./models/Header_Image_Data.js').replace(/(\r\n|\n|\r)/gm, ""),
    FooterModel: require('./models/Footer_Image_Data.js').replace(/(\r\n|\n|\r)/gm, "")
};

export default class DocumentAssembler {

    private doc = new AsbestosReportDocument();

    private documentHeaderInformation: any;

    private samples: Array<Sample> = new Array<Sample>();

    constructor(documentHeaderInformation: any, samples: Array<Sample>) {
        this.documentHeaderInformation = documentHeaderInformation;
        this.samples = samples;
    }

    public generateDocument(): void {

        this.doc.addImage(Models.HeaderModel, 'JPEG', 0, 0, 217, 101); //Adding Header.

        this.createDocumentHeader();

        // TODO test and turn these to LET
        var boxes = 0;
        let iterTimes = this.samples.length;
        let expectedPages = Math.round(((iterTimes - 6) / 9) + 1);
        for (var i = 0; i < iterTimes; i++) {
            if (i >= 6) {
                if ((i - 6) % 9 == 0 || i == 6) {
                    this.addFooter(expectedPages);
                    this.doc.addPage();
                    boxes = 0;
                }
            }
            this.createSampleBox(boxes, this.samples[i]);
            boxes++;
            if (i == iterTimes - 1) this.addFooter(expectedPages);
        }
    }

    private createDocumentHeader(): void {
        this.resetFont(10);
        this.doc.text(23, 44, this.documentHeaderInformation.clientName);
        this.doc.text(23, 48, this.documentHeaderInformation.clientAddress);

        this.resetFont(9);
        this.doc.text(17, 76, 'Airborne Fiber Concentration by Phase Contrast Microscopy');
        this.doc.text(17, 80, 'NIOSH 7400 (4th Edition 8/15/94)');
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(0, 80, 20, 4, 'F');
        this.doc.text(15, 87, this.documentHeaderInformation.analyst);

        this.doc.text(173, 38, this.documentHeaderInformation.reportNumber);
        this.doc.text(173, 43, this.documentHeaderInformation.projectId);

        let dateString = this.documentHeaderInformation.reportDate;

        this.doc.text(173, 48, dateString);
        this.doc.text(173, 53, dateString);

        this.resetFont(15);
        this.doc.text(17, 64, this.documentHeaderInformation.jobsite);
    }

    private addFooter(expectedPages: number): void {
        //https://github.com/MrRio/jsPDF/issues/411#issuecomment-241729950 <<<<--- fix
        this.doc.addImage(Models.FooterModel, 'JPG', 0, 286, 225, 8); //Adding Footer.
        this.resetFont(9, true);
        this.doc.text(10, 291, String(this.documentHeaderInformation.reportNumber));
        this.doc.text(182, 291, `Page ${this.doc.internal.getNumberOfPages()} of ${expectedPages + 1}`);
    }

    private createSampleBox(boxesOnPage: number, sample: Sample) {

        let sampleReportingLimit = sample.getReportingLimit();
        let sampleFiberConcentration = sample.getFiberConcentration();

        let startY = (this.doc.internal.getNumberOfPages() == 1) ? 100 : 10;
        let startX = 10;
        let boxSize = 30;
        let dataSpacingOffset = 10;
        let lineSpacingOffest = 5;
        let boldSampleData = true;

        let offset = (boxesOnPage == 0) ? startY : (boxesOnPage * boxSize) + startY;
        let textOffset = offset + 4;

        this.resetFont(11);
        //this.doc.text(startX, textOffset + 2, proc.pdfInfo.clientId); // Deprecated. not going to implement
        this.doc.text(startX, textOffset + 7, sample.sampleNumber);

        let splitTitle = this.doc.splitTextToSize(sample.location, 38);
        this.doc.text(startX, textOffset + 12, splitTitle);

        this.resetFont(11, boldSampleData);

        //this.doc.text(startX + 38, textOffset + dataSpacingOffset, String(sample.labId)); // Deprecated. not going to implement

        this.doc.text(startX + 62, textOffset + dataSpacingOffset, String(sample.fibers));

        this.doc.text(startX + 74, textOffset + dataSpacingOffset, String(sample.fields));

        if (!sample.blank && (String(sample.totalVolume) !== 'Infinity' && String(sampleReportingLimit) !== 'Infinity') && !isNaN(sample.totalVolume)) {

            this.doc.text(startX + 97, textOffset + dataSpacingOffset, String(sample.totalVolume));

            this.doc.text(startX + 128, textOffset + dataSpacingOffset, String(sampleReportingLimit));

            this.doc.text(startX + 163, textOffset + dataSpacingOffset, `${(sampleFiberConcentration > sampleReportingLimit) ? '<' : ''}  ${sampleFiberConcentration}`);

        } else {
            this.doc.text(startX + 97, textOffset + dataSpacingOffset, 'BLANK');
        }

        this.doc.setLineWidth(0.5);
        this.doc.line(startX - 5, offset + boxSize, 216 - startX, offset + boxSize);
    }

    public exportAndDownloadDocument(): void {
        this.doc.output('save', this.documentHeaderInformation.reportNumber + '.pdf');
    }

    public exportDocumentPreview(): void {
        try {
            window.open(this.doc.output('bloburl'), '_blank');
        } catch (exception) {
            window.alert('Woops! Your ad blocker is preventing the PDF preview from opening.');
        }
    }

    private resetFont(size: number, bold?: boolean): void {

        this.doc.setFont('helvetica');
        this.doc.setFontType('normal');

        if (bold) {
            this.doc.setFontType('bold');
        } else {
            this.doc.setFontType('normal');
        }

        this.doc.setFontSize(size);
    }

}

//Generator.HeaderModel = require('./PDFDOM-models/Header_Image_Data.js').replace(/(\r\n|\n|\r)/gm,"");
//Generator.FooterModel = require('./PDFDOM-models/Footer_Image_Data.js').replace(/(\r\n|\n|\r)/gm,"");
