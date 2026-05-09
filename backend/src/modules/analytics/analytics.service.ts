// service is coding logic
// relies on repo

import * as AnalyticsRepo from '././analytics.repository'; //pulls all exported methods from the analytics.repository


export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  } 
}// this is a custom error class for validation errors copied from vendors.service.ts

// FOR ANALYTICS IT MAY BE IMPORTANT TO DECERN THE start and end times (range of time being recorded)
// for this puropose a new function, getRangeConfig is born! 
// This will be used in our functions to return only what is needed
type Range = 'day' | 'week' | 'month' | '3months' | '6months' | 'year' | null;
type Interval = 'hour' | 'day' | 'week' | 'month' | 'year';
type RangeConfig = {
    interval: Interval;
    window: string;
};
const getRangeConfig = (range: Range | null) : RangeConfig => {
  switch (range) {
    case 'day':
      return { interval: 'hour', window: '1 day' };
    case 'week':
      return { interval: 'day', window: '7 days' };
    case 'month':
      return { interval: 'day', window: '1 month' };
    case '3months':
      return { interval: 'week', window: '3 months' };
    case '6months':
      return { interval: 'week', window: '6 months' };
    case 'year':
      return { interval: 'month', window: '1 year' };
    case null:
        return { interval: 'week', window: 'total' };

  }
};





export const getOrderTotal = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'|'year'
) => {
    return AnalyticsRepo.getOrderTotal(vendor_id, interval);
};

export const getRevenueTotal = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'|'year'
) => {
    return AnalyticsRepo.getRevenueTotal(vendor_id, interval);
};

export const getCustomerTotal = async (
    vendor_id : string,
    interval : 'hour'|'day'|'week'|'month'|'year'
) => {
    return AnalyticsRepo.getCustomerTotal(vendor_id, interval);
};




export const getOrderInRange = async (
    vendor_id: string,
    range: Range = null
) => {
    const { interval, window } = getRangeConfig(range);

    return AnalyticsRepo.getOrderTotal(
        vendor_id,
        interval,
        window
    );
};

export const getRevenueInRange = async (
    vendor_id: string,
    range: Range = null
) => {
    const { interval, window } = getRangeConfig(range);

    return AnalyticsRepo.getRevenueTotal(
        vendor_id,
        interval,
        window
    );
};

export const getCustomerInRange = async (
    vendor_id: string,
    range: Range = null
) => {
    const { interval, window } = getRangeConfig(range);

    return AnalyticsRepo.getCustomerTotal(
        vendor_id,
        interval,
        window
    );
};

export const getItems = async (
    vendor_id: string,
    range: Range = null
) => {
    const { interval, window } = getRangeConfig(range);

    return AnalyticsRepo.getItems(
        vendor_id
    );
};

// The requirements we need to report Sales, peak ordering hrs and a custom view, I was thinking Highest selling items
// The getRevenueTotal func in the repository satisfies the 1st view req


/*
The methods in this file take the "raw" database rows it and formats and parses them before they are sent to the controller
*/
export const getRevenueStats = async (                                      
    vendor_id: string,
    interval:  'hour' | 'day' | 'week' | 'month' | 'year'
) => {
    const rows = await AnalyticsRepo.getRevenueTotal(vendor_id,interval);
    return rows.map(row => ({
        period: row.period,
        revenue: parseFloat(row.revenue), 
    }));
};

