import { httpsUrl } from '@/lib/legal';

describe('httpsUrl', () => {
  it('accepts https URLs and rejects everything else', () => {
    expect(httpsUrl('https://example.com/privacy')).toBe(
      'https://example.com/privacy',
    );
    expect(httpsUrl('  https://example.com/support  ')).toBe(
      'https://example.com/support',
    );
    expect(httpsUrl('http://example.com/privacy')).toBeNull();
    expect(httpsUrl('')).toBeNull();
    expect(httpsUrl('   ')).toBeNull();
    expect(httpsUrl(undefined)).toBeNull();
  });
});