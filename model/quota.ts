export interface IQuotas {
    day: number;
    month: number;
    week: number;
}

export const quotaPriceDay = 0.01;
export const quotaPriceWeek = 0.02;
export const quotaPriceMonth = 0.05;

export const urgentThreshold = 100; // characters
export const urgentPriceIncrease = 0.5; // 50%
