import React, { useState, useEffect } from "react";
import { api } from "./services/api";
import Calendar from "./components/Calendar";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Select, MenuItem, InputLabel, FormControl, FormHelperText } from "@material-ui/core";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, eventTypeFilter, startDateFilter, endDateFilter, events]);

  const fetchEvents = async () => {
    const response = await api.getEvents();
    setEvents(response.data);
  };

  const handleInputChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(newEvent);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formattedStart = formatDate(newEvent.start);
    const formattedEnd = formatDate(newEvent.end);
    const eventToSubmit = { ...newEvent, start: formattedStart, end: formattedEnd };

    if (editMode) {
      await api.updateEvent(editingEventId, eventToSubmit);
    } else {
      await api.createEvent(eventToSubmit);
    }

    setNewEvent({
      title: "",
      start: "",
      end: "",
      description: "",
      imageUrl: "",
      videoUrl: "",
    });
    setIsDialogOpen(false);
    setEditMode(false);
    setEditingEventId(null);
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await api.deleteEvent(id);
    fetchEvents();
  };

  const handleEdit = (event) => {
    setEditMode(true);
    setEditingEventId(event.id);
    setNewEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.description,
      imageUrl: event.imageUrl,
      videoUrl: event.videoUrl,
    });
    setIsDialogOpen(true);
  };

  const handleDateClick = (date) => {
    const formattedDate = formatDate(date);
    setNewEvent({
      ...newEvent,
      start: formattedDate,
      end: formattedDate,
    });
    setIsDialogOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEventTypeFilterChange = (e) => {
    setEventTypeFilter(e.target.value);
  };

  const handleStartDateFilterChange = (e) => {
    setStartDateFilter(e.target.value);
  };

  const handleEndDateFilterChange = (e) => {
    setEndDateFilter(e.target.value);
  };

  const applyFilters = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (eventTypeFilter) {
      filtered = filtered.filter(event => {
        if (eventTypeFilter === "image") {
          return event.imageUrl;
        } else if (eventTypeFilter === "video") {
          return event.videoUrl;
        } else if (eventTypeFilter === "text") {
          return !event.imageUrl && !event.videoUrl;
        }
        return true;
      });
    }

    if (startDateFilter) {
      filtered = filtered.filter(event => new Date(event.start) >= new Date(startDateFilter));
    }

    if (endDateFilter) {
      filtered = filtered.filter(event => new Date(event.end) <= new Date(endDateFilter));
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateForm = (formData) => {
    const errors = {};

    if (!formData.title) {
      errors.title = "Event title is required";
    }

    if (!formData.start || !formData.end) {
      errors.dates = "Start and End dates are required";
    } else if (new Date(formData.start) >= new Date(formData.end)) {
      errors.dates = "End date must be after Start date";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.imageUrl = "Invalid image URL format";
    }

    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      errors.videoUrl = "Invalid video URL format";
    }

    return errors;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="App">
      <h1>Calendar App</h1>
      
      <div className="filters">
        <TextField
          label="Search Events"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        
        <FormControl>
          <InputLabel>Event Type</InputLabel>
          <Select
            value={eventTypeFilter}
            onChange={handleEventTypeFilterChange}
            label="Event Type"
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="image">Image</MenuItem>
            <MenuItem value="video">Video</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Start Date"
          type="date"
          value={startDateFilter}
          onChange={handleStartDateFilterChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <TextField
          label="End Date"
          type="date"
          value={endDateFilter}
          onChange={handleEndDateFilterChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>

      <Calendar events={filteredEvents} onDateClick={handleDateClick} />
      
      <Dialog open={isDialogOpen} onClose={() => {
        setIsDialogOpen(false);
        setEditMode(false);
        setEditingEventId(null);
      }}>
        <DialogTitle>{editMode ? "Edit Event" : "Add New Event"}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              name="title"
              label="Event Title"
              value={newEvent.title}
              onChange={handleInputChange}
              fullWidth
              required
              error={Boolean(formErrors.title)}
              helperText={formErrors.title}
            />
            <TextField
              name="start"
              label="Start Time"
              type="datetime-local"
              value={newEvent.start}
              onChange={handleInputChange}
              fullWidth
              required
              error={Boolean(formErrors.dates)}
              helperText={formErrors.dates}
            />
            <TextField
              name="end"
              label="End Time"
              type="datetime-local"
              value={newEvent.end}
              onChange={handleInputChange}
              fullWidth
              required
              error={Boolean(formErrors.dates)}
              helperText={formErrors.dates}
            />
            <TextField
              name="description"
              label="Event Description"
              value={newEvent.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              name="imageUrl"
              label="Image URL"
              value={newEvent.imageUrl}
              onChange={handleInputChange}
              fullWidth
              error={Boolean(formErrors.imageUrl)}
              helperText={formErrors.imageUrl}
            />
            <TextField
              name="videoUrl"
              label="Video URL"
              value={newEvent.videoUrl}
              onChange={handleInputChange}
              fullWidth
              error={Boolean(formErrors.videoUrl)}
              helperText={formErrors.videoUrl}
            />
            <Button type="submit" color="primary">
              {editMode ? "Update" : "Add"} Event
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="event-list">
        {filteredEvents.map((event) => (
          <div key={event.id} className="event-item">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <Button onClick={() => handleEdit(event)}>Edit</Button>
            <Button onClick={() => handleDelete(event.id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
