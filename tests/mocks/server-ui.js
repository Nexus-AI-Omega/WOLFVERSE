export const forms = { responses: [], seen: [], reset() { this.responses = []; this.seen = []; } };
export class ActionFormData {
  constructor() { this.buttons = []; }
  title(text) { this.titleText = text; return this; }
  body(text) { this.bodyText = text; return this; }
  button(text, iconPath) { this.buttons.push({ text, iconPath }); return this; }
  async show(player) {
    forms.seen.push({ playerId: player.id, title: this.titleText, body: this.bodyText, buttons: this.buttons });
    const response = forms.responses.shift();
    return typeof response === 'function' ? await response(player, this) : response ?? { canceled: true };
  }
}
