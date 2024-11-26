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

export const getEarningData = async ({ userId }: { userId: string }) => {
  const transactions = await db.transaction.findMany({
    where: {
      user_id: userId,
    },
    select: {
      amount: true,
      createdAt: true,
      hash: true,
      fromPublicKey: true,
    },
  });
  const totalEarning = transactions.reduce((acc, transaction) => {
    return acc + parseFloat(transaction.amount);
  }, 0);

  const last30daysEarning = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.createdAt);
    const currentDate = new Date();
    const diff = currentDate.getTime() - date.getTime(); // in milliseconds
    if (diff < 1000 * 60 * 60 * 24 * 30) {
      return acc + parseFloat(transaction.amount);
    }
    return acc;
  }, 0);

  const last7daysEarning = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.createdAt);
    const currentDate = new Date();
    const diff = currentDate.getTime() - date.getTime();
    if (diff < 1000 * 60 * 60 * 24 * 7) {
      return acc + parseFloat(transaction.amount);
    }
    return acc;
  }, 0);

  transactions.map((transaction) => {
    const month = transaction.createdAt.getMonth();
    monthlyEarningData[month].total += parseFloat(transaction.amount);
  });

  return {
    totalEarning,
    last30daysEarning,
    last7daysEarning,
    totalTrasactions: transactions.length,
    recentTransactions: transactions.slice(0, 5),
    monthlyEarningData,
  };
};
