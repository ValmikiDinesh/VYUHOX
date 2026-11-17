/**
 * tests/stream-error-handling.test.js
 * Verification of resilient media stream error handling, client aborts, and post-header termination.
 */

import assert from 'assert';
import { Readable, Writable } from 'stream';
import { EventEmitter } from 'events';
import { AssetDeliveryService } from '../src/services/media/AssetDeliveryService.js';

console.log('========================================================================');
console.log('🧪 RUNNING MEDIA STREAM ERROR HANDLING TEST SUITE');
console.log('========================================================================\n');

class MockResponse extends Writable {
  constructor(options = {}) {
    super(options);
    this.headersSent = false;
    this.statusCode = 200;
    this.headers = {};
    this.dataChunks = [];
    this.destroyed = false;
  }

  setHeader(k, v) {
    this.headers[k] = v;
  }

  status(code) {
    if (this.headersSent) {
      throw new Error('ERR_HTTP_HEADERS_SENT: Cannot set status after headers sent');
    }
    this.statusCode = code;
    return this;
  }

  json(obj) {
    if (this.headersSent) {
      throw new Error('ERR_HTTP_HEADERS_SENT: Cannot send json after headers sent');
    }
    this.headersSent = true;
    this.body = obj;
    this.end();
    return this;
  }

  _write(chunk, encoding, callback) {
    this.headersSent = true;
    this.dataChunks.push(chunk);
    callback();
  }

  destroy(err) {
    this.destroyed = true;
    this.destroyError = err;
    super.destroy(err);
    this.emit('close');
  }
}

