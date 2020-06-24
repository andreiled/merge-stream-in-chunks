# merge-stream-in-chunks
![build & test](https://github.com/andreiled/merge-stream-in-chunks/workflows/build%20&%20test/badge.svg)

Merge several input streams into one while also minimizing mixing data between the streams producing output in parallel.

## Description

Key features comparing to other similar modules like [merge-stream](https://www.npmjs.com/package/merge-stream):
* *Planned* - Hold off pushing data from an input stream to the merged stream until a chunk of sufficient size is accumulated
or a sufficient time has passed in order to minimize mixing lines from multiple inputs together.
* Print a header identifying the input stream (as provided when adding each separate input stream to the merged stream)
before each uninterrupted series of chunks of data from a given input stream.
* Prepend specified prefix before each line of data from each of the input streams.
