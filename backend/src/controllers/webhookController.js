import Webhook from '../models/Webhook.js';

export const getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({ user: req.user._id });
    res.json({ webhooks });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar webhooks' });
  }
};

export const createWebhook = async (req, res) => {
  try {
    const { url, events } = req.body;

    const webhook = new Webhook({
      user: req.user._id,
      url,
      events
    });

    await webhook.save();
    res.status(201).json({ webhook });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar webhook' });
  }
};

export const updateWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook não encontrado' });
    }

    res.json({ webhook });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar webhook' });
  }
};

export const deleteWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook não encontrado' });
    }

    res.json({ message: 'Webhook deletado' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar webhook' });
  }
};
