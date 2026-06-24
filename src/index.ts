import 'dotenv/config';
import { Markup, Telegraf } from 'telegraf';

type Suit = 'S' | 'C' | 'D' | 'H';
type Rank = '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
type Phase = 'lobby' | 'playing' | 'finished';

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN қажет');

const bot = new Telegraf(token);

const suits: Suit[] = ['S', 'C', 'D', 'H'];
const ranks: Rank[] = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suitText: Record<Suit, string> = { S: '♠', C: '♣', D: '♦', H: '♥' };
const suitFromText: Record<string, Suit> = { '♠': 'S', '♣': 'C', '♦': 'D', '♥': 'H' };
const rankNames: Record<Rank, string> = {
  '6': 'Алтылық',
  '7': 'Жетілік',
  '8': 'Сегіздік',
  '9': 'Тоғыздық',
  '10': 'Ондық',
  J: 'Валет',
  Q: 'Дама',
  K: 'Король',
  A: 'Тұз'
};

// Қара Қатын үшін ♠Q жалғыз дама болып қалады, сондықтан ол жұпқа түспейді.
const cardStickers: Record<string, string> = {
  '♠6': 'CAACAgUAAxkBAAERbpZqOSRiHrIr_CNKuXSi7-rAGt-X8wACwgEAAhMZyFUVAQk2w9IUozwE',
  '♠7': 'CAACAgUAAxkDAAIEOWfZCtljnc0MneX4xhYL4-0bVT9wAAJfAQACVyrBVZgoDoBoN4s0NgQ',
  '♠8': 'CAACAgUAAxkDAAIEJ2fZCIOcAYEphhdKZD1CSFYwqbnaAALmAQACkYDAVVhfNhGDmXaFNgQ',
  '♠9': 'CAACAgUAAxkDAAIEO2fZCtozPWxrftTAJ9x4Y_I4sZYqAAJMAQACVNvBVQ6J5yTZpE90NgQ',
  '♠10': 'CAACAgUAAxkDAAIEPGfZCtpFa0XrQEn70i9Jh4ci2guzAAJ-AQACMRxxVqvHRoEJTsHcNgQ',
  '♠J': 'CAACAgUAAxkDAAIERmfZCvCCv2I-y_P7peIsmOtbeLdDAAKBAQACDXPAVWos8ldKhjasNgQ',
  '♠Q': 'CAACAgUAAxkDAAIER2fZCvHAF8g0TlyFPeipR6kofyC9AAKpAgACiZPAVVigAmH3ZQUuNgQ',
  '♠K': 'CAACAgUAAxkDAAIEEGfZBo-xn9j7o-ekIX1Duma-Ibj5AAKlAQACa2nAVeCjtI0sCyCoNgQ',
  '♠A': 'CAACAgUAAxkDAAIESWfZCvG3xEaFHj_7bb82MxtSdKgnAAJ7AQACgJnAVeD42v7uFlqgNgQ',
  '♣6': 'CAACAgUAAxkBAAERbphqOSRoLoLghhpk8TArQfVz_XUa7AACLAEAAvSuwVXTZanNGx7wAjwE',
  '♣7': 'CAACAgUAAxkDAAIEKGfZCIMB9sGkXrYBjquHLhTxM9YaAALpAAOanMBV-p6MpO8DT3E2BA',
  '♣8': 'CAACAgUAAxkDAAIETGfZCvJjzgHB2akLC0UUyk9ZigIJAAJlAQACayfAVfMNtS82uVIgNgQ',
  '♣9': 'CAACAgUAAxkDAAIETWfZCvLzGrFrozQu2oWWCH4JZRfXAAIfAQACg9PBVfRdtJ1hlPBrNgQ',
  '♣10': 'CAACAgUAAxkDAAIETmfZCvJopSrAat6OSnRF7rrMk9RUAAJYAQACkIzAVWqaKiO5FRmdNgQ',
  '♣J': 'CAACAgUAAxkDAAIEKWfZCIRISyc3nO0XzVuNgyfYXD4FAAJKAQACtVLBVacmKs428ayMNgQ',
  '♣K': 'CAACAgUAAxkDAAIEUWfZCvOZa5hQfYy3MqaYOq8Gow-pAAJqAQACtXXAVSxTAh2tsevONgQ',
  '♣A': 'CAACAgUAAxkDAAIEUmfZCvPg3hEudQjuvFwpCaoEjH-sAAJWAQACTsrAVR2w87xsPLfNNgQ',
  '♥6': 'CAACAgUAAxkBAAERbpRqOSRaYQO35Iop-2b4bckoTu9zBgACuQEAAi7fwVUndFyOv1LeuTwE',
  '♥7': 'CAACAgUAAxkDAAIEFGfZBo-Zwnq1M2du_6GKRzdEKaG2AAJkAQAC1X3BVVzY34i5GXHQNgQ',
  '♥8': 'CAACAgUAAxkDAAIEFWfZBo9iiRS8OqteSopTOMzGz7mOAAJYAQACT7rBVQLR8GSac1m8NgQ',
  '♥9': 'CAACAgUAAxkDAAIELGfZCIQ3WcS369M1sdeMbXCwWWh2AAKkAQACgPLBVdxX6QUuXgajNgQ',
  '♥10': 'CAACAgUAAxkDAAIEF2fZBo8WD73xI96vqrInR1f0rKgIAAIRAQACQVvAVW6I30V-k1lZNgQ',
  '♥J': 'CAACAgUAAxkDAAIELmfZCIS9A-LmwSZFoooxBosa-MRtAAJPAQAC5nrBVV4dVDLw60NkNgQ',
  '♥K': 'CAACAgUAAxkDAAIEFmfZBo9aet9zu_gTtSqAEYNlyQABNgACGQEAAhRTwVWjUBF47pA6ETYE',
  '♥A': 'CAACAgUAAxkDAAIEZGfZCveUCGfxMF26aZLPWkZV1JJHAAKKAQAC9IjAVUr-jhrgPNBoNgQ',
  '♦6': 'CAACAgUAAxkBAAERbppqOSRtbkj0UH3MlBQKMu_6mlnQ9QACFwEAAvt_wVWgx6nKpXzQYjwE',
  '♦7': 'CAACAgUAAxkDAAIEEWfZBo8oKUKp-5Y2jiZFbw1YDc1QAAKNAQACslbAVbRxwx7tNKAqNgQ',
  '♦8': 'CAACAgUAAxkDAAIEVWfZCvN0gwJAax8mYIgHgvdvGfWRAAJdAQACa0TAVaOlxOpPw2PhNgQ',
  '♦9': 'CAACAgUAAxkDAAIEEmfZBo8xq3zSfrsL1EVobe1oZEEsAAI1AQAC5CTBVVWD4WjnG1dCNgQ',
  '♦10': 'CAACAgUAAxkDAAIEKmfZCISH02EU3UvZfj5OdCWx6a99AAJSAQACGVvAVXyb4ntYTbUqNgQ',
  '♦J': 'CAACAgUAAxkDAAIEWGfZCvQ33_UAAY8sMzaQ8kVyb-aTwwACTQEAAnHCyVW3tBaN5V6XEDYE',
  '♦K': 'CAACAgUAAxkDAAIEWmfZCvWrrApNbx_UHIORg5KJbB3oAAJ-AQACuf7BVYGHtHzfhYbPNgQ',
  '♦A': 'CAACAgUAAxkDAAIEW2fZCvUwObpoPRbYEx9yTL5ebj0kAAJMAQACuWvBVQKMX0_5YOpsNgQ'
};

