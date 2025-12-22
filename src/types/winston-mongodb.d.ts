declare module 'winston-mongodb' {
  import winston from 'winston';
  
  export interface MongoDBTransportOptions extends winston.transport.TransportStreamOptions {
    db: string | Promise<any>;
    options?: any;
    collection?: string;
    storeHost?: boolean;
    username?: string;
    password?: string;
    label?: string;
    name?: string;
    capped?: boolean;
    cappedSize?: number;
    cappedMax?: number;
    tryReconnect?: boolean;
    decolorize?: boolean;
    expireAfterSeconds?: number;
    metaKey?: string;
  }

  export class MongoDB extends winston.transport {
    constructor(options: MongoDBTransportOptions);
  }
}
