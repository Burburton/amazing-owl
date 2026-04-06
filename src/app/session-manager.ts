import { createLogger } from '../utils/logger';

const logger = createLogger('session-manager');

export interface Session {
  request_id: string;
  started_at: Date;
  state: string;
  last_updated_at: Date;
  metadata?: Record<string, unknown>;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(requestId: string, metadata?: Record<string, unknown>): Session {
    const now = new Date();
    const session: Session = {
      request_id: requestId,
      started_at: now,
      state: 'NEW_REQUEST',
      last_updated_at: now,
    };

    if (metadata !== undefined) {
      session.metadata = metadata;
    }

    this.sessions.set(requestId, session);
    
    logger.info('session_created', { request_id: requestId });
    
    return session;
  }

  getSession(requestId: string): Session | undefined {
    return this.sessions.get(requestId);
  }

  updateSession(requestId: string, state: string, metadata?: Record<string, unknown>): Session | undefined {
    const session = this.sessions.get(requestId);
    
    if (!session) {
      logger.warn('session_not_found_for_update', { request_id: requestId });
      return undefined;
    }

    session.state = state;
    session.last_updated_at = new Date();
    
    if (metadata) {
      session.metadata = { ...session.metadata, ...metadata };
    }

    logger.debug('session_updated', { request_id: requestId, state });
    
    return session;
  }

  endSession(requestId: string): boolean {
    const session = this.sessions.get(requestId);
    
    if (!session) {
      logger.warn('session_not_found_for_end', { request_id: requestId });
      return false;
    }

    session.state = 'DONE';
    session.last_updated_at = new Date();
    
    logger.info('session_ended', { 
      request_id: requestId, 
      duration_ms: session.last_updated_at.getTime() - session.started_at.getTime() 
    });
    
    return true;
  }

  deleteSession(requestId: string): boolean {
    const deleted = this.sessions.delete(requestId);
    
    if (deleted) {
      logger.debug('session_deleted', { request_id: requestId });
    }
    
    return deleted;
  }

  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.state !== 'DONE');
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  clearAllSessions(): void {
    this.sessions.clear();
    logger.info('all_sessions_cleared');
  }
}