class Card {
  constructor(
    public readonly suit: Suit,
    public readonly rank: Rank
  ) {}

  get id(): string {
    return `${this.suit}${this.rank}`;
  }

  get text(): string {
    return `${suitText[this.suit]}${this.rank}`;
  }

  get stickerId(): string {
    return cardStickers[this.text];
  }

  get isQaraQatyn(): boolean {
    return this.suit === 'S' && this.rank === 'Q';
  }
}

class Deck {
  constructor(private cards: Card[]) {}

  static create(): Deck {
    return new Deck(Object.keys(cardStickers).map(parseCardText));
  }

  shuffle(): this {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  deal(players: Player[]): void {
    let index = 0;
    while (this.cards.length) {
      players[index % players.length].hand.push(this.cards.shift() as Card);
      index += 1;
    }
  }
}

class Player {
  public hand: Card[] = [];
  public active = true;
  public finishPlace: number | null = null;

  constructor(
    public readonly id: number,
    public name: string
  ) {}

  get cardsCount(): number {
    return this.hand.length;
  }

  get handText(): string {
    return this.hand.length ? this.hand.map((card) => card.text).join(' ') : 'бос';
  }

  removeCardAt(index: number): Card {
    const [card] = this.hand.splice(index, 1);
    if (!card) throw new Error('Карта табылмады');
    return card;
  }

