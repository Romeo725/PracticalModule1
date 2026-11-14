'use strict';

const http = require('node:http');
const { createHmac, timingSafeEqual } = require('node:crypto');

const MAX_BODY_BYTES = 1024 * 1024;

function getReply(message) {
    const text = typeof message === 'string' ? message.trim().toLowerCase() : '';

    if (/\b(hi|hello|hey|help|menu)\b/.test(text)) {
        return "Hi! I'm Romeo's portfolio assistant. Ask me about his experience, education, skills, projects, or how to contact him.";
    }
    if (/\b(education|degree|study|university|wits|certificate)\b/.test(text)) {
        return 'Romeo is completing a BSc in Computer Science at the University of the Witwatersrand (Wits), expected in 2028. His academic highlights include first-class certificates in Computational and Applied Mathematics, Basic Computer Organization I, and Linear Algebra I.';
    }
    if (/\b(experience|work|job|career)\b/.test(text)) {
        return 'Romeo works in IT Support and software development at Initium Venture Solutions. He also has experience in data analysis, mentoring, and student leadership.';
    }
    if (/\b(skills?|technology|tech stack|java|python|programming)\b/.test(text)) {
        return 'Romeo works with Java, Spring Boot, REST APIs, Python, C++, HTML, CSS, JavaScript, SQL, Excel, and data analysis.';
    }
    if (/\b(projects?|portfolio|built|banking)\b/.test(text)) {
        return "Featured work includes a Java banking REST service and a responsive portfolio website. You can explore more on Romeo's portfolio and GitHub profile.";
    }
    if (/\b(contact|email|hire|available|reach)\b/.test(text)) {
        return 'Romeo is available for work. You can email him at abrahamromeom@gmail.com or continue this WhatsApp conversation.';
    }

    return "I can answer questions about Romeo's experience, education, skills, projects, and contact details. Try asking about one of those topics.";
}

function constantTimeEqual(left, right) {
    if (typeof left !== 'string' || typeof right !== 'string') {
        return false;
    }

    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isValidSignature(rawBody, signature, appSecret) {
    if (typeof signature !== 'string' || !signature.startsWith('sha256=')) {
        return false;
    }

    const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
    return constantTimeEqual(signature, expected);
}

function loadConfig(env = process.env) {
    const required = [
        'WHATSAPP_ACCESS_TOKEN',
        'WHATSAPP_APP_SECRET',
        'WHATSAPP_VERIFY_TOKEN',
        'WHATSAPP_PHONE_NUMBER_ID',
        'WHATSAPP_API_VERSION'
    ];
    const missing = required.filter((name) => !env[name]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (!/^v\d+\.\d+$/.test(env.WHATSAPP_API_VERSION)) {
        throw new Error('WHATSAPP_API_VERSION must use the format vNN.N.');
    }
    if (!/^\d+$/.test(env.WHATSAPP_PHONE_NUMBER_ID)) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID must contain only digits.');
    }

    const port = Number(env.PORT || 10000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT must be a valid TCP port.');
    }

    return {
        accessToken: env.WHATSAPP_ACCESS_TOKEN,
        appSecret: env.WHATSAPP_APP_SECRET,
        verifyToken: env.WHATSAPP_VERIFY_TOKEN,
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
        apiVersion: env.WHATSAPP_API_VERSION,
        port
    };
}

async function sendWhatsAppMessage(config, recipient, message) {
    const response = await fetch(
        `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipient,
                type: 'text',
                text: { body: message }
            }),
            signal: AbortSignal.timeout(10000)
        }
    );

    if (!response.ok) {
        throw new Error(`WhatsApp API returned HTTP ${response.status}.`);
    }
}

async function readRequestBody(request) {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
            const error = new Error('Request body is too large.');
            error.statusCode = 413;
            throw error;
        }
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

function sendJson(response, statusCode, body) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify(body));
}

function createServer(config, sendMessage = sendWhatsAppMessage) {
    return http.createServer(async (request, response) => {
        const url = new URL(request.url, 'http://localhost');

        if (request.method === 'GET' && url.pathname === '/health') {
            sendJson(response, 200, { status: 'ok' });
            return;
        }

        if (request.method === 'GET' && url.pathname === '/webhook') {
            const mode = url.searchParams.get('hub.mode');
            const token = url.searchParams.get('hub.verify_token');
            const challenge = url.searchParams.get('hub.challenge');

            if (mode === 'subscribe' && constantTimeEqual(token, config.verifyToken) && challenge) {
                response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                response.end(challenge);
                return;
            }

            sendJson(response, 403, { error: 'Webhook verification failed.' });
            return;
        }

        if (request.method !== 'POST' || url.pathname !== '/webhook') {
            sendJson(response, 404, { error: 'Not found.' });
            return;
        }

        try {
            const rawBody = await readRequestBody(request);
            const signature = request.headers['x-hub-signature-256'];
            if (!isValidSignature(rawBody, signature, config.appSecret)) {
                sendJson(response, 401, { error: 'Invalid webhook signature.' });
                return;
            }

            let payload;
            try {
                payload = JSON.parse(rawBody.toString('utf8'));
            } catch {
                sendJson(response, 400, { error: 'Invalid JSON payload.' });
                return;
            }

            if (payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
                sendJson(response, 200, { status: 'ignored' });
                return;
            }

            const messages = payload.entry
                .flatMap((entry) => Array.isArray(entry.changes) ? entry.changes : [])
                .flatMap((change) => Array.isArray(change.value?.messages) ? change.value.messages : []);

            for (const message of messages) {
                if (typeof message.from !== 'string' || !/^\d{6,20}$/.test(message.from)) {
                    continue;
                }
                const question = message.type === 'text' ? message.text?.body : '';
                await sendMessage(config, message.from, getReply(question));
            }

            sendJson(response, 200, { status: 'ok' });
        } catch (error) {
            console.error('WhatsApp webhook processing failed:', error.message);
            if (!response.headersSent) {
                sendJson(response, error.statusCode || 500, { error: 'Webhook processing failed.' });
            }
        }
    });
}

if (require.main === module) {
    try {
        const config = loadConfig();
        const server = createServer(config);
        server.listen(config.port, '0.0.0.0', () => {
            console.log(`WhatsApp chatbot listening on port ${config.port}.`);
        });
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = { createServer, getReply, isValidSignature, loadConfig };
