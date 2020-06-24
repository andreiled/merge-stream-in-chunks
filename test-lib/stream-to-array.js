module.exports = function (input) {
    return new Promise((resolve, reject) => {
        var objects = [];
        input
                .on('data', (object) => objects.push(object))
                .on('end', () => resolve(objects))
                .on('error', reject);
    });
};
