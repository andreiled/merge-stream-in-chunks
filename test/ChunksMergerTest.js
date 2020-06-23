// TODO: test with multiple blank lines in sources
const streamToString = require('../test-lib/stream-to-string.js');

const chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

const ChunksMerger = require('../lib/ChunksMerger.js');

describe('ChunksMerger', function () {
    describe('#transform()', function () {
        it('should print single header when there is only one source', function () {
            var merger = new ChunksMerger();

            merger.write({header: 'Header 1',
                data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'});
            merger.write({header: 'Header 1',
                data: 'Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. \
Nulla molestie porttitor ex eu accumsan. Aenean sagittis mi sed pulvinar facilisis.'});
            merger.end();

            return streamToString(merger).should.eventually.equal('Header 1\n\
Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. \
Nulla molestie porttitor ex eu accumsan. Aenean sagittis mi sed pulvinar facilisis.\n\
');
        });

        it('should print single header for each uninterrupted sequence of chunks from the same source', function () {
            var merger = new ChunksMerger();

            merger.write({header: 'Header 1',
                data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'});
            merger.write({header: 'Header 1',
                data: 'Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. \
Nulla molestie porttitor ex eu accumsan. Aenean sagittis mi sed pulvinar facilisis.'});
            merger.write({header: 'Header 2',
                data: 'Nam posuere est dictum urna ultricies ullamcorper.'});
            merger.write({header: 'Header 1',
                data: 'Nam aliquet suscipit eros sit amet dignissim.'});
            merger.end();

            return streamToString(merger).should.eventually.equal('Header 1\n\
Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. \
Nulla molestie porttitor ex eu accumsan. Aenean sagittis mi sed pulvinar facilisis.\n\
Header 2\n\
Nam posuere est dictum urna ultricies ullamcorper.\n\
Header 1\n\
Nam aliquet suscipit eros sit amet dignissim.\n\
');
        });
    });
});