  sortHand(): void {
    this.hand.sort((a, b) => {
      if (a.suit !== b.suit) return suits.indexOf(a.suit) - suits.indexOf(b.suit);
      return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
    });
  }
}

type PairResult = {
  rank: Rank;
  cards: [Card, Card];
};

type PlayerPairResult = {
  player: Player;
  pair: PairResult;
};

type DrawResult = {
  currentPlayer: Player;
  targetPlayer: Player;
  drawnCard: Card;
  pairs: PairResult[];
  finishedPlayers: Player[];
  gameEnded: boolean;
};

class Game {
  public phase: Phase = 'lobby';
  public players: Player[] = [];
  public currentPlayerId: number | null = null;
  public pendingTargetId: number | null = null;
  private finishedOrder: number[] = [];

  constructor(
    public readonly chatId: number,
    public readonly hostId: number,
    public readonly hostName: string
  ) {}

  get activePlayers(): Player[] {
    return this.players.filter((player) => player.active);
  }

  get currentPlayer(): Player | undefined {
    return this.currentPlayerId ? this.findPlayer(this.currentPlayerId) : undefined;
  }

  get loser(): Player | undefined {
    return this.phase === 'finished' ? this.activePlayers[0] : undefined;
  }

  addPlayer(id: number, name: string): Player {
    if (this.phase !== 'lobby') throw new Error('Ойын басталып кетті');
    const existing = this.findPlayer(id);
    if (existing) return existing;
    if (this.players.length >= 8) throw new Error('Ең көп 8 ойыншы');

    const player = new Player(id, name);
    this.players.push(player);
    return player;
  }

  removePlayer(id: number): boolean {
    if (this.phase !== 'lobby') throw new Error('Тек ойын басталғанға дейін шығуға болады');
    const before = this.players.length;
    this.players = this.players.filter((player) => player.id !== id);
    return this.players.length !== before;
  }

  findPlayer(id: number): Player | undefined {
    return this.players.find((player) => player.id === id);
  }

  start(): PlayerPairResult[] {
    if (this.phase !== 'lobby') throw new Error('Ойын басталып кетті');
    if (this.players.length < 2) throw new Error('Кемінде 2 ойыншы керек');
    if (this.players.length > 8) throw new Error('Ең көп 8 ойыншы');

    this.phase = 'playing';
    Deck.create().shuffle().deal(this.players);

    const removedPairs: PlayerPairResult[] = [];
    for (const player of this.players) {
      player.sortHand();
      removedPairs.push(...this.discardPairs(player).map((pair) => ({ player, pair })));
    }

    this.markNewFinishedPlayers();
    this.currentPlayerId = this.nextActivePlayerId(null);
    this.pendingTargetId = null;
    if (this.activePlayers.length <= 1) this.phase = 'finished';
    return removedPairs;
  }

