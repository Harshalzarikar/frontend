import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { Grid, Paper, Typography } from '@material-ui/core';
const Calendar = ({ events, onDateClick }) => {
const renderHeader = () => {
const dateFormat = "MMMM yyyy";
return (
<div className="header row flex-middle">
<Typography variant="h4">
{format(new Date(), dateFormat)}
</Typography>
</div>
);
};
const renderDays = () => {
const dateFormat = "EEEE";
const days = [];
let startDate = startOfWeek(new Date());
for (let i = 0; i < 7; i++) {
days.push(
<Grid item key={i} xs>
<Typography variant="subtitle1">
{format(addDays(startDate, i), dateFormat)}
</Typography>
</Grid>
);
}
return <Grid container>{days}</Grid>;
};
const renderCells = () => {
const monthStart = startOfMonth(new Date());
const monthEnd = endOfMonth(monthStart);
const startDate = startOfWeek(monthStart);
const endDate = endOfWeek(monthEnd);
const dateFormat = "d";
const rows = [];
let days = [];
let day = startDate;
let formattedDate = "";
while (day <= endDate) {
for (let i = 0; i < 7; i++) {
formattedDate = format(day, dateFormat);
const cloneDay = day;
days.push(
<Grid item key={day} xs>
<Paper onClick={() => onDateClick(cloneDay)}>
<Typography>{formattedDate}</Typography>
{events
.filter(event => format(new Date(event.start), 'yyyy-MM-dd') === format(cloneDay, 'yyyy-MM-dd'))
.map(event => (
<div key={event.id}>{event.title}</div>
))
}
</Paper>
</Grid>
);
day = addDays(day, 1);
}
rows.push(
<Grid container key={day}>
{days}
</Grid>
);
days = [];
}
return <div className="body">{rows}</div>;
};
return (
<div className="calendar">
{renderHeader()}
{renderDays()}
{renderCells()}
</div>
);
};
export default Calendar;