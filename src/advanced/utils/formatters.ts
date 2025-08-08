/** 가격을 한국 원화 형식으로 포맷 (10000 -> "10,000원") */
export const formatPrice = (price: number): string => `${price.toLocaleString()}원`;

/** 날짜를 YYYY-MM-DD 형식으로 포맷 */
export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** 소수 비율을 퍼센트 문자열로 포맷 (0.1 -> "10%") */
export const formatPercentage = (rate: number): string => `${Math.round(rate * 100)}%`;
