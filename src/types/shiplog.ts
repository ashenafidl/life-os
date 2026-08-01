import { taskStatusEnum } from "@/db/schema/shiplog";

export type TaskStatusFilter =
  | "all"
  | (typeof taskStatusEnum.enumValues)[number];
