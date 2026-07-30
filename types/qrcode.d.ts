declare module 'qrcode' {
  export interface QRCodeRenderersOptions {
    version?: number;
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
    maskPattern?: number;
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(
    text: string | Array<{ data: string | Buffer; mode?: string }>,
    options?: QRCodeRenderersOptions
  ): Promise<string>;

  export function toString(
    text: string | Array<{ data: string | Buffer; mode?: string }>,
    options?: QRCodeRenderersOptions
  ): Promise<string>;
}
