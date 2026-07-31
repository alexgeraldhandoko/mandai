import { randomUUID } from 'node:crypto';

import type { Session } from './types.js';

const SESSION_TTL_MS = 30 * 60 * 1000;

export class SessionStore {
  private readonly sessions = new Map<string, Session>();

  create(image: Buffer, imageMimeType: string): Session {
    this.prune();
    const session: Session = {
      id: randomUUID(),
      image,
      imageMimeType,
      conversation: [],
      updatedAt: Date.now()
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(id: string): Session | undefined {
    this.prune();
    const session = this.sessions.get(id);
    if (session) session.updatedAt = Date.now();
    return session;
  }

  private prune() {
    const expiry = Date.now() - SESSION_TTL_MS;
    for (const [id, session] of this.sessions) {
      if (session.updatedAt < expiry) this.sessions.delete(id);
    }
  }
}

