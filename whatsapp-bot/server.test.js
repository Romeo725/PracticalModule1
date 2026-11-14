'use strict';

const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { after, before, test } = require('node:test');
const { createServer, getReply, isValidSignature } = require('./server');

const config = {
    accessToken: 'test-access-token',
    appSecret: 'test-app-secret',
    verifyToken: 'test-verify-token',
    phoneNumberId: '1234567890',
    apiVersion: 'v99.0',
    port: 0
};

let server;
let baseUrl;
const sentMessages = [];

before(async () => {
    server = createServer(config, async (_config, recipient, message) => {
        sentMessages.push({ recipient, message });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
});

test('FAQ responses cover portfolio topics and provide a helpful fallback', () => {
    assert.match(getReply('What are the skills?'), /Java, Spring Boot/);
    assert.match(getReply('Where did Romeo study?'), /Witwatersrand/);
    assert.match(getReply('Something unrelated'), /experience, education, skills, projects/);
});

test('webhook signature validation rejects missing and invalid signatures', () => {
    const body = Buffer.from('{"object":"whatsapp_business_account"}');
    const signature = `sha256=${createHmac('sha256', config.appSecret).update(body).digest('hex')}`;

    assert.equal(isValidSignature(body, signature, config.appSecret), true);
    assert.equal(isValidSignature(body, 'sha256=invalid', config.appSecret), false);
    assert.equal(isValidSignature(body, undefined, config.appSecret), false);
});

test('GET webhook verifies Meta callback tokens and returns its challenge', async () => {
    const response = await fetch(
        `${baseUrl}/webhook?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=12345`,
        { headers: { Connection: 'close' } }
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), '12345');
});

test('POST webhook verifies signatures and replies to an incoming text message', async () => {
    sentMessages.length = 0;
    const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        from: '27826616489',
                        type: 'text',
                        text: { body: 'Tell me about the projects' }
                    }]
                }
            }]
        }]
    });
    const signature = `sha256=${createHmac('sha256', config.appSecret).update(body).digest('hex')}`;
    const response = await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': signature,
            Connection: 'close'
        },
        body
    });

    assert.equal(response.status, 200);
    assert.equal(sentMessages.length, 1);
    assert.equal(sentMessages[0].recipient, '27826616489');
    assert.match(sentMessages[0].message, /banking REST service/i);
});

test('POST webhook rejects invalid signatures without sending a reply', async () => {
    sentMessages.length = 0;
    const response = await fetch(`${baseUrl}/webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': 'sha256=invalid',
            Connection: 'close'
        },
        body: '{"object":"whatsapp_business_account","entry":[]}'
    });

    assert.equal(response.status, 401);
    assert.equal(sentMessages.length, 0);
});
