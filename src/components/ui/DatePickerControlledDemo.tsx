import { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";

import { DatePicker } from "./date-picker";

const now = today(getLocalTimeZone());

export const DatePickerControlledDemo = () => {
    const [value, setValue] = useState<DateValue | null>(now);

    return <DatePicker aria-label="Date picker" value={value} onChange={setValue} />;
};
