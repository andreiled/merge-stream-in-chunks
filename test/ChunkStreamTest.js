const chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

const streamToArray = require('../test-lib/stream-to-array.js');

const ChunkStream = require('../lib/ChunkStream.js');

describe('ChunkStream', function () {
    describe('without prefix', function () {
        it('should create chunks with uninterrupted lines sequences', function () {
            var chunker = new ChunkStream({header: 'Foo header'});

            chunker.write('Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.\n\
Aenean sagittis mi sed pulvinar facilisis. ');
            chunker.write('Nam aliquet suscipit eros sit amet dignissim.\n\
Etiam finibus mauris dui, ');
            chunker.write('et pretium massa mattis sit amet. ');
            chunker.write('Duis vehicula efficitur quam id luctus.\n\
Sed aliquam commodo fermentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;\n\
Phasellus a tincidunt metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis vestibulum augue.\n\
Pellentesque porta mollis diam, a euismod dolor placerat a. Aliquam fringilla nisl eu mi laoreet, in facilisis velit vehicula.\n\
Donec eu consectetur diam, at blandit lectus.');
            chunker.end();

            return streamToArray(chunker).should.eventually
                    .have.deep.ordered.members([
                        {header: 'Foo header', data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.'},
                        {header: 'Foo header', data: 'Aenean sagittis mi sed pulvinar facilisis. Nam aliquet suscipit eros sit amet dignissim.'},
                        {header: 'Foo header', data: 'Etiam finibus mauris dui, et pretium massa mattis sit amet. Duis vehicula efficitur quam id luctus.\n\
Sed aliquam commodo fermentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;\n\
Phasellus a tincidunt metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis vestibulum augue.\n\
Pellentesque porta mollis diam, a euismod dolor placerat a. Aliquam fringilla nisl eu mi laoreet, in facilisis velit vehicula.'},
                        {header: 'Foo header', data: 'Donec eu consectetur diam, at blandit lectus.'}
                    ]);
        });

        it('should discard last line break', function () {
            var chunker = new ChunkStream({header: 'Foo header'});

            chunker.write('Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.\n\
Aenean sagittis mi sed pulvinar facilisis. ');
            chunker.write('Nam aliquet suscipit eros sit amet dignissim.\n\
\n\
');
            chunker.end();

            return streamToArray(chunker).should.eventually
                    .have.deep.ordered.members([
                        {header: 'Foo header', data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.'},
                        {header: 'Foo header', data: 'Aenean sagittis mi sed pulvinar facilisis. Nam aliquet suscipit eros sit amet dignissim.\n'}
                    ]);
        });

        it('should preserve double line breaks', function () {
            var chunker = new ChunkStream({header: 'Foo header'});

            chunker.write('Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.\n\
\n');
            chunker.write('Aenean sagittis mi sed pulvinar facilisis. ');
            chunker.write('Nam aliquet suscipit eros sit amet dignissim.');
            chunker.end();

            return streamToArray(chunker).should.eventually
                    .have.deep.ordered.members([
                        {header: 'Foo header', data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.\n'},
                        {header: 'Foo header', data: 'Aenean sagittis mi sed pulvinar facilisis. Nam aliquet suscipit eros sit amet dignissim.'}
                    ]);
        });
    });

    describe('without prefix', function () {
        it('should create chunks with uninterrupted lines sequences', function () {
            var chunker = new ChunkStream({header: 'Foo header', prefix: '> '});

            chunker.write('Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.\n\
Aenean sagittis mi sed pulvinar facilisis. ');
            chunker.write('Nam aliquet suscipit eros sit amet dignissim.\n\
Etiam finibus mauris dui, ');
            chunker.write('et pretium massa mattis sit amet. ');
            chunker.write('Duis vehicula efficitur quam id luctus.\n\
Sed aliquam commodo fermentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;\n\
Phasellus a tincidunt metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis vestibulum augue.\n\
Pellentesque porta mollis diam, a euismod dolor placerat a. Aliquam fringilla nisl eu mi laoreet, in facilisis velit vehicula.\n\
Donec eu consectetur diam, at blandit lectus.');
            chunker.end();

            return streamToArray(chunker).should.eventually
                    .have.deep.ordered.members([
                        {header: 'Foo header', data: '> Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\
> Quisque elit erat, tristique hendrerit mauris eget, laoreet efficitur massa. Nulla molestie porttitor ex eu accumsan.'},
                        {header: 'Foo header', data: '> Aenean sagittis mi sed pulvinar facilisis. Nam aliquet suscipit eros sit amet dignissim.'},
                        {header: 'Foo header', data: '> Etiam finibus mauris dui, et pretium massa mattis sit amet. Duis vehicula efficitur quam id luctus.\n\
> Sed aliquam commodo fermentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;\n\
> Phasellus a tincidunt metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis vestibulum augue.\n\
> Pellentesque porta mollis diam, a euismod dolor placerat a. Aliquam fringilla nisl eu mi laoreet, in facilisis velit vehicula.'},
                        {header: 'Foo header', data: '> Donec eu consectetur diam, at blandit lectus.'}
                    ]);
        });
    });
});
