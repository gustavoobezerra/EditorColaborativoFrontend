import axios from 'axios';
import crypto from 'crypto';
import Webhook from '../models/Webhook.js';

/**
 * Serviço de Webhooks
 */

function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

export async function triggerWebhook(event, data, userId = null) {
  try {
    const query = userId ? { user: userId, active: true } : { active: true };
    query.events = event;

    const webhooks = await Webhook.find(query);

    for (const webhook of webhooks) {
      try {
        const payload = {
          event,
          data,
          timestamp: new Date().toISOString(),
          webhookId: webhook._id
        };

        const signature = generateSignature(payload, webhook.secret);

        await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event
          },
          timeout: 5000
        });

        webhook.lastTriggered = new Date();
        webhook.failureCount = 0;
        await webhook.save();

        console.log(`✅ Webhook triggered: ${event} → ${webhook.url}`);
      } catch (error) {
        webhook.failureCount += 1;

        // Desativa após 5 falhas
        if (webhook.failureCount >= 5) {
          webhook.active = false;
        }

        await webhook.save();
        console.error(`❌ Webhook failed: ${webhook.url}`, error.message);
      }
    }
  } catch (error) {
    console.error('Erro no serviço de webhooks:', error);
  }
}

export default { triggerWebhook };
