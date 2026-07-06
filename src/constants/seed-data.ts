import { banks } from "@/db/schema/finance";

type Bank = typeof banks.$inferInsert;

type SeedBank = {
  bank: Bank;
  patterns?: {
    label: string;
    regex: string;
  }[];
};

export const seedData: SeedBank[] = [
  {
    bank: {
      name: "Commercial Bank of Ethiopia",
      shortCodes: ["CBE"],
    },
    patterns: [
      {
        label: "Salary",
        regex:
          "A debit transaction of ETB\\s*(?<amount>[\\d,]+\\.\\d+)\\..*?current balance is ETB\\s*(?<balanceAfter>[\\d,]+\\.\\d+)\\..*?(?<reference>https:\\/\\/\\S+)",
      },
    ],
  },
  {
    bank: {
      name: "Telebirr",
      shortCodes: ["127"],
    },
  },
  {
    bank: {
      name: "Dashen Bank",
      shortCodes: ["DashenBank"],
    },
  },
];
