const {Transform} = require('stream');

class ChunkStream extends Transform {

    constructor(options = {}) {
        super({objectMode: true});
        this._header = options.header;
        this._prefix = options.prefix || '';
    }

    _transform(chunk, encoding, callback) {
        let data = String(chunk);
        if (this._lastLineData) {
            data = this._lastLineData + data;
        }

        let lines = data.split('\n');
        this._lastLineData = lines.pop();

        if (lines.length > 0) {
            // TODO: accumulate data in a local buffer as long as it keeps coming (and does not exceed a certain limit)
            // and forward it to the piped stream after a timeout to truly minimize mixing data from multiple streams
            this.push({
                header: this._header,
                data: lines.map((line) => this._prefix + line).join('\n')
            });
        }
        callback();
    }

    _flush(callback) {
        if (this._lastLineData) {
            this.push({
                header: this._header,
                data: this._prefix + this._lastLineData
            });
        }

        this._lastLineData = '';
        callback();
    }
}

module.exports = ChunkStream;