  chooseTarget(actorId: number, targetId: number): Player {
    this.assertTurn(actorId);
    const target = this.findPlayer(targetId);
    if (!target || !target.active || target.id === actorId || target.cardsCount === 0) {
      throw new Error('Басқа актив ойыншыны таңдаңыз');
    }

    this.pendingTargetId = target.id;
    return target;
  }

  drawFromTarget(actorId: number, targetId: number, cardIndex: number): DrawResult {
    const currentPlayer = this.assertTurn(actorId);
    if (this.pendingTargetId !== targetId) throw new Error('Алдымен ойыншы таңдаңыз');

    const targetPlayer = this.findPlayer(targetId);
    if (!targetPlayer || !targetPlayer.active) throw new Error('Бұл ойыншы актив емес');
    if (cardIndex < 0 || cardIndex >= targetPlayer.cardsCount) throw new Error('Бұл позиция жоқ');

    const drawnCard = targetPlayer.removeCardAt(cardIndex);
    currentPlayer.hand.push(drawnCard);
    currentPlayer.sortHand();

    const pairs = this.discardPairs(currentPlayer);
    const finishedPlayers = this.markNewFinishedPlayers();
    this.pendingTargetId = null;

    if (this.activePlayers.length <= 1) {
      this.phase = 'finished';
      return { currentPlayer, targetPlayer, drawnCard, pairs, finishedPlayers, gameEnded: true };
    }

    this.currentPlayerId = this.nextActivePlayerId(currentPlayer.id);
    return { currentPlayer, targetPlayer, drawnCard, pairs, finishedPlayers, gameEnded: false };
  }

  publicState(): string {
    const lines = this.players.map((player) => {
      if (player.active) return `${player.name} — ${player.cardsCount} карта`;
      return `${player.name} — аяқтады #${player.finishPlace}`;
    });
    const turn = this.currentPlayer ? `\n\nКезек: ${this.currentPlayer.name}` : '';
    return `Қара Қатын\n\n${lines.join('\n')}${turn}`;
  }

  finalText(): string {
    const loser = this.loser;
    const reveal = this.players.map((player) => `${player.name}: ${player.handText}`).join('\n');
    const ranking = this.ranking().map((player, index) => {
      const suffix = loser && player.id === loser.id ? ' — Қара Қатын' : '';
      return `${index + 1}. ${player.name}${suffix}`;
    }).join('\n');
    return `Ойын аяқталды.\n\nҰтылған: ${loser?.name || '-'}\n\nБарлық карталар:\n${reveal}\n\nРейтинг:\n${ranking}`;
  }

  gameKeyboard(): ReturnType<typeof Markup.inlineKeyboard> {
    const rows: any[] = [
      [Markup.button.switchToCurrentChat('Карталарым 🃏', `hand:${this.chatId}`)]
    ];

    const current = this.currentPlayer;
    if (current) {
      for (const target of this.activePlayers) {
        if (target.id !== current.id && target.cardsCount > 0) {
          rows.push([Markup.button.callback(`${target.name} (${target.cardsCount})`, `target:${this.chatId}:${target.id}`)]);
        }
      }
    }

    return Markup.inlineKeyboard(rows);
  }

  hiddenCardsKeyboard(target: Player): ReturnType<typeof Markup.inlineKeyboard> {
    const buttons = Array.from({ length: target.cardsCount }, (_, index) => {
      return Markup.button.callback(String(index + 1), `draw:${this.chatId}:${target.id}:${index}`);
    });
    const rows: any[] = chunk(buttons, 6);
    rows.push([Markup.button.callback('Артқа', `back:${this.chatId}`)]);
    return Markup.inlineKeyboard(rows);
  }

  private assertTurn(actorId: number): Player {
    if (this.phase !== 'playing') throw new Error('Ойын қазір жүріп жатқан жоқ');
    const player = this.currentPlayer;
    if (!player || player.id !== actorId) throw new Error('Қазір сіздің кезегіңіз емес');
    return player;
  }

