const {Transform} = require('stream');

class ChunksMerger extends Transform {

    constructor() {
        super({objectMode: true});
    }

    _transform(chunk, encoding, callback) {
        if (chunk.header
                && (!this._currentHeader || this._currentHeader !== chunk.header)) {
            this.push(chunk.header + '\n');
        }
        this.push(chunk.data + '\n');

        this._currentHeader = chunk.header;
        callback();
    }
}

module.exports = ChunksMerger;
