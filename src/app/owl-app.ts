import type { OwlRequest, OwlResponse } from '../contracts';

export class OwlApp {
  async process(_request: OwlRequest): Promise<OwlResponse> {
    throw new Error('Not implemented');
  }
}