  private discardPairs(player: Player): PairResult[] {
    const pairs: PairResult[] = [];
    const byRank = new Map<Rank, Card[]>();

    for (const card of player.hand) {
      if (!byRank.has(card.rank)) byRank.set(card.rank, []);
      byRank.get(card.rank)?.push(card);
    }

    for (const [rank, cards] of byRank.entries()) {
      while (cards.length >= 2) {
        const first = cards.shift() as Card;
        const second = cards.shift() as Card;
        pairs.push({ rank, cards: [first, second] });
        player.hand = player.hand.filter((card) => card !== first && card !== second);
      }
    }

    player.sortHand();
    return pairs;
  }

  private markNewFinishedPlayers(): Player[] {
    const finished: Player[] = [];
    for (const player of this.players) {
      if (player.active && player.cardsCount === 0) {
        player.active = false;
        player.finishPlace = this.finishedOrder.length + 1;
        this.finishedOrder.push(player.id);
        finished.push(player);
      }
    }
    return finished;
  }

  private nextActivePlayerId(afterPlayerId: number | null): number | null {
    const active = this.activePlayers;
    if (!active.length) return null;
    if (afterPlayerId === null) return active[0].id;

    const start = this.players.findIndex((player) => player.id === afterPlayerId);
    for (let offset = 1; offset <= this.players.length; offset++) {
      const player = this.players[(start + offset + this.players.length) % this.players.length];
      if (player.active) return player.id;
    }

    return active[0].id;
  }

  private ranking(): Player[] {
    const finished = this.finishedOrder
      .map((id) => this.findPlayer(id))
      .filter((player): player is Player => Boolean(player));
    return this.loser ? [...finished, this.loser] : finished;
  }
}

class GameManager {
  private games = new Map<number, Game>();

  createGame(chatId: number, hostId: number, hostName: string): Game {
    const game = new Game(chatId, hostId, hostName);
    game.addPlayer(hostId, hostName);
    this.games.set(chatId, game);
    return game;
  }

  getGame(chatId: number): Game | undefined {
    return this.games.get(chatId);
  }

  requireGame(chatId: number): Game {
    const game = this.games.get(chatId);
    if (!game) throw new Error('Алдымен ойын бөлмесін құрыңыз: /newgame');
    return game;
  }

  deleteGame(chatId: number): void {
    this.games.delete(chatId);
  }

