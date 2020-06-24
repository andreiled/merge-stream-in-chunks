module.exports = function (input) {
    return new Promise((resolve, reject) => {
        var chunks = [];
        input
                .on('data', (chunk) => chunks.push(Buffer.from(chunk)))
                .on('end', () => resolve(Buffer.concat(chunks).toString()))
                .on('error', reject);
    });
};
