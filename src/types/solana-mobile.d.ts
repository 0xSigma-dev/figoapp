declare module '@solana-mobile/wallet-adapter-mobile' {
    import { Adapter, WalletAdapterNetwork } from "@solana/wallet-adapter-base";
  
    export class SolanaMobileWalletAdapter implements Adapter {
      constructor(config: {
        addressSelector?: any;
        appIdentity: {
          name: string;
          uri: string;
          icon: string;
        };
        authorizationResultCache?: any;
        cluster?: WalletAdapterNetwork;
        onWalletNotFound?: () => void;
      });
  
      public name: string;
      public ready: boolean;
      public connecting: boolean;
      public connected: boolean;
      public publicKey: any;
      public autoApprove: boolean;
      public signTransaction(transaction: any): Promise<any>;
      public signAllTransactions(transactions: any[]): Promise<any[]>;
      public connect(): Promise<void>;
      public disconnect(): Promise<void>;
      public on(event: string, listener: (...args: any[]) => void): this;
      public off(event: string, listener: (...args: any[]) => void): this;
    }
  
    export function createDefaultAddressSelector(): any;
    export function createDefaultAuthorizationResultCache(): any;
    export function createDefaultWalletNotFoundHandler(): () => void;
  }
  