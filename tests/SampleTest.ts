import Sample from '../src/Sample'

let sample = new Sample();

sample.startingCalibration = 10;
sample.endingCalibration = 10;

console.log(sample.calculateAverageCalibration());