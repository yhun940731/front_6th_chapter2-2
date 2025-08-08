/** 4~12자의 영문 대문자/숫자 조합인지 검사 */
export const isValidCouponCode = (code: string): boolean => /^[A-Z0-9]{4,12}$/.test(code);

/** 재고(정수) 유효성: 0 이상 9999 이하 권장 */
export const isValidStock = (stock: number): boolean => Number.isInteger(stock) && stock >= 0;

/** 가격 유효성: 0 이상 정수 */
export const isValidPrice = (price: number): boolean => Number.isInteger(price) && price >= 0;

/** 문자열에서 숫자만 추출 */
export const extractNumbers = (value: string): string => (value.match(/\d+/g) || []).join('');

/** 공통 입력 처리: 빈 문자열이면 0, 숫자만 허용 */
export const parseIntOrZero = (value: string): number => {
  const only = extractNumbers(value);
  return only === '' ? 0 : parseInt(only, 10);
};

/** 숫자를 특정 범위로 클램프 */
export const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

/** 문자열이 숫자만으로 구성되었는지 확인 */
export const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);
