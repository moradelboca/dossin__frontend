import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";
import dayjs from "dayjs";

export default function Reloj() {
  return (
    <>
      <p>asda</p>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticTimePicker defaultValue={dayjs()} />
      </LocalizationProvider>
    </>
  );
}
