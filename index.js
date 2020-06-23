'use strict';

const {PassThrough} = require('stream');

const ChunkStream = require('./lib/ChunkStream.js');
const ChunksMerger = require('./lib/ChunksMerger.js');

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
