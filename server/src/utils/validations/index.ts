import { Request } from 'express';

export const daysRemainingGreaterThanDaysAllocated = (
  daysRemaining: any,
  { req }: { req: Request },
) => {
  const { daysAllocated } = req.body;
  if (!daysAllocated || !daysRemaining) {
    return true; // don't validate if any value is missing
  }
  return daysRemaining > daysAllocated;
};
