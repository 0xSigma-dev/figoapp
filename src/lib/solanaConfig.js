import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl(process.env.SOLANA_HOST), 'confirmed');

export { connection };
