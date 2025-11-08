import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import dayjs from "dayjs";

export default function Calendar({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: Date | null;
  setSelectedDate: Dispatch<SetStateAction<Date | null>>;
}) {
  const calendarRef = useRef<CallyCalendarElement>(null);

  useEffect(() => {
    const calendarEl = calendarRef.current;

    const handleChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newDate = customEvent.detail?.value;

      if (newDate) {
        console.log("New date selected:", newDate);
        setSelectedDate(newDate);
      }
    };

    if (calendarEl) {
      calendarEl.addEventListener("change", handleChange);
    }

    return () => {
      if (calendarEl) {
        calendarEl.removeEventListener("change", handleChange);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center">
      <calendar-date
        // 6. Attach the ref to the element
        ref={calendarRef}
        class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
      >
        <svg
          aria-label="Previous"
          className="fill-current size-4"
          slot="previous"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
        </svg>
        <svg
          aria-label="Next"
          className="fill-current size-4"
          slot="next"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
        </svg>
        <calendar-month></calendar-month>
      </calendar-date>

      <p className="p-2 bg-base-200 rounded-md">
        Selected Date:
        <strong className="ml-2">
          {selectedDate ? dayjs(selectedDate).format("MMMM DD, YYYY") : "None"}
        </strong>
      </p>
    </div>
  );
}
