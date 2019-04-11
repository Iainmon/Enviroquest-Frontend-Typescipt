import DocumentHandler from './DocumentHandler'
import Sample from './Sample';

export default class SampleHandler extends DocumentHandler {

    public id: number;

    protected sample: Sample;

    private eventListenersSet: boolean = false;

    constructor(id: number) {
        super();
        this.sample = new Sample();
        this.id = id;
    }

    public readDataFromDocument(): void {
        this.sample.sampleNumber = document.getElementById(`${this.id}-sample-number`)['value'];

        this.sample.location = document.getElementById(`${this.id}-sample-location`)['value'];

        this.sample.startTime = new Date(document.getElementById(`${this.id}-sample-start-time`)['value']);
        this.sample.endTime = new Date(document.getElementById(`${this.id}-sample-end-time`)['value']);
        this.sample.totalTime = parseInt(document.getElementById(`${this.id}-sample-total-time`)['value']);

        this.sample.startingCalibration = parseFloat(document.getElementById(`${this.id}-sample-start-calibration`)['value']);
        this.sample.endingCalibration = parseFloat(document.getElementById(`${this.id}-sample-end-calibration`)['value']);
        this.sample.averageCalibration = parseFloat(document.getElementById(`${this.id}-sample-average-calibration`)['value']);

        this.sample.totalVolume = parseFloat(document.getElementById(`${this.id}-sample-total-volume`)['value']);

        this.sample.setFibersAndFields(document.getElementById(`${this.id}-sample-fiber-yield`)['value']);
    }

    public exportData(): string {
        return this.sample.toString();
    }

    public setSample(sample: Sample): void {
        this.sample = sample;
    }

    public getSample(): Sample {
        return this.sample;
    }

    public createEventListeners(): void {

        // Prevents duplicate event listeners
        if (this.eventListenersSet) {
            return;
        }

        this.eventListenersSet = true;

        document.getElementById(`${this.id}-sample-start-time`).addEventListener('input', this.hasEnteredFirstDateHandler.bind(this));

        document.getElementById(`${this.id}-sample-start-time`).addEventListener('input', this.hasEnteredStartTimeOrEndTimeHandler.bind(this));
        document.getElementById(`${this.id}-sample-end-time`).addEventListener('input', this.hasEnteredStartTimeOrEndTimeHandler.bind(this));

        document.getElementById(`${this.id}-sample-start-calibration`).addEventListener('input', this.hasEnteredStartingOrEndingCalibrationHandler.bind(this));
        document.getElementById(`${this.id}-sample-end-calibration`).addEventListener('input', this.hasEnteredStartingOrEndingCalibrationHandler.bind(this));

    }

    public removeEventListeners(): void {

        // Prevents duplicate event listener removal?
        if (!this.eventListenersSet) {
            return;
        }

        this.eventListenersSet = false;

        document.getElementById(`${this.id}-sample-start-time`).addEventListener('input', this.hasEnteredFirstDateHandler.bind(this));

        document.getElementById(`${this.id}-sample-start-time`).addEventListener('input', this.hasEnteredStartTimeOrEndTimeHandler.bind(this));
        document.getElementById(`${this.id}-sample-end-time`).addEventListener('input', this.hasEnteredStartTimeOrEndTimeHandler.bind(this));

        document.getElementById(`${this.id}-sample-start-calibration`).addEventListener('input', this.hasEnteredStartingOrEndingCalibrationHandler.bind(this));
        document.getElementById(`${this.id}-sample-end-calibration`).addEventListener('input', this.hasEnteredStartingOrEndingCalibrationHandler.bind(this));
    }

    // To be called when the start time is entered
    public hasEnteredFirstDateHandler(): void {

        // Will set the second date to the first one if it is not already filled out.
        let startTimeObject: HTMLElement = document.getElementById(`${this.id}-sample-start-time`);
        let endTimeObject: HTMLElement = document.getElementById(`${this.id}-sample-end-time`);

        // Checks to see if second value exists... if not, assigns second date to first date
        if (endTimeObject['value'] === '' && startTimeObject['value'] !== '') {
            endTimeObject['value'] = startTimeObject['value'];
        }
    }

