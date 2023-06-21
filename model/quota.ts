export interface IQuotas {
    day: number;
    month: number;
    week: number;
}

export const quotaMaxExtra = 50;

export const quotaPriceDay = 0.01;
export const quotaPriceWeek = 0.02;
export const quotaPriceMonth = 0.05;

export const quotaPriceExtra = 0.03;
export const urgentThreshold = 100; // characters
export const urgentPriceIncrease = 0.5; // 50%
