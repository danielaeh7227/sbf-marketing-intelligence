// Number and text formatting. en-SG grouping, $ currency.
export const fmtNum = (n, dec = 0) => Number(n).toLocaleString('en-SG', { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const sgd = (n, dec) => '$' + Number(n).toLocaleString('en-SG', { minimumFractionDigits: dec ?? (n % 1 ? 2 : 0), maximumFractionDigits: dec ?? 2 });
export const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2);
export const lowerFirst = s => s.charAt(0).toLowerCase() + s.slice(1);
