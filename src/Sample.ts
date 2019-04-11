import PortableData from './PortableData';

export default class Sample extends PortableData {

    public blank: boolean = false;
    public overloadedOrDamaged: boolean = false;

    public sampleNumber: string;
    public location: string;

    public comment: string = '';

    public startingCalibration: number;
    public endingCalibration: number;
    public averageCalibration: number;

    public startTime = new Date();
    public endTime = new Date();
    public totalTime: number;

    public totalVolume: number;

    public fibers: number;
    public fields: number;

    constructor(input?: any) {
        super();
        if (input) {
            this.blank = input.blank;
            this.overloadedOrDamaged = input.overloadedOrDamaged;

            this.sampleNumber = input.sampleNumber;
            this.location = input.location;

            this.comment = input.comment;

            this.startingCalibration = input.startingCalibration;
            this.endingCalibration = input.endingCalibration;
            this.averageCalibration = input.averageCalibration;

            // If the dates are invalid, create a new instance for the date
            let startTimeTimestamp = Date.parse(input.startTime);
            console.log(input.startTime);
            console.log(startTimeTimestamp);
            if (isNaN(startTimeTimestamp) === false) {
                this.startTime = new Date(startTimeTimestamp);
            } else {
                console.log('starttime fallback');
                this.startTime = new Date();
                this.startTime.setMinutes(0);
            }
            let endTimeTimestamp = Date.parse(input.endTime);
            if (isNaN(endTimeTimestamp) === false) {
                this.endTime = new Date(endTimeTimestamp);
            } else {
                console.log('endtime fallback');
                this.endTime = new Date();
                this.endTime.setMinutes(0); // Sets the minutes to 0 of the hour
            }

            console.log(this.startTime);
            console.log(this.endTime);

            this.totalTime = input.totalTime;

            this.totalVolume = input.totalVolume;

            this.fibers = input.fibers;
            this.fields = input.fields;
        }
    }

    public calculateAverageCalibration(): number {
        this.averageCalibration = (this.startingCalibration + this.endingCalibration) / 2;
        return this.averageCalibration;
    }

    public calculateTotalTime(): number {
        this.totalTime = Math.abs(this.endTime.getTime() - this.startTime.getTime()) / 60000;
        return this.totalTime;
    }

    public calculateTotalVolume(): number {
        this.totalVolume = this.calculateTotalTime() * this.averageCalibration;
        return this.totalVolume;
    }

    public setFibersAndFields(fibersOverFields: string): void {

        if (fibersOverFields == '0') {
            this.overloadedOrDamaged = true;
            return;
        }

        this.fibers = parseInt(fibersOverFields.split('/')[0]);
        this.fields = parseInt(fibersOverFields.split('/')[1]);

    }

    public getFibersAndFields(): string {

        if (this.overloadedOrDamaged) {
            return '0';
        } else if (this.fibers == null || this.fields == null) {
            return '0/100';
        } else {
            return `${this.fibers.toString()}/${this.fields.toString()}`;
        }
    }

    public getFiberConcentration(): number | string {

        let reportingLimit = this.getReportingLimit();
        if (typeof(reportingLimit) == 'string') {
            return '';
        }

        return Math.round((reportingLimit + (1.645 * 0.45 * 0.1)) * 1000) / 1000;
    }

    public getReportingLimit(): number | string {
        return Math.round(((5.5 / 100) * 385) / (0.00785 * this.totalVolume)) / 1000;
    }

    public toString(): string {
        return JSON.stringify({

            blank: this.blank,
            overloadedOrDamaged: this.overloadedOrDamaged,

            sampleNumber: this.sampleNumber,

            location: this.location,
            comment: this.comment,

            startingCalibration: this.startingCalibration,
            endingCalibration: this.endingCalibration,
            averageCalibration: this.averageCalibration,

            startTime: this.startTime.toISOString(),
            endTime: this.endTime.toISOString(),
            totalTime: this.totalTime,

            fibers: this.fibers,
            fields: this.fields

        });
    }

    public toCodableObject(): any {
        return {
            blank: this.blank,
            overloadedOrDamaged: this.overloadedOrDamaged,

            sampleNumber: this.sampleNumber,

            location: this.location,
            comment: this.comment,

            startingCalibration: this.startingCalibration,
            endingCalibration: this.endingCalibration,
            averageCalibration: this.averageCalibration,

            startTime: this.startTime.toISOString(),
            endTime: this.endTime.toISOString(),
            totalTime: this.totalTime,

            fibers: this.fibers,
            fields: this.fields
        };
    }

    public static createNextSampleNumber(lastSampleNumber: string, sampleCount: number): string {
        if (sampleCount < 10) {
            return lastSampleNumber + '-0' + sampleCount;
        } else {
            return lastSampleNumber + '-' + sampleCount;
        }
    }
}
