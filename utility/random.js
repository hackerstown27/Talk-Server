const genRandomNumber = (from, to) => {
    return Math.floor(Math.random() * (to - from) + from);
}

const genRandomString = (length) => {
    const randomStrArr = [];
    for(let index = 0; index < length; index++){
        randomStrArr.push(String.fromCharCode(genRandomNumber(65, 90)))
    }
    return randomStrArr.join("");
}

module.exports.genRandomNumber = genRandomNumber;
module.exports.genRandomString = genRandomString;