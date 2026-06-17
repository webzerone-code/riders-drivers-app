import * as crypto from 'crypto';
export const INSTANCE_ID = `server_node_${crypto.randomBytes(4).toString('hex')}`;
