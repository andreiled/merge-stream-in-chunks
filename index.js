'use strict';

const {Transform, PassThrough} = require('stream');

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

class ChunksMerger extends Transform {

    constructor() {
        super({objectMode: true});
    }

    _transform(chunk, encoding, callback) {
        if (chunk.header
                && (!this._currentHeader || this._currentHeader !== chunk.header)) {
            this.push(chunk.header + '\n' + chunk.data + '\n');
        }

        this._currentHeader = chunk.header;
        callback();
    }
}

// TODO: figure out how to implement only Readable part of the interface here
// since we don't want any outside code piping anything directly into this stream
class MergedStream extends PassThrough {

    constructor(options = {}) {
        super(options);

        this._prefix = options.prefix || '';
        this._sources = [];

        this._output = new ChunksMerger();
        this._output
                .on('error', this.emit.bind(this, 'error'))
                .pipe(this);
        this._output.setMaxListeners(1 + (options.maxSources || 8));
    }

    add(header, source) {
        let chunker = new ChunkStream({header: header, prefix: this._prefix});
        this._sources.push(chunker);

        source
                .on('error', chunker.emit.bind(chunker, 'error'))
                .pipe(chunker)
                .on('error', this._output.emit.bind(this._output, 'error'))
                // TODO: flush & close chunker before _remove call
                .once('unpipe', (other) => other === source && chunker.end())
                .once('end', this._remove.bind(this, chunker))
                .pipe(this._output, {end: false});

        return this;
    }

    isEmpty() {
        return this._sources.length === 0;
    }

    _remove(source) {
        this._sources = this._sources.filter((it) => it !== source);
        if (!this._sources.length && this._output.readable) {
            this._output.end();
        }
    }
}

module.exports = MergedStream;
