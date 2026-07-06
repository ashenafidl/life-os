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
          "Dear\\s+(?<sender>.+?)\\s+A debit transaction of ETB\\s+(?<amount>[\\d,]+\\.\\d+)\\..*?\\s+on your account\\s*(?<senderAccount>\\d+\\*{1,}\\d+)\\.\\s+service charge of ETB\\s*(?<serviceCharge>[\\d,]+\\.\\d+)\\s+and VAT\\([\\d,]+\\%\\) of.+?(?<vat>[\\d,]+.\\d+)\\s+and disaster recovery\\([\\d,]+\\%\\) of\\s*(?<disasterRecovery>[\\d,]+\\.\\d+)\\s+with total of ETB\\s*(?<totalAmount>[\\d,]+\\.\\d+).+?current balance is ETB\\s*(?<balanceAfter>[\\d,]+\\.\\d+)\\..*?(?<reference>https:\\/\\/\\S+)",
      },
    ],
  },
  {
    bank: {
      name: "Telebirr",
      shortCodes: ["127"],
    },
    patterns: [
      {
        label: "Transfer to individual",
        regex:
          "Dear\\s+(?<sender>.+?)\\s+you\\s+have\\s+transferred\\s+ETB\\s+(?<amount>[\\d,]+.\\d+)\\s+to\\s+(?<recipientName>.+?)\\s+\\((?<recipientPhone>[\\d,]+\\*{1,}\\d+)\\)\\s+on\\s+(?<datTime>\\d{2}\\/\\d{2}\\/\\d{4}\\s+\\d{2}:\\d{2}:\\d{2}).\\s+Your\\s+transaction\\s+number\\s+is\\s+(?<tnxID>[a-zA-Z0-9]+).\\s+The\\s+service\\s+fee\\s+is\\s+ETB\\s+(?<serviceCharge>[\\d,]+.\\d+).+service\\s+fee\\s+is\\s+ETB\\s+(?<vat>[\\d,]+.\\d+)\\..+account\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+.\\d+)\\..+this\\s+link:\\s+(?<reference>https:\\/\\/\\S+)\\.",
      },
    ],
  },
  {
    bank: {
      name: "Dashen Bank",
      shortCodes: ["DashenBank"],
    },
  },
];
