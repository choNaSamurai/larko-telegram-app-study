// initData validation utility

/**
 * Validates Telegram init data hash.
 * This logic should be implemented on the SERVER (e.g. Supabase Edge Function).
 * On the client, we just provide the utility for reference or local testing if mock bot token is provided.
 * 
 * @param initData Raw init data string from Telegram
 * @param botToken The bot token from @BotFather
 * @returns boolean
 */
export async function validateInitData(initData: string, botToken: string): Promise<boolean> {
  if (!initData || !botToken) return false;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const params = Array.from(urlParams.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');

  // We use SubtleCrypto for standard compliance if available, 
  // but for edge functions we'll use the platform's crypto.
  // This is a reference implementation.
  try {
    const encoder = new TextEncoder();
    const secretKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const secret = await window.crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(botToken)
    );

    const validationKey = await window.crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      validationKey,
      encoder.encode(params)
    );

    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signatureHex === hash;
  } catch (e) {
    console.error('Validation error:', e);
    return false;
  }
}