  findGameByPlayer(userId: number): Game | undefined {
    return [...this.games.values()].find((game) => {
      return game.phase === 'playing' && Boolean(game.findPlayer(userId));
    });
  }
}

const manager = new GameManager();

function parseCardText(text: string): Card {
  const suit = suitFromText[text[0]];
  const rank = text.slice(1) as Rank;
  return new Card(suit, rank);
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function nameOf(ctx: any): string {
  return ctx.from?.username ? `@${ctx.from.username}` : (ctx.from?.first_name || String(ctx.from?.id));
}

function pairMessages(pairs: PairResult[]): string[] {
  return pairs.map((pair) => `Сіз ${rankNames[pair.rank]} жұбын жинадыңыз.`);
}

function inlineCardResult(card: Card, index: number) {
  return {
    type: 'sticker',
    id: `hand:${card.id}:${index}`,
    sticker_file_id: card.stickerId,
    input_message_content: {
      message_text: '🃏 Карта қаралды'
    }
  };
}

function inlineArticleResult(card: Card, index: number) {
  return {
    type: 'article',
    id: `hand:${card.id}:${index}:article`,
    title: card.text,
    description: 'Стикер ашылмаса',
    input_message_content: {
      message_text: '🃏 Карта қаралды'
    }
  };
}

async function safeTell(chatId: number, text: string, extra?: any) {
  try {
    return await bot.telegram.sendMessage(chatId, text, extra);
  } catch (error) {
    console.log('жіберу қатесі', chatId, (error as Error).message);
    return null;
  }
}

async function announceTurn(game: Game): Promise<void> {
  if (game.phase === 'finished') {
    await safeTell(game.chatId, game.finalText());
    return;
  }

  const current = game.currentPlayer;
  if (!current) return;
  await safeTell(
    game.chatId,
    `${game.publicState()}\n\n${current.name}, карта алу үшін ойыншы таңдаңыз.\nКарталарыңызды inline арқылы қараңыз: «Карталарым 🃏».`,
    game.gameKeyboard()
  );
}

async function sendPairSummary(game: Game, pairs: PlayerPairResult[]): Promise<void> {
  if (!pairs.length) return;
  const lines = pairs.map(({ player, pair }) => `${player.name}: ${rankNames[pair.rank]}`).join('\n');
  await safeTell(game.chatId, `Жұптар автоматты түрде алынды:\n${lines}`);
}

bot.start(async (ctx) => {
  await ctx.reply('Қара Қатын бот. Топта: /newgame, /join, /leave, /startgame.');
});

bot.command('newgame', async (ctx) => {
  if (!ctx.chat || !ctx.from) return;
  const game = manager.createGame(ctx.chat.id, ctx.from.id, nameOf(ctx));
  await ctx.reply(
    `Ойын бөлмесі құрылды.\nОйын иесі: ${game.hostName}\nОйыншылар: ${game.players.length}/8\n\n/join — қосылу\n/startgame — бастау`
  );
});

bot.command('join', async (ctx) => {
  if (!ctx.chat || !ctx.from) return;
  try {
    const game = manager.requireGame(ctx.chat.id);
    const player = game.addPlayer(ctx.from.id, nameOf(ctx));
    await ctx.reply(`${player.name} қосылды. Ойыншылар: ${game.players.length}/8.`);
  } catch (error) {
    await ctx.reply((error as Error).message);
  }
});

bot.command('leave', async (ctx) => {
  if (!ctx.chat || !ctx.from) return;
  try {
    const game = manager.requireGame(ctx.chat.id);
    const hostLeft = ctx.from.id === game.hostId;
    game.removePlayer(ctx.from.id);

    if (hostLeft || game.players.length === 0) {
      manager.deleteGame(ctx.chat.id);
      await ctx.reply(hostLeft ? 'Ойын иесі шықты. Ойын бөлмесі жабылды.' : 'Ойын бөлмесі жабылды.');
      return;
    }

    await ctx.reply(`Ойыншылар: ${game.players.length}/8.`);
  } catch (error) {
    await ctx.reply((error as Error).message);
  }
});

bot.command('startgame', async (ctx) => {
  if (!ctx.chat || !ctx.from) return;
  try {
    const game = manager.requireGame(ctx.chat.id);
    if (ctx.from.id !== game.hostId) {
      await ctx.reply('Ойынды тек хост бастай алады.');
      return;
    }

    const pairs = game.start();
    await ctx.reply(
      `Ойын басталды. Ойыншылар: ${game.players.length}.\nҚара Қатын: ♠Q\nКарталарыңызды стикерлі inline батырма арқылы қараңыз.`,
      game.gameKeyboard()
    );
    await sendPairSummary(game, pairs);
    await announceTurn(game);
  } catch (error) {
    await ctx.reply((error as Error).message);
  }
});

bot.action(/^target:(-?\d+):(\d+)$/, async (ctx: any) => {
  const chatId = Number(ctx.match[1]);
  const targetId = Number(ctx.match[2]);
  const game = manager.getGame(chatId);
  if (!game || !ctx.from) return ctx.answerCbQuery('Ескі батырма');

  try {
    const target = game.chooseTarget(ctx.from.id, targetId);
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `${game.publicState()}\n\n${target.name}: ${target.cardsCount} карта\nЖасырын позицияны таңдаңыз:`,
      game.hiddenCardsKeyboard(target)
    );
  } catch (error) {
    await ctx.answerCbQuery((error as Error).message);
  }
});

bot.action(/^back:(-?\d+)$/, async (ctx: any) => {
  const chatId = Number(ctx.match[1]);
  const game = manager.getGame(chatId);
  if (!game || !ctx.from) return ctx.answerCbQuery('Ескі батырма');
  if (game.currentPlayerId !== ctx.from.id) return ctx.answerCbQuery('Қазір сіздің кезегіңіз емес');

  game.pendingTargetId = null;
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `${game.publicState()}\n\n${game.currentPlayer?.name}, карта алу үшін ойыншы таңдаңыз.`,
    game.gameKeyboard()
  );
});