    public hasEnteredStartTimeOrEndTimeHandler(): void {
        
        // Will set the second date to the first one if it is not already filled out.
        let startTimeObject = <HTMLInputElement> document.getElementById(`${this.id}-sample-start-time`);
        let endTimeObject = <HTMLInputElement> document.getElementById(`${this.id}-sample-end-time`);
        let totalTimeObject = <HTMLInputElement> document.getElementById(`${this.id}-sample-total-time`);

        // Attempts to parse dates
        let parsedStartTime = Date.parse(startTimeObject['value']);
        let parsedEndTime = Date.parse(endTimeObject['value']);

        // Makes sure the dates are valid
        if (isNaN(parsedStartTime) === false && isNaN(parsedEndTime) === false) {

            // Attempts to parse dates
            let startTime: Date = new Date(parsedStartTime);
            let endTime: Date = new Date(parsedEndTime);

            this.sample.startTime = startTime;
            this.sample.endTime = endTime;

            let totalTime: number = this.sample.calculateTotalTime();

            totalTimeObject['value'] = totalTime.toString();

            // Removes the flags just in case
            SampleHandler.unflagInputFieldWithError(startTimeObject);
            SampleHandler.unflagInputFieldWithError(endTimeObject);

        } else {
            // Adds error class to the elements that are invalid
            if (isNaN(parsedStartTime)) {
                SampleHandler.flagInputFieldWithError(startTimeObject); // Adds the flag to the start time element
            } else {
                SampleHandler.unflagInputFieldWithError(startTimeObject); // Removes it just in case
            }
            if (isNaN(parsedEndTime)) {
                SampleHandler.flagInputFieldWithError(endTimeObject); // Adds the flag to the end time element
            } else {
                SampleHandler.unflagInputFieldWithError(endTimeObject); // Removes it just in case
            }
        }
    }

    public hasEnteredStartingOrEndingCalibrationHandler(): void {

        // Retrieves inputs and document references
        let startingCalibrationObject = <HTMLInputElement> document.getElementById(`${this.id}-sample-start-calibration`);
        let endingCalibrationObject = <HTMLInputElement> document.getElementById(`${this.id}-sample-end-calibration`);
        let averageCalibrationObject = <HTMLInputElement> document.getElementById(`${this.id}-sample-average-calibration`);

        // Attempts to parse the inputs
        let startingCalibration = parseFloat(startingCalibrationObject['value']);
        let endingCalibration = parseFloat(endingCalibrationObject['value']);

        // Checks if the inputs are invalid
        if (!(isNaN(startingCalibration) || isNaN(endingCalibration))) {

            // Assigns the sample the parsed inputs
            this.sample.startingCalibration = startingCalibration;
            this.sample.endingCalibration = endingCalibration;

            let average: number = this.sample.calculateAverageCalibration();
            averageCalibrationObject['value'] = average.toString(); // Updates the average calulation in the HTML form
            
            // Unflags the input fields just in case
            SampleHandler.unflagInputFieldWithError(startingCalibrationObject);
            SampleHandler.unflagInputFieldWithError(endingCalibrationObject);

        } else {
            // Flags the apropriate and invalid input fields
            if (isNaN(startingCalibration)) {
                SampleHandler.flagInputFieldWithError(startingCalibrationObject); // Adds the flag to the starting calibration element
            } else {
                SampleHandler.unflagInputFieldWithError(startingCalibrationObject); // Removes the flag just in case
            }
            if (isNaN(endingCalibration)) {
                SampleHandler.flagInputFieldWithError(endingCalibrationObject); // Adds the flag to the starting calibration element
            } else {
                SampleHandler.unflagInputFieldWithError(endingCalibrationObject); // Removes the flag just in case
            }
        }
    }

    public runCalculations(): void {
        this.sample.calculateTotalTime();
        this.sample.calculateAverageCalibration();
        this.sample.calculateTotalVolume();
    }
    public updateDocumentInputs(): void {

    }

    public static flagInputFieldWithError(element: HTMLInputElement) {
        element.classList.add('is-invalid');
    }
    public static unflagInputFieldWithError(element: HTMLInputElement) {
        element.classList.remove('is-invalid');
    }
}