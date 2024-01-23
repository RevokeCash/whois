import { Chain, chains } from '@revoke.cash/chains';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

export const allChainIds = Object.values(chains.all() as Record<string, Chain>).map(({ chainId }) => chainId);

export const DATA_BASE_PATH = path.join(__dirname, '..', '..', 'data');
