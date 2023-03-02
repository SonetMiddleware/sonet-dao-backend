function newResp(code, err, data) {
    return {code: code, error: err, data: data};
}

function newNormalResp(data) {
    return newResp(0, '', data);
}

module.exports = {
    newResp, newNormalResp
}
