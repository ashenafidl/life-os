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
        label: "Airtime top-up",
        regex:
          "Dear\\s+(?<sender>.+?)\\s+A debit transaction of ETB\\s+(?<amount>[\\d,]+\\.\\d+)\\..*?\\s+on your account\\s*(?<senderAccount>\\d+\\*{1,}\\d+)\\.\\s+service charge of ETB\\s*(?<serviceCharge>[\\d,]+\\.\\d+)\\s+and VAT\\([\\d,]+\\%\\) of.+?(?<vat>[\\d,]+.\\d+)\\s+and disaster recovery\\([\\d,]+\\%\\) of\\s*(?<disasterRecovery>[\\d,]+\\.\\d+)\\s+with total of ETB\\s*(?<totalAmount>[\\d,]+\\.\\d+).+?current balance is ETB\\s*(?<balanceAfter>[\\d,]+\\.\\d+)\\..*?(?<reference>https:\\/\\/\\S+)",
      },
      {
        label: "ATM withdrawal",
        regex:
          "Dear\\s+Mr\\s+(?<sender>.+?)\\s+your\\s+account\\s+(?<senderAccount>\\d+\\*{1,}\\d+)\\s+has\\s+been\\s+debited\\s+with\\s+ETB\\s+(?<amount>[\\d,]+\\.\\d+)\\s+including\\s+service\\s+charge\\s+ETB(?<serviceCharge>[\\d,]+\\.\\d+)\\S+ETB(?<disasterRecovery>[\\d,]+\\.\\d+)\\s+and\\s+VAT\\([\\d,]+\\%\\)\\s+ETB(?<vat>[\\d,]+\\.\\d+).+current\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+\\.\\d+)",
      },
      {
        label: "Transfer to CBE",
        regex:
          "Dear\\s+(?<sender>.+?)\\s+you\\s+have\\ssuccessfully\\s+transferred\\s+ETB\\s?(?<amount>[\\d,]+\\.\\d+)\\s+from\\s+account\\s+(?<senderAccount>\\d+\\*{1,}\\d+)\\s+to\\s+account\\s+(?<recipientAccount>\\d+\\*{1,}\\d+)\\s+\\((?<recipientName>.+?)\\).\\s+service\\s+charge\\s+of\\s+ETB\\s+(?<serviceCharge>[\\d,]+\\.\\d+)\\s+and\\s+VAT\\([\\d,]+\\%\\)\\s+of.+?(?<vat>[\\d,]+.\\d+)\\s+and\\s+disaster\\s+recovery\\([\\d,]+\\%\\)\\s+of\\s*(?<disasterRecovery>[\\d,]+\\.\\d+)\\s+with\\s+total\\s+of\\s+ETB\\s*(?<totalAmount>[\\d,]+\\.\\d+).+?current\\s+balance\\s+is\\s+ETB\\s*(?<balanceAfter>[\\d,]+\\.\\d+)\\..*?(?<reference>https:\\/\\/\\S+)",
      },
      {
        label: "Salary",
        regex:
          "Dear\\s+Mr\\s+(?<sender>.+?)\\s+your\\s+account\\s+(?<senderAccount>\\d+\\*{1,}\\d+)\\s+has\\s+been\\s+credited\\s+with\\s+ETB\\s+(?<amount>[\\d,]+\\.\\d+).+current\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+\\.\\d+)\\..*?(?<reference>https:\\/\\/\\S+)",
      },
      {
        label: "Incoming transfer from CBE account",
        regex:
          "Dear\\s+(?<sender>.+?)\\s+you\\s+have\\s+received\\s+ETB\\s+(?<amount>[\\d,]+\\.\\d+)\\s+from\\s+account\\s+(?<senderAccount>\\d+\\*{1,}\\d+)\\s+\\((?<senderName>.+?)\\)\\s+to\\s+your\\s+account\\s+(?<recipientAccount>\\d+\\*{1,}\\d+).\\s+your\\s+current\\s+balance\\s+is\\s+ETB\\s?(?<balanceAfter>[\\d,]+\\.\\d+)\\..*?(?<reference>https:\\/\\/\\S+)",
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
          "Dear\\s+(?<sender>.+?)\\s+you\\s+have\\s+transferred\\s+ETB\\s+(?<amount>[\\d,]+.\\d+)\\s+to\\s+(?<recipientName>.+?)\\s+\\((?<recipientPhone>[\\d,]+\\*{1,}\\d+)\\)\\s+on\\s+(?<date>\\d{2}\\/\\d{2}\\/\\d{4})\\s+(?<time>\\d{2}:\\d{2}:\\d{2}).\\s+Your\\s+transaction\\s+number\\s+is\\s+(?<tnxID>[a-zA-Z0-9]+).\\s+The\\s+service\\s+fee\\s+is\\s+ETB\\s+(?<serviceCharge>[\\d,]+.\\d+).+service\\s+fee\\s+is\\s+ETB\\s+(?<vat>[\\d,]+.\\d+)\\..+account\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+.\\d+)\\..+this\\s+link:\\s+(?<reference>https:\\/\\/\\S+)\\.",
      },
      {
        label: "Airtime top-up",
        regex:
          "Dear\\s+(?<senderName>.+?)\\s+you have\\s+recharged\\s+ETB\\s+(?<amount>[\\d,]+.\\d+)\\s+airtime\\s+for\\s+\\d+\\s+on\\s+(?<date>\\d{2}\\/\\d{2}\\/\\d{4})\\s+(?<time>\\d{2}:\\d{2}:\\d{2}).\\s+your\\s+transaction\\s+number\\s+is\\s+(?<tnxID>[a-zA-Z0-9]+).\\s+your\\s+current\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+\\.\\d+).\\s+to\\s+download\\s+your\\s+payment\\s+information\\s+please\\s+click\\s+this\\s+link:\\s+(?<reference>https:\\/\\/\\S+)",
      },
      {
        label: "Incoming transfer from Telebirr account",
        regex:
          "Dear\\s+(?<recipientName>.+?)\\s+you have\\s+received\\s+ETB\\s+(?<amount>[\\d,]+.\\d+)\\s+from\\s+(?<senderName>.+?)\\((?<senderPhone>[\\d,]+\\*{1,}\\d+)\\)\\s+on\\s+(?<date>\\d{2}\\/\\d{2}\\/\\d{4})\\s+(?<time>\\d{2}:\\d{2}:\\d{2}).\\s+Your\\s+transaction\\s+number\\s+is\\s+(?<tnxID>[a-zA-Z0-9]+)..+account\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+.\\d+)",
      },
      {
        label: "Package purchase",
        regex:
          "Dear\\s+(?<senderName>.+?)\\s+you\\s+have\\s+paid\\s+ETB\\s+(?<amount>[\\d,]+.\\d+).+made\\s+for\\s+(?<recipientPhone>\\d+)\\s+on\\s+(?<date>\\d{2}\\/\\d{2}\\/\\d{4})\\s+(?<time>\\d{2}:\\d{2}:\\d{2}).\\s+Your\\s+transaction\\s+number\\s+is\\s+(?<tnxID>[a-zA-Z0-9]+).\\s+your\\s+current\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+\\.\\d+).\\s?to\\s+download\\s+your\\s+payment\\s+information\\s+please\\s+click\\s+this\\s+link:\\s+(?<reference>https:\\/\\/\\S+)",
      },
      {
        label: "Bill payment",
        regex:
          "Dear\\s+(?<senderName>.+?)\\s+you\\s+have\\s+paid\\s+ETB\\s+(?<amount>[\\d,]+.\\d+).+?on\\s+(?<date>\\d{2}\\/\\d{2}\\/\\d{4})\\s+(?<time>\\d{2}:\\d{2}:\\d{2}).\\s+Your\\s+transaction\\s+number\\s+is\\s+(?<tnxID>[a-zA-Z0-9]+).\\s+your\\s+telebirr\\s+account\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+\\.\\d+).\\s?to\\s+download\\s+your\\s+payment\\s+information\\s+please\\s+click\\s+this\\s+link:\\s+(?<reference>https:\\/\\/\\S+)",
      },
    ],
  },
  {
    bank: {
      name: "Dashen Bank",
      shortCodes: ["DashenBank"],
    },
    patterns: [
      {
        label: "Other bank transfer",
        regex:
          "your\\s+account\\s+\\'(?<senderAccount>\\d+\\*{1,}\\d+)\\'\\s+is\\s+debited\\s+with\\s+ETB\\s+(?<amount>[\\d,]+\\.\\d+)\\s+on\\s+(?<date>\\d{2}\\/\\d{2}\\/\\d{4})\\s+at\\s+(?<time>\\d{2}:\\d{2}:\\d{2}\\s(?:AM|PM)).\\s+your\\s+current\\s+balance\\s+is\\s+ETB\\s+(?<balanceAfter>[\\d,]+\\.\\d+)",
      },
    ],
  },
];
