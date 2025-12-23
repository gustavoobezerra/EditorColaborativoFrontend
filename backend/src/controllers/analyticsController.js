import Analytics from '../models/Analytics.js';
import Document from '../models/Document.js';

/**
 * Registra atividade do usuário
 */
export const trackActivity = async (req, res) => {
  try {
    const { documentId, wordsAdded, wordsDeleted, timeSpentMs } = req.body;
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({
      user: userId,
      document: documentId,
      date: today
    });

    if (!analytics) {
      analytics = new Analytics({
        user: userId,
        document: documentId,
        date: today,
        wordsAdded: 0,
        wordsDeleted: 0,
        sessionsCount: 1,
        totalTimeMs: 0
      });
    }

    analytics.wordsAdded += wordsAdded || 0;
    analytics.wordsDeleted += wordsDeleted || 0;
    analytics.totalTimeMs += timeSpentMs || 0;

    await analytics.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao rastrear atividade:', error);
    res.status(500).json({ message: 'Erro ao rastrear atividade' });
  }
};

/**
 * Obtém resumo de analytics do usuário
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'week' } = req.query;

    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await Analytics.find({
      user: userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calcular totais
    const totalWords = analytics.reduce((sum, a) => sum + a.wordsAdded, 0);
    const totalTime = analytics.reduce((sum, a) => sum + a.totalTimeMs, 0);
    const totalSessions = analytics.reduce((sum, a) => sum + a.sessionsCount, 0);

    // Calcular streak (dias consecutivos)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ordenar por data decrescente para calcular streak atual
    const sortedAnalytics = [...analytics].reverse();
    for (let i = 0; i < sortedAnalytics.length; i++) {
      const activityDate = new Date(sortedAnalytics[i].date);
      activityDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));

      if (diffDays === i) {
        currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Heatmap de atividade (palavras por dia)
    const heatmap = analytics.map(a => ({
      date: a.date,
      words: a.wordsAdded,
      time: a.totalTimeMs
    }));

    // Horários mais produtivos (simulado - precisaria tracking de hora)
    const productiveHours = calculateProductiveHours(analytics);

    res.json({
      summary: {
        totalWords,
        totalTime,
        totalSessions,
        averageWordsPerDay: Math.round(totalWords / days),
        averageTimePerDay: Math.round(totalTime / days)
      },
      streaks: {
        current: currentStreak,
        longest: longestStreak
      },
      heatmap,
      productiveHours
    });
  } catch (error) {
    console.error('Erro ao obter analytics:', error);
    res.status(500).json({ message: 'Erro ao obter analytics' });
  }
};

/**
 * Obtém documentos mais editados
 */
export const getMostEditedDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const analytics = await Analytics.aggregate([
      { $match: { user: userId, document: { $exists: true } } },
      {
        $group: {
          _id: '$document',
          totalWords: { $sum: '$wordsAdded' },
          totalTime: { $sum: '$totalTimeMs' },
          totalSessions: { $sum: '$sessionsCount' }
        }
      },
      { $sort: { totalWords: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate document details
    const documentIds = analytics.map(a => a._id);
    const documents = await Document.find({ _id: { $in: documentIds } })
      .select('title updatedAt');

    const results = analytics.map(a => {
      const doc = documents.find(d => d._id.equals(a._id));
      return {
        document: {
          _id: a._id,
          title: doc?.title || 'Documento deletado'
        },
        stats: {
          totalWords: a.totalWords,
          totalTime: a.totalTime,
          totalSessions: a.totalSessions
        }
      };
    });

    res.json({ documents: results });
  } catch (error) {
    console.error('Erro ao obter documentos mais editados:', error);
    res.status(500).json({ message: 'Erro ao obter documentos mais editados' });
  }
};

/**
 * Obtém score de legibilidade do documento
 */
export const getReadabilityScore = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    // Extrair texto puro do Quill Delta
    const plainText = extractPlainText(document.content);

    // Calcular métricas de legibilidade
    const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
    const sentenceCount = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const syllableCount = estimateSyllables(plainText);

    // Flesch Reading Ease (adaptado para português)
    const fleschScore = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

    // Classificação
    let readabilityLevel;
    if (fleschScore >= 90) readabilityLevel = 'Muito fácil';
    else if (fleschScore >= 80) readabilityLevel = 'Fácil';
    else if (fleschScore >= 70) readabilityLevel = 'Razoavelmente fácil';
    else if (fleschScore >= 60) readabilityLevel = 'Padrão';
    else if (fleschScore >= 50) readabilityLevel = 'Razoavelmente difícil';
    else if (fleschScore >= 30) readabilityLevel = 'Difícil';
    else readabilityLevel = 'Muito difícil';

    res.json({
      score: Math.max(0, Math.min(100, Math.round(fleschScore))),
      level: readabilityLevel,
      metrics: {
        words: wordCount,
        sentences: sentenceCount,
        averageWordsPerSentence: Math.round(wordCount / sentenceCount),
        syllables: syllableCount
      }
    });
  } catch (error) {
    console.error('Erro ao calcular legibilidade:', error);
    res.status(500).json({ message: 'Erro ao calcular legibilidade' });
  }
};

// Funções auxiliares
function calculateProductiveHours(analytics) {
  // Simulação - retorna horários fixos para demonstração
  // Em produção, precisaria rastrear timestamp exato das edições
  return [
    { hour: '09:00-10:00', words: 450 },
    { hour: '14:00-15:00', words: 380 },
    { hour: '20:00-21:00', words: 320 }
  ];
}

function extractPlainText(quillDelta) {
  if (!quillDelta || !quillDelta.ops) return '';

  return quillDelta.ops
    .map(op => (typeof op.insert === 'string' ? op.insert : ''))
    .join('');
}

function estimateSyllables(text) {
  // Estimativa simplificada de sílabas para português
  const words = text.toLowerCase().split(/\s+/);
  let syllables = 0;

  const vowels = 'aeiouáéíóúâêôãõ';

  words.forEach(word => {
    let wordSyllables = 0;
    let previousWasVowel = false;

    for (let char of word) {
      const isVowel = vowels.includes(char);
      if (isVowel && !previousWasVowel) {
        wordSyllables++;
      }
      previousWasVowel = isVowel;
    }

    syllables += Math.max(1, wordSyllables);
  });

  return syllables;
}
