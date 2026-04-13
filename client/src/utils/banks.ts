export interface BankOption {
  id: string;
  name: string;
  domain: string;
  customLogoUrl?: string;
}

export const POPULAR_BANKS: BankOption[] = [
  { id: 'nubank', name: 'Nubank', domain: 'nubank.com.br' },
  { id: 'itau', name: 'Itaú', domain: 'itau.com.br' },
  { id: 'bb', name: 'Banco do Brasil', domain: 'bb.com.br' },
  { id: 'bradesco', name: 'Bradesco', domain: 'bradesco.com.br' },
  { id: 'santander', name: 'Santander', domain: 'santander.com.br' },
  { id: 'inter', name: 'Banco Inter', domain: 'bancointer.com.br' },
  { id: 'c6', name: 'C6 Bank', domain: 'c6bank.com.br' },
  { 
    id: 'caixa', 
    name: 'Caixa Econômica', 
    domain: 'caixa.gov.br', 
    customLogoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="15" fill="%23005CA9"/><path d="M 25 25 L 75 75 M 25 75 L 75 25" stroke="%23FFF" stroke-width="16" stroke-linecap="square"/><path d="M 46 25 L 75 54 M 25 46 L 54 75" stroke="%23F39200" stroke-width="6" stroke-linecap="square"/></svg>'
  },
  { id: 'btg', name: 'BTG Pactual', domain: 'btgpactual.com' },
  { id: 'xpi', name: 'XP Investimentos', domain: 'xpi.com.br' },
  { 
    id: 'sicredi', 
    name: 'Sicredi', 
    domain: 'sicredi.com.br', 
    customLogoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="15" fill="%23008A4A"/><path d="M 50 50 L 25 25 A 35 35 0 0 1 50 15 Z M 50 50 L 75 25 A 35 35 0 0 1 85 50 Z M 50 50 L 75 75 A 35 35 0 0 1 50 85 Z M 50 50 L 25 75 A 35 35 0 0 1 15 50 Z" fill="%23FFF"/></svg>' 
  },
  { id: 'sicoob', name: 'Sicoob', domain: 'sicoob.com.br' },
  { id: 'mercado_pago', name: 'Mercado Pago', domain: 'mercadopago.com.br' },
  { id: 'picpay', name: 'PicPay', domain: 'picpay.com' },
  { id: 'pagbank', name: 'PagBank', domain: 'pagbank.com.br' },
  { id: 'outros', name: 'Outro Banco', domain: 'finance.yahoo.com' } // Dummy domain fallback
];

export function getBankDomainByName(bankName: string): string | null {
  if (!bankName) return null;
  const normalized = bankName.trim().toLowerCase();
  const bank = POPULAR_BANKS.find(b => b.name.toLowerCase() === normalized);
  return bank ? bank.domain : null;
}

export function getBankLogoUrl(bankName: string): string | null {
  if (!bankName) return null;
  const normalized = bankName.trim().toLowerCase();
  const bank = POPULAR_BANKS.find(b => b.name.toLowerCase() === normalized);
  
  if (!bank) return null;
  
  // Retorna a URL customizada SVG super nítida se declarada, senão usa o Icon.Horse
  if (bank.customLogoUrl) {
    return bank.customLogoUrl;
  }
  return `https://icon.horse/icon/${bank.domain}`;
}