bot.action(/^draw:(-?\d+):(\d+):(\d+)$/, async (ctx: any) => {
  const chatId = Number(ctx.match[1]);
  const targetId = Number(ctx.match[2]);
  const cardIndex = Number(ctx.match[3]);
  const game = manager.getGame(chatId);
  if (!game || !ctx.from) return ctx.answerCbQuery('Ескі батырма');

  try {
    const result = game.drawFromTarget(ctx.from.id, targetId, cardIndex);
    const pairText = pairMessages(result.pairs);
    await ctx.answerCbQuery([`Алынды: ${result.drawnCard.text}`, ...pairText].join('\n'));

    for (const player of result.finishedPlayers) {
      await safeTell(game.chatId, `${player.name} картасыз қалды және ойынды аяқтады.`);
    }

    const publicPairs = pairText.length ? `\n${result.currentPlayer.name}: ${pairText.join(' ')}` : '';
    await ctx.editMessageText(
      `${result.currentPlayer.name} ${result.targetPlayer.name} ойыншысынан бір карта алды.${publicPairs}`
    );

    if (result.gameEnded) {
      await safeTell(game.chatId, game.finalText());
      return;
    }

    await announceTurn(game);
  } catch (error) {
    await ctx.answerCbQuery((error as Error).message);
  }
});

bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query.trim();
  const match = /^hand:(-?\d+)$/.exec(query);
  const game = match ? manager.getGame(Number(match[1])) : manager.findGameByPlayer(ctx.from.id);
  if (!game) return ctx.answerInlineQuery([], { cache_time: 0, is_personal: true });

  const player = game.findPlayer(ctx.from.id);
  if (!player || !player.hand.length) {
    return ctx.answerInlineQuery([], { cache_time: 0, is_personal: true });
  }

  const results = player.hand.map((card, index) => inlineCardResult(card, index));
  try {
    await ctx.answerInlineQuery(results as any, { cache_time: 0, is_personal: true });
  } catch (error: any) {
    if (error?.description?.includes('DOCUMENT_INVALID')) {
      const fallback = player.hand.map((card, index) => inlineArticleResult(card, index));
      await ctx.answerInlineQuery(fallback as any, { cache_time: 0, is_personal: true });
      return;
    }
    throw error;
  }
});

bot.on('sticker', async (ctx) => {
  const sticker = ctx.message.sticker;
  console.log('[STICKER]', {
    emoji: sticker.emoji,
    set_name: sticker.set_name,
    file_id: sticker.file_id,
    file_unique_id: sticker.file_unique_id,
    type: sticker.type
  });
  await ctx.reply(`file_id:\n${sticker.file_id}\n\nжинақ: ${sticker.set_name || '-'}\nтүрі: ${sticker.type || '-'}`);
});

bot.catch((err) => console.error('Бот қатесі', err));

const botCommands = [
  { command: 'newgame', description: 'Қара Қатын бөлмесін құру' },
  { command: 'join', description: 'Ойын бөлмесіне қосылу' },
  { command: 'leave', description: 'Ойын бөлмесінен шығу' },
  { command: 'startgame', description: 'Ойынды бастау' }
];

async function launchBot() {
  await bot.telegram.setMyCommands(botCommands);
  await bot.telegram.setMyCommands(botCommands, { scope: { type: 'all_group_chats' } });
  await bot.telegram.setMyCommands(botCommands, { scope: { type: 'all_private_chats' } });
  await bot.launch();
  console.log('Қара Қатын бот іске қосылды');
}

launchBot().catch((error) => console.error('launch failed', error));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
