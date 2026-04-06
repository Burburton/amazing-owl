export interface Session {
  request_id: string;
  started_at: Date;
  state: string;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(_requestId: string): Session {
    throw new Error('Not implemented');
  }

  getSession(requestId: string): Session | undefined {
    return this.sessions.get(requestId);
  }

  updateSession(_requestId: string, _state: string): void {
    throw new Error('Not implemented');
  }
}