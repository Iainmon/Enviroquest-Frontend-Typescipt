import SampleHandler from './SampleHandler'
import DocumentAssembler from './DocumentAssembler'
import Sample from './Sample';

const mainRenderTemplate = require('ejs-loader!./main.ejs'); // Laravel mix/webpack will compile this string

export default class ReportDelegate {

    private saveForm: HTMLFormElement;

    private reportHeaderInformation: any;

    private sampleHandlers: Array<SampleHandler> = new Array<SampleHandler>();

    constructor(documentFromServer: any) {

        this.saveForm = <HTMLFormElement> document.getElementById('save-report-form');

        this.reportHeaderInformation = documentFromServer.reportHeaderInformation;

        // Populates sample handlers from the servers format
        let samples = documentFromServer.samples;
        if (samples) {
            for (let id = 0; id < samples.length; id++) {

                let newSampleHandler = new SampleHandler(id);
                let parsedSample = new Sample(samples[id]);

                newSampleHandler.setSample(parsedSample);
                this.sampleHandlers.push(newSampleHandler);

            }
        }
    }

    public render(): void {

        //return alert('Report mode is currently under construction, and cannot be used.');

        if (this.sampleHandlers.length < 1) {
            let rootDocumentElement = document.getElementById('ejs');

            // Renders, and sets the root element's inner HTMl to the output
            rootDocumentElement.innerHTML = mainRenderTemplate(
                {
                    reportHeaderInformation: this.reportHeaderInformation,
                    samples: []
                }
            );
            return;
        }

        // Populates an array of samples and removes all event listeners
        let samples = Array<Sample>();
        for (let id = 0; id < this.sampleHandlers.length; id++) {
            samples.push(this.sampleHandlers[id].getSample());
            this.sampleHandlers[id].removeEventListeners();
        }

        let rootDocumentElement = document.getElementById('ejs');

        // Renders, and sets the root element's inner HTMl to the output
        rootDocumentElement.innerHTML = mainRenderTemplate(
            {
                reportHeaderInformation: this.reportHeaderInformation,
                samples: samples
            }
        );

        // Creates all the event listeners
        for (let id = 0; id < this.sampleHandlers.length; id++) {
            this.sampleHandlers[id].createEventListeners();
        }
    }

    public createNewSample(): void {
        this.loadInformationFromHTML(); // Saves all HTML inputs to JavaScript memory

        this.sampleHandlers.push(new SampleHandler(this.sampleHandlers.length)); // Creates a new sample and handler

        this.render(); // Re-renders all report data
    }

    // Loads the DOM forms to all the sample handlers
    public loadInformationFromHTML(): void {

        this.reportHeaderInformation.overridecalculations = document.getElementById('manual-calculations')['checked'];
        this.reportHeaderInformation.description = document.getElementById('report-description')['value'];
        this.reportHeaderInformation.reportDate = document.getElementById('report-date')['value'];
        this.reportHeaderInformation.analyst = document.getElementById('analyst-name')['value'];

        // Tells all the sample handlers to read data from the HTML inputs
        for (let id = 0; id < this.sampleHandlers.length; id++) {
            this.sampleHandlers[id].readDataFromDocument();
        }
    }

    // Dont use this! update samples individualy, and if possible, on input/keystroke event
    public deprecated_runAllSampleCalculations(): void {

        this.loadInformationFromHTML();

        //for (let i = 0; i < this.sampleHandlers.length; i++) {
        //    this.sampleHandlers[i].runCalculations();
        //}

        //this.render();
    }

    public saveReportToServer(): void {

        // Checks whether the user would like to enter the calculations manually
        if (this.reportHeaderInformation.overridecalculations === false) {
            this.deprecated_runAllSampleCalculations();
        }

        this.loadInformationFromHTML(); // Reads the information from the HTML inputs to be saved

        // Creates an encodable object to be populated with the information to be saved
        let codableInformation = {
            reportHeaderInformation: this.reportHeaderInformation,
            samples: []
        }

        // Populates the codable information with all of the samples as objects
        for (let id = 0; id < this.sampleHandlers.length; id++) {
            codableInformation.samples.push(this.sampleHandlers[id].getSample().toCodableObject());
        }

        let saveableInformation: string = JSON.stringify(codableInformation); // Encodes the object to a JSON string

        document.getElementById('save-report-content')['value'] = saveableInformation; // Populates the HTML with the JSON string
        this.saveForm.submit(); // Submits the form
    }

    public finalizeReport(): void {
        if (!confirm('Once you finalize a report, you cannot add/remove samples, but you still can edit them. Finalizing a report will cause all samples to be assigned lab IDs. This action cannot be reversed. Would you like to proceed?')) {
            return; // User said no
        }

        // Sets the parameter for the server that the user would like to finalize the report on submition
        let finalizeReportInput = <HTMLInputElement> document.getElementById('finalize-report');
        finalizeReportInput.checked = true;

        // Saves the report as normal, but with the 'finalize-report' parameter selected.
        this.saveReportToServer();
    }

    public exportReport(shouldOpenInNewTab = false): void {

        // Checks whether the user would like to enter the calculations manually
        if (this.reportHeaderInformation.overridecalculations === false) {
            this.deprecated_runAllSampleCalculations();
        }

        this.loadInformationFromHTML(); // Reads the information from the HTML inputs to be exported in the report

        // Grabs all samples from sample handlers, and populates an array with them
        let samples = Array<Sample>();
        for (let id = 0; id < this.sampleHandlers.length; id++) {
            samples.push(this.sampleHandlers[id].getSample());
        }

        // try {

            // Creates a DocumentAssembler object
            let documentAssembler = new DocumentAssembler(this.reportHeaderInformation, samples);
            documentAssembler.generateDocument(); // Generates the PDF document

            if (shouldOpenInNewTab) {
                documentAssembler.exportDocumentPreview(); // Opens a new tab with the PDF
            } else {
                documentAssembler.exportAndDownloadDocument(); // Downloads the PDF
            }

        // } catch (e) {
        //     alert('Something went wrong generating the PDF. Please make sure you have entered all of the header and sample information.');
        //     console.log(e);
        // }
    }
}
