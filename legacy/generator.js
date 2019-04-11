class Generator {}

Generator.fontReset = function (size, bold) {
    doc.setFont("helvetica");
    doc.setFontType("normal");
    if (bold) {
        doc.setFontType("bold");
    } else {
        doc.setFontType("normal");
    }
    doc.setFontSize(size);
};

Generator.start = function (input) {

    window.doc = new jsPDF();
    doc.addImage(Generator.HeaderModel, 'JPEG', 0, 0, 217, 101); //Adding Header.

    Generator.createHead();

    var boxes = 0;
    let iterTimes = input.samples.length;
    let expectedPages = Math.round(((iterTimes - 6) / 9) + 1);
    var data;
    for (var i = 0; i < iterTimes; i++) {
        data = input.samples[i];
        if (i >= 6) {
            if ((i - 6) % 9 == 0 || i == 6) {
                Generator.addFooter(expectedPages, proc.pdfInfo.reportNumber);
                doc.addPage();
                boxes = 0;
            }
        }
        Generator.createDataBox(boxes, data);
        boxes++;
        if (i == iterTimes - 1) Generator.addFooter(expectedPages, proc.pdfInfo.reportNumber);
    }
};


Generator.createHead = function () {
    Generator.fontReset(10);
    doc.text(23, 44, proc.pdfInfo.clientName);
    doc.text(23, 48, proc.pdfInfo.clientAddress);

    Generator.fontReset(9);
    doc.text(17, 76, 'Airborne Fiber Concentration by Phase Contrast Microscopy');
    doc.text(17, 80, 'NIOSH 7400 (4th Edition 8/15/94)');
    doc.setFillColor(255,255,255);
    doc.rect(0, 80, 20, 4, 'F');
    doc.text(15, 87, proc.pdfInfo.analyst);

    doc.text(173, 38, proc.pdfInfo.reportNumber);
    doc.text(173, 43, proc.pdfInfo.projectId);

    let dateString = proc.pdfInfo.reportDate;

    doc.text(173, 48, dateString);
    doc.text(173, 53, dateString);

    Generator.fontReset(15);
    doc.text(17, 64, proc.pdfInfo.jobsite);
};

Generator.createDataBox = function (boxesOnPage, input) {

    console.log(input);

    var startY;
    let startX = 10;
    var boxSize = 30;
    let dataSpacingOffset = 10;
    let lineSpacingOffest = 5;
    let boldData = true;

    startY = (doc.internal.getNumberOfPages() == 1)? 100 : 10;

    let offset = (boxesOnPage == 0) ? startY : (boxesOnPage * boxSize) + startY;
    let textOffset = offset + 4;

    Generator.fontReset(11);
    doc.text(startX, textOffset + 2, proc.pdfInfo.clientId);
    doc.text(startX, textOffset + 7, input.sampleId);

    var splitTitle = doc.splitTextToSize(input.location, 38);
    doc.text(startX, textOffset + 12, splitTitle);

    Generator.fontReset(11, boldData);

    doc.text(startX + 38, textOffset + dataSpacingOffset, String(input.labId));

    doc.text(startX + 62, textOffset + dataSpacingOffset, String(input.fibers));

    doc.text(startX + 74, textOffset + dataSpacingOffset, String(input.fields));

    if (!input.blank && (String(input.airVolume) !== 'Infinity' && String(input.fcc) !== 'Infinity')) {

        doc.text(startX + 97, textOffset + dataSpacingOffset, String(input.airVolume));

        doc.text(startX + 128, textOffset + dataSpacingOffset, String(input.fcc));

        doc.text(startX + 163, textOffset + dataSpacingOffset, `${(input.fcc < input.reportingLimit) ? '<' : ''}  ${input.reportingLimit}`);

    } else {
        doc.text(startX + 97, textOffset + dataSpacingOffset, 'BLANK');
    }

    doc.setLineWidth(0.5);
    doc.line(startX - 5, offset + boxSize, 216 - startX, offset + boxSize);
};

Generator.addFooter = function (totalPages, reportNumber) {
    //https://github.com/MrRio/jsPDF/issues/411#issuecomment-241729950 <<<<--- fix
    doc.addImage(Generator.FooterModel, 'JPG', 0, 286, 225, 8); //Adding Footer.
    Generator.fontReset(9, true);
    doc.text(10, 291, String(reportNumber));
    doc.text(182, 291, `Page ${doc.internal.getNumberOfPages()} of ${totalPages + 1}`);
};

Generator.save = function (newTab) {
    if (newTab) return window.open(doc.output('bloburl'), '_blank');
    doc.output('save', proc.pdfInfo.reportNumber+'.pdf');
};

Generator.HeaderModel = require('./PDFDOM-models/Header_Image_Data.js.js.js').replace(/(\r\n|\n|\r)/gm,"");
Generator.FooterModel = require('./PDFDOM-models/Footer_Image_Data.js.js.js').replace(/(\r\n|\n|\r)/gm,"");

module.exports = Generator;