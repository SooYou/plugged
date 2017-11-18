const chai = require("chai");
const expect = chai.expect;

function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}

const testDefaultValuesObject = (obj, filter) => {
    expect(obj).to.be.an("object");

    if (typeof obj === "object") {
        for (let [key, value] of entries(obj)) {

            if (Array.isArray(filter)) {
                if (!filter.includes(key))
                    continue;
            }

            switch (typeof value) {
                case "string":
                    expect(value).to.equal("");
                    break;

                case "number":
                    expect(value).to.equal(-1);
                    break;

                case "boolean":
                    expect(value).to.equal(false);
                    break;

                case "array":
                    expect(value).to.equal([]);
                    break;
            }
        }
    }
};

exports.testDefaultValuesObject = testDefaultValuesObject;
