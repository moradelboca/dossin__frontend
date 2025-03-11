import { DateCalendar, LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

interface DateSelectorProps {
  selectedDates: Dayjs[];
  onDateChange: (date: Dayjs | null) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDates, onDateChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={null}
        onChange={onDateChange}
        slots={{
          day: (dayProps) => (
            <PickersDay
              {...dayProps}
              selected={selectedDates.some((date) =>
                date.isSame(dayProps.day, "day")
              )}
            />
          ),
        }}
      />
    </LocalizationProvider>
  );
};

export default DateSelector;