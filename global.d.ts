declare namespace TokitoLia {
  export interface CommandManifest {
    name: string;
    aliases?: string[];
    author?: string;
    description: string;
    usage: string | string[];
    developer?: string;
    cooldown?: number;
    config: {
      botAdmin?: boolean;
      botModerator?: boolean;
      noPrefix?: boolean;
      privateOnly?: boolean;
    };
  }

  export interface Command {
    manifest: CommandManifest;
    deploy(ctx: EntryObj): Promise<any> | any;
    style?: {
      type: string;
      title: string;
      footer: string;
    };
    font?: {
      title?: string | string[];
      content?: string | string[];
      footer?: string | string[];
    };
  }
  export interface Chat {
    send(message: string, goal?: string, noStyle?: boolean): Promise<any>;
    reply(message: string, goal?: string): Promise<any>;
  }

  export interface EntryObj {
    api: any;
    chat: Chat;
    event: Event;
    args: string[];
    fonts: Fonts;
    styler: Styler;
    route: Route;
    tokitoDB: import("./Tokito/resources/database/main");
    TokitoHM: typeof import("./System/handler/styler/tokitoHM");
    replies: Map<string, RepliesArg>;
    LevelSystem: typeof import("./Tokito/resources/level/utils");
    BalanceHandler: typeof import("./Tokito/resources/balance/utils");
    Inventory: typeof import("./Tokito/resources/inventory/utils");
  }
  export type CommandContext = EntryObj;

  export interface Fonts {
    sans(text: string): string;
    bold(text: string): string;
    monospace(text: string): string;
  }

  export interface Styler {
    (
      type: string,
      title: string,
      content: string,
      footer: string,
      styles?: any
    ): string;
  }

  export interface Route {
    chatbotMarin(message: string): Promise<string>;
  }

  export interface RepliesArg {
    callback: (
      entryObj: EntryObj & { ReplyData: TokitoLia.RepliesArg }
    ) => void;
    [key: string]: any;
  }

  export interface Event {
    body: string;
    senderID: string;
    threadID: string;
    messageID: string;
    type: string;
    messageReply?: {
      messageID: string;
      senderID: string;
    };
    [key: string]: any;
  }

  export interface GlobalTokito {
    config: {
      prefix: string;
      maintenance: boolean;
      developers: string[];
      admins: string[];
      moderators: string[];
      webDevs: string[];
      webMods: string[];
      webAdmns: string[];
      antitheft: unknown;
    };
    commands: Map<string, Command>;
    events: Map<string, any>;
    cooldowns: Map<string, Record<string, number>>;
    utils: any;
  }
}

declare namespace globalThis {
  var bot: import("events").EventEmitter;
  var Tokito: TokitoLia.GlobalTokito;
}
