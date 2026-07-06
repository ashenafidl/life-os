import { Calendar } from "@/components/ui/calendar";

export default async function HeatmapChart() {
  return (
    <div>
      <Calendar
        numberOfMonths={12}
        defaultMonth={new Date(new Date().setMonth(new Date().getMonth() - 11))}
        className="items-center justify-center"
        classNames={{
          nav: "hidden",
          caption_label: "font-normal",
          month: "!ml-0",
          day: "w-[var(--box-size)] h-[var(--box-size)] m-[var(--box-margin)] bg-gray-100 border rounded-sm text-xs text-transparent",
        }}
        components={{}}
      />
    </div>
  );
}
