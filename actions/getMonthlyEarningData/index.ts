"use server";

import db from "@/db";
const monthlyEarningData = [
  {
    month: "Jan",
    total: 0,
  },
  {
    month: "Feb",
    total: 0,
  },
  {
    month: "Mar",
    total: 0,
  },
  {
    month: "Apr",
    total: 0,
  },
  {
    month: "May",
    total: 0,
  },
  {
    month: "Jun",
    total: 0,
  },
  {
    month: "Jul",
    total: 0,
  },
  {
    month: "Aug",
    total: 0,
  },
  {
    month: "Sep",
    total: 0,
  },
  {
    month: "Oct",
    total: 0,
  },
  {
    month: "Nov",
    total: 0,
  },
  {
    month: "Dec",
    total: 0,
  },
];

export const getMonthlyEarningData = async ({ userId }: { userId: string }) => {
  const transactions = await db.transaction.findMany({
    where: {
      user_id: userId,
    },
    select: {
      amount: true,
      createdAt: true,
    },
  });

  transactions.map((transaction) => {
    const month = transaction.createdAt.getMonth();
    monthlyEarningData[month].total += parseFloat(transaction.amount);
  });
  return monthlyEarningData;
};