async function runTests() {
  let passed = 0;

  // Test 1: Stream error before headers are sent returns 500 JSON without throwing
  console.log('👉 [Test 1] Verifying stream error before headers sent returns HTTP 500 JSON...');
  {
    const errorStream = new Readable({
      read() {
        process.nextTick(() => {
          this.emit('error', new Error('Simulated upstream network disconnect'));
        });
      },
    });

    const res = new MockResponse();
    const req = new EventEmitter();

    await new Promise((resolve) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      AssetDeliveryService.pipeMediaStream({ stream: errorStream }, res, req);
    });

    assert.equal(res.statusCode, 500, 'Expected HTTP 500 on pre-header stream error');
    assert.equal(res.body?.success, false);
    assert.ok(res.body?.message?.includes('Failed to stream media asset'));
    console.log('   ✅ PASS: Stream error before headers sent cleanly handled with HTTP 500.');
    passed++;
  }

  // Test 2: Stream error AFTER headers are sent calls res.destroy() and avoids double-header crash
  console.log('👉 [Test 2] Verifying stream error after headers sent terminates response safely without ERR_HTTP_HEADERS_SENT...');
  {
    const res = new MockResponse();
    res.headersSent = true; // Simulate headers already dispatched (e.g. res.setHeader)
    const req = new EventEmitter();

    const midStreamError = new Readable({
      read() {
        process.nextTick(() => {
          this.emit('error', new Error('R2 TLS connection terminated midway'));
        });
      },
    });

    await new Promise((resolve) => {
      res.on('close', resolve);
      AssetDeliveryService.pipeMediaStream({ stream: midStreamError }, res, req);
    });

    assert.ok(res.headersSent, 'Expected headers to be marked sent');
    assert.ok(res.destroyed, 'Expected res.destroy() to be called on post-header error');
    assert.equal(res.statusCode, 200, 'Must NOT attempt to set status 500 after headers sent');
    console.log('   ✅ PASS: Mid-stream error safely terminates response without throwing ERR_HTTP_HEADERS_SENT.');
    passed++;
  }

  // Test 3: Premature client disconnect aborts readable stream
  console.log('👉 [Test 3] Verifying client disconnect destroys upstream readable stream...');
  {
    let streamDestroyed = false;
    const longStream = new Readable({
      read() {},
      destroy(err, cb) {
        streamDestroyed = true;
        if (cb) cb(err);
      },
    });

    const res = new MockResponse();
    const req = new EventEmitter();

    AssetDeliveryService.pipeMediaStream({ stream: longStream }, res, req);

    // Simulate client aborting connection
    req.emit('aborted');

    assert.ok(streamDestroyed, 'Expected upstream stream to be destroyed on client abort');
    console.log('   ✅ PASS: Upstream stream destroyed on client abort.');
    passed++;
  }

  // Test 4: Missing mediaRes returns 404
  console.log('👉 [Test 4] Verifying missing mediaRes returns HTTP 404...');
  {
    const res = new MockResponse();
    AssetDeliveryService.pipeMediaStream(null, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body?.success, false);
    console.log('   ✅ PASS: Missing media source returns clean HTTP 404.');
    passed++;
  }

  // Test 5: Response close event terminates stream if not finished
  console.log('👉 [Test 5] Verifying res close event destroys active stream...');
  {
    let streamDestroyed = false;
    const activeStream = new Readable({
      read() {},
      destroy(err, cb) {
        streamDestroyed = true;
        if (cb) cb(err);
      },
    });

    const res = new MockResponse();
    AssetDeliveryService.pipeMediaStream({ stream: activeStream }, res);

    // Simulate socket close before writableEnded
    res.emit('close');

    assert.ok(streamDestroyed, 'Expected active stream to be destroyed on socket close');
    console.log('   ✅ PASS: Active stream destroyed on socket close.');
    passed++;
  }

  // Test 6: Normal GET request completion (req emits 'close' while response streams) does NOT destroy stream
  console.log('👉 [Test 6] Verifying normal request close does NOT destroy outgoing media stream...');
  {
    let prematurelyDestroyed = false;
    const testChunks = ['chunk_alpha_', 'chunk_beta_', 'chunk_gamma_'];
    let chunkIndex = 0;

    const normalStream = new Readable({
      read() {
        if (chunkIndex < testChunks.length) {
          const chunk = testChunks[chunkIndex++];
          this.push(Buffer.from(chunk));
        } else {
          this.push(null); // End of stream
        }
      },
      destroy(err, cb) {
        if (!this.readableEnded) {
          prematurelyDestroyed = true;
        }
        if (cb) cb(err);
      },
    });

    const res = new MockResponse();
    const req = new EventEmitter();
    req.complete = true;
    req.aborted = false;

    // Pipe the stream through AssetDeliveryService
    AssetDeliveryService.pipeMediaStream({ stream: normalStream }, res, req);

    // Simulate event ordering: normal GET request finishes receiving its data and emits 'close'
    // while the response is actively streaming
    req.emit('close');

    // Immediately after req 'close', stream must still be active and not destroyed
    assert.equal(normalStream.destroyed, false, 'Stream must not be destroyed when req emits close');
    assert.equal(prematurelyDestroyed, false, 'Stream must not be prematurely destroyed');

    // Wait for the stream to fully flush and complete to res
    await new Promise((resolve) => {
      res.on('finish', resolve);
      res.on('close', resolve);
    });

    assert.equal(prematurelyDestroyed, false, 'Normal req close must NOT destroy the active media stream');
    assert.equal(res.dataChunks.map((c) => c.toString()).join(''), 'chunk_alpha_chunk_beta_chunk_gamma_');
    assert.ok(res.writableEnded, 'Response must complete successfully');
    console.log('   ✅ PASS: Normal request close preserves media stream and completes successfully.');
    passed++;
  }

  // Test 7: Genuinely aborted request (req emits 'aborted') terminates active stream
  console.log('👉 [Test 7] Verifying genuinely aborted request terminates active media stream...');
  {
    let streamDestroyed = false;
    const activeStream = new Readable({
      read() {},
      destroy(err, cb) {
        streamDestroyed = true;
        if (cb) cb(err);
      },
    });

    const res = new MockResponse();
    const req = new EventEmitter();
    req.aborted = true;

    AssetDeliveryService.pipeMediaStream({ stream: activeStream }, res, req);

    // Client aborts the request
    req.emit('aborted');

    assert.ok(streamDestroyed, 'Expected active stream to be destroyed on client abort');
    console.log('   ✅ PASS: Genuinely aborted request successfully terminates active stream.');
    passed++;
  }

  // Test 8: Prematurely closed response (res emits 'close' before writableEnded) terminates active stream
  console.log('👉 [Test 8] Verifying prematurely closed response terminates active stream...');
  {
    let streamDestroyed = false;
    const longStream = new Readable({
      read() {},
      destroy(err, cb) {
        streamDestroyed = true;
        if (cb) cb(err);
      },
    });

    const res = new MockResponse();
    AssetDeliveryService.pipeMediaStream({ stream: longStream }, res);

    // Socket closed prematurely while stream was still open
    res.emit('close');

    assert.ok(streamDestroyed, 'Expected active stream to be destroyed when response socket closes prematurely');
    console.log('   ✅ PASS: Prematurely closed response cleanly terminates upstream stream.');
    passed++;
  }

  // Test 9: Response error event destroys active stream
  console.log('👉 [Test 9] Verifying res error event destroys active stream...');
  {
    let streamDestroyed = false;
    const errStream = new Readable({
      read() {},
      destroy(err, cb) {
        streamDestroyed = true;
        if (cb) cb(err);
      },
    });

    const res = new MockResponse();
    AssetDeliveryService.pipeMediaStream({ stream: errStream }, res);

    // Simulate response socket error
    res.emit('error', new Error('ECONNRESET'));

    assert.ok(streamDestroyed, 'Expected active stream to be destroyed on res error');
    console.log('   ✅ PASS: Active stream destroyed on response error.');
    passed++;
  }

  // Test 10: Stream error does NOT expose filesystem paths or sensitive details
  console.log('👉 [Test 10] Verifying stream error does not expose filesystem paths or credentials...');
  {
    const errorStream = new Readable({
      read() {
        process.nextTick(() => {
          this.emit('error', new Error('ENOENT: no such file or directory, open C:\\VYUHOX\\storage\\uploads\\private\\secret.mp4'));
        });
      },
    });

    const res = new MockResponse();
    await new Promise((resolve) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      AssetDeliveryService.pipeMediaStream({ stream: errorStream }, res);
    });

    assert.equal(res.statusCode, 500);
    assert.equal(res.body?.success, false);
    assert.ok(!res.body?.message?.includes('C:\\'), 'Response must NOT contain filesystem paths');
    assert.ok(!res.body?.message?.includes('VYUHOX'), 'Response must NOT contain workspace directory names');
    assert.equal(res.body?.message, 'Failed to stream media asset.');
    console.log('   ✅ PASS: Internal filesystem paths and infrastructure details strictly redacted.');
    passed++;
  }

  console.log('\n========================================================================');
  console.log(`🎉 ALL ${passed} MEDIA STREAM ERROR HANDLING TESTS PASSED!`);
  console.log('========================================================================');
}

runTests().catch((err) => {
  console.error('❌ Stream error test failure:', err);
  process.exit(1);
});
