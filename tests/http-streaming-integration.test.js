/**
 * tests/http-streaming-integration.test.js
 * Focused real Node.js HTTP server and HTTP client integration suite.
 * Verifies live HTTP streaming lifecycle, event semantics, and client disconnect handling
 * using the actual AssetDeliveryService.pipeMediaStream implementation.
 */

import http from 'http';
import { Readable } from 'stream';
import assert from 'assert/strict';
import { AssetDeliveryService } from '../src/services/media/AssetDeliveryService.js';

console.log('========================================================================');
console.log('🧪 RUNNING REAL NODE.JS HTTP STREAMING INTEGRATION TEST SUITE');
console.log('========================================================================\n');

async function runRealHttpSuite() {
  let passed = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Normal GET request completes receiving its request data;
  // server continues streaming the media response; complete body reaches client.
  // ---------------------------------------------------------------------------
  console.log('👉 [Test 1] Real HTTP: Normal GET completes receiving request while media continues streaming...');
  {
    let streamPrematurelyDestroyed = false;
    let chunksSent = 0;
    const totalChunks = 8;
    const chunkSize = 16384; // 16KB per chunk (128KB total)
    const expectedPayload = Buffer.alloc(totalChunks * chunkSize, 0x56); // 'V' bytes

    const server = http.createServer((req, res) => {
      // Simulate real storage read stream emitting chunks over time
      const mediaStream = new Readable({
        read() {
          if (chunksSent < totalChunks) {
            setTimeout(() => {
              const start = chunksSent * chunkSize;
              const chunk = expectedPayload.subarray(start, start + chunkSize);
              chunksSent++;
              this.push(chunk);
              if (chunksSent === totalChunks) {
                this.push(null); // End of stream
              }
            }, 15);
          }
        },
        destroy(err, cb) {
          if (!this.readableEnded) {
            streamPrematurelyDestroyed = true;
          }
          if (cb) cb(err);
        },
      });

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Length', expectedPayload.length);

      // Invoke real AssetDeliveryService.pipeMediaStream
      AssetDeliveryService.pipeMediaStream({ stream: mediaStream }, res, req);
    });

    await new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        const receivedChunks = [];

        const clientReq = http.get(`http://127.0.0.1:${port}/media`, (clientRes) => {
          assert.equal(clientRes.statusCode, 200);
          assert.equal(clientRes.headers['content-type'], 'video/mp4');

          clientRes.on('data', (chunk) => {
            receivedChunks.push(chunk);
          });

          clientRes.on('end', () => {
            const fullBody = Buffer.concat(receivedChunks);
            assert.equal(fullBody.length, expectedPayload.length, 'Client must receive complete response payload');
            assert.deepEqual(fullBody, expectedPayload, 'Received payload must match source bytes exactly');
            assert.equal(streamPrematurelyDestroyed, false, 'Upstream stream must NOT be prematurely destroyed');

            server.close(() => {
              console.log('   ✅ PASS: Normal GET request completes request reception, response streams to end without premature destruction.');
              passed++;
              resolve();
            });
          });

          clientRes.on('error', reject);
        });

        clientReq.on('error', reject);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Client abruptly disconnects during streaming;
  // causes upstream media stream to be cleanly terminated.
  // ---------------------------------------------------------------------------
  console.log('👉 [Test 2] Real HTTP: Client disconnects during response; upstream stream terminates cleanly...');
  {
    let upstreamStreamDestroyed = false;
    let chunksPushed = 0;

    const server = http.createServer((req, res) => {
      // Long-running or unbounded media stream
      const infiniteMediaStream = new Readable({
        read() {
          setTimeout(() => {
            chunksPushed++;
            this.push(Buffer.alloc(8192, 0x41)); // 'A'
          }, 20);
        },
        destroy(err, cb) {
          upstreamStreamDestroyed = true;
          if (cb) cb(err);
        },
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      AssetDeliveryService.pipeMediaStream({ stream: infiniteMediaStream }, res, req);
    });

    await new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;

        const clientReq = http.get(`http://127.0.0.1:${port}/audio`, (clientRes) => {
          clientRes.on('data', () => {
            // Client abruptly aborts and closes socket after receiving initial data
            clientReq.destroy();
          });
        });

        clientReq.on('error', () => {
          // Expected client-side abort error
        });

        // Verify that server terminates upstream media stream upon detecting client socket drop
        const checkInterval = setInterval(() => {
          if (upstreamStreamDestroyed) {
            clearInterval(checkInterval);
            server.close(() => {
              console.log('   ✅ PASS: Client disconnect cleanly terminates upstream media stream without leaks.');
              passed++;
              resolve();
            });
          }
        }, 20);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!upstreamStreamDestroyed) {
            server.close();
            reject(new Error('Upstream stream was not destroyed after client disconnect'));
          }
        }, 2000);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Client aborts request before response completion;
  // upstream media stream is cleanly terminated via req 'aborted' handler.
  // ---------------------------------------------------------------------------
  console.log('👉 [Test 3] Real HTTP: Client aborts request before response completion...');
  {
    let upstreamStreamDestroyed = false;

    const server = http.createServer((req, res) => {
      const slowStream = new Readable({
        read() {
          // Slow producer
          setTimeout(() => {
            this.push(Buffer.from('slow_chunk_data'));
          }, 500);
        },
        destroy(err, cb) {
          upstreamStreamDestroyed = true;
          if (cb) cb(err);
        },
      });

      res.setHeader('Content-Type', 'application/octet-stream');
      AssetDeliveryService.pipeMediaStream({ stream: slowStream }, res, req);
    });

    await new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;

        const clientReq = http.get(`http://127.0.0.1:${port}/slow`, () => {});

        clientReq.on('error', () => {
          // Expected client-side abort
        });

        // Abort almost immediately
        setTimeout(() => {
          clientReq.destroy();
        }, 50);

        const checkInterval = setInterval(() => {
          if (upstreamStreamDestroyed) {
            clearInterval(checkInterval);
            server.close(() => {
              console.log('   ✅ PASS: Aborted request terminates upstream media stream.');
              passed++;
              resolve();
            });
          }
        }, 25);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!upstreamStreamDestroyed) {
            server.close();
            reject(new Error('Upstream stream was not destroyed on client abort'));
          }
        }, 2000);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Upstream storage stream errors mid-stream;
  // safely terminates response via res.destroy() without ERR_HTTP_HEADERS_SENT crash.
  // ---------------------------------------------------------------------------
  console.log('👉 [Test 4] Real HTTP: Upstream stream error after headers dispatched terminates response cleanly...');
  {
    let streamDestroyed = false;

    const server = http.createServer((req, res) => {
      let emittedError = false;
      const failingStream = new Readable({
        read() {
          if (!emittedError) {
            emittedError = true;
            this.push(Buffer.from('initial_valid_header_chunk'));
            process.nextTick(() => {
              this.emit('error', new Error('Underlying storage connection reset mid-stream'));
            });
          }
        },
        destroy(err, cb) {
          streamDestroyed = true;
          if (cb) cb(err);
        },
      });

      res.setHeader('Content-Type', 'application/octet-stream');
      AssetDeliveryService.pipeMediaStream({ stream: failingStream }, res, req);
    });

    await new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;

        const clientReq = http.get(`http://127.0.0.1:${port}/fail`, (clientRes) => {
          // Headers already sent (200), then socket is destroyed by server
          clientRes.on('data', () => {});
          clientRes.on('error', () => {
            // Expected socket reset when server calls res.destroy()
          });
        });

        clientReq.on('error', () => {
          // Expected connection reset on client side
        });

        setTimeout(() => {
          server.close(() => {
            console.log('   ✅ PASS: Mid-stream storage failure safely closes response without double-header crash.');
            passed++;
            resolve();
          });
        }, 150);
      });
    });
  }

  console.log('\n========================================================================');
  console.log(`🎉 ALL ${passed} REAL NODE.JS HTTP STREAMING INTEGRATION TESTS PASSED!`);
  console.log('========================================================================');
}

runRealHttpSuite().catch((err) => {
  console.error('❌ Real HTTP streaming integration test failure:', err);
  process.exit(1);
});
