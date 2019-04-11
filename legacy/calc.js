// this is black box code
class calc {}

calc.processInputs = function (sample) {

    sample.fibers = sample.fiberYield.split('/')[0];
    sample.fields = sample.fiberYield.split('/')[1];

    sample.airVolume = sample.totalVolume;

    sample.fcc = calc.fcc.underSeven(sample.totalVolume); //(sample.fibers >= 7) ? 0.008 : calc.fcc.underSeven(sample.totalVolume);

    sample.reportingLimit = sample.fcc + (1.645 * 0.45 * 0.1);

    console.log(sample.fcc);

    sample.fcc = (Math.round(sample.fcc * 1000) / 1000);
    sample.reportingLimit = Math.round(((Math.round(sample.reportingLimit * 1000) / 1000) / 10) * 1000) / 1000; // iain what the fuck?!?

    return sample;
};

calc.fcc = {};

calc.fcc.underSeven = function (totalVolume) {
    return (
                    ((5.5/100) * 385) / (0.00785 * 1000 * totalVolume)  //formula //todo need to round this
                    //((5.5/100) * 385) / (0.00785 * 1000 * totalVolume)
        );
};

calc.constants = {
    MFA : 0.00785,
    EFA : 385,
};

module.exports = calc;