const chai = require("chai");
const expect = chai.expect;

const utils = require("../utils");

const testWaterfall = cb => {
    const func = (err, data, callback) => {
        expect(err).to.equal(null);
        expect(data).to.equal(true);
        callback(null, data, callback);
    };

    utils.waterfall([func, func], cb, this, true);
};

const testSplitTitle = () => {
    const titles = [
        "titleOne",
        "title - two",
        "title three",
        ""
    ];

    let data = utils.splitTitle(titles[0]);

    expect(data).to.be.an("array");
    expect(data.length).to.equal(2);
    expect(data[0]).to.equal(data[1]);

    data = utils.splitTitle(titles[1]);

    expect(data).to.be.an("array");
    expect(data.length).to.equal(2);
    expect(data[0]).to.not.equal(data[1]);
    expect(data[0]).to.equal("title");
    expect(data[1]).to.equal("two");

    data = utils.splitTitle(titles[2]);

    expect(data).to.be.an("array");
    expect(data.length).to.equal(2);
    expect(data[0]).to.not.equal(data[1]);
    expect(data[0]).to.equal("title");
    expect(data[1]).to.equal("three");

    data = utils.splitTitle(titles[3]);

    expect(data).to.be.an("array");
    expect(data.length).to.equal(2);
    expect(data[0]).to.not.equal(data[1]);
    expect(data[0]).to.equal("");
    expect(data[1]).to.equal("");
};

const testConvertPlugTimeToDate = () => {
    const times = [
        "10-11-12",
        "10-11-12 20:21:22",
        "10-11-12 20:21:22.0123",
        "20:21:22.0123",
        "10-11-12 20",
        "invalid time string"
    ];

    let time = utils.convertPlugTimeToDate(times[0]);

    expect(time).to.be.a("string");
    expect(time).to.be.equal(times[0]);
    expect(time.split('-').length).to.equal(3);
    expect(time.length).to.equal(8);

    time = utils.convertPlugTimeToDate(times[1]);

    expect(time).to.be.a("string");
    expect(time).to.be.equal("10-11-12T20:21:22Z");
    expect(time.split('T').length).to.equal(2);
    expect(time.split('-').length).to.equal(3);
    expect(time.split(':').length).to.equal(3);
    expect(time.length).to.equal(18);

    time = utils.convertPlugTimeToDate(times[2]);

    expect(time).to.be.a("string");
    expect(time).to.be.equal("10-11-12T20:21:22.0123Z");
    expect(time.split('T').length).to.equal(2);
    expect(time.split('-').length).to.equal(3);
    expect(time.split(':').length).to.equal(3);
    expect(time.length).to.equal(23);

    time = utils.convertPlugTimeToDate(times[3]);

    expect(time).to.be.a("string");
    expect(time).to.be.equal("20:21:22.0123");
    expect(time.split(':').length).to.equal(3);
    expect(time.length).to.equal(13);

    time = utils.convertPlugTimeToDate(times[4]);

    expect(time).to.be.a("string");
    expect(time).to.be.equal("Invalid Date");

    time = utils.convertPlugTimeToDate(times[5]);

    expect(time).to.be.a("string");
    expect(time).to.be.equal("Invalid Date");
};

const testDecode = () => {
    const decoded = utils.decode("\\\" \' & < >").split(' ');

    expect(encoded[0]).to.equal("&#34;");
    expect(encoded[1]).to.equal("&#39;");
    expect(encoded[2]).to.equal("&amp;");
    expect(encoded[3]).to.equal("&lt;");
    expect(encoded[4]).to.equal("&gt;");
};

exports.testWaterfall = testWaterfall;
exports.testSplitTitle = testSplitTitle;
exports.testConvertPlugTimeToDate = testConvertPlugTimeToDate;
exports.testDecode = testDecode;
