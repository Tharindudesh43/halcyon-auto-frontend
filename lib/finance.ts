
export type RateType = "reducing" | "flat";
export type VehicleCategory = "used" | "new";


export function monthlyPayment(principal: number, annualRatePct: number, months: number, type: RateType) {
  if (principal <= 0 || months <= 0) return 0;
  if (type === "flat") {
    return (principal + (principal * annualRatePct * (months / 12)) / 100) / months;
  }
  const r = annualRatePct / 1200;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}


export function effectiveRate(principal: number, payment: number, months: number) {
  if (principal <= 0 || payment <= 0 || months <= 0 || payment * months <= principal) return 0;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const pv = (payment * (1 - Math.pow(1 + mid, -months))) / mid;
    if (pv > principal) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 1200;
}

export type ScheduleRow = { month: number; payment: number; principal: number; interest: number; balance: number };

export function buildSchedule(principal: number, annualRatePct: number, months: number, type: RateType): ScheduleRow[] {
  if (principal <= 0 || months <= 0) return [];
  const payment = monthlyPayment(principal, annualRatePct, months, type);
  const rows: ScheduleRow[] = [];
  let balance = principal;

  if (type === "flat") {
    const interest = (principal * annualRatePct * (months / 12)) / 100 / months;
    const part = principal / months;
    for (let m = 1; m <= months; m++) {
      balance = Math.max(balance - part, 0);
      rows.push({ month: m, payment, principal: part, interest, balance });
    }
    return rows;
  }

  const r = annualRatePct / 1200;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const part = Math.min(payment - interest, balance);
    balance = Math.max(balance - part, 0);
    rows.push({ month: m, payment, principal: part, interest, balance });
  }
  return rows;
}

export const maxLoan = (price: number, ltvPct: number) => Math.round((price * ltvPct) / 100);
export const minDownPayment = (price: number, ltvPct: number) => Math.max(price - maxLoan(price, ltvPct), 0);


export function categoryForYear(year: number, now = new Date()): VehicleCategory {
  return year < now.getFullYear() ? "used" : "new";
}

export type FinanceResult = {
  loan: number;
  payment: number;
  totalInterest: number;
  totalRepaid: number;
  totalCost: number;
  effectiveRate: number;
};

export function calculate(opts: {
  price: number;
  down: number;
  fees: number;
  ratePct: number;
  months: number;
  type: RateType;
}): FinanceResult {
  const loan = Math.max(opts.price - opts.down, 0);
  const payment = monthlyPayment(loan, opts.ratePct, opts.months, opts.type);
  const totalRepaid = payment * opts.months;
  return {
    loan,
    payment,
    totalInterest: Math.max(totalRepaid - loan, 0),
    totalRepaid,
    totalCost: opts.down + opts.fees + totalRepaid,
    effectiveRate: effectiveRate(loan, payment, opts.months),
  };
}
