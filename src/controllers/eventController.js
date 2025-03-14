import Event from "../models/eventModel.js";

//Create a new event
export const createEvent = async (req, res) => {
  try {
    const { organizerid, title, description, popularity, event_type, ticket_price, quantity, location, date,status  } = req.body;


    // Create a new event
    const newEvent = await Event.create({
      organizerid,
      title,
      description,
      popularity,
      event_type,
      ticket_price,
      quantity,
      location,
      date,
      image: req.file ? req.file.path : null,
      status

    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};
// export const createEvent = async (req, res) => {
//   try {
//     const { organizerid, title, description, popularity, event_type, ticket_price, quantity, location, date, status } = req.body;

//     if (!title || !description || !date || !location || !event_type || !ticket_price || !quantity) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const newEvent = await Event.create({
//       organizerid,
//       title,
//       description,
//       popularity,
//       event_type,
//       ticket_price,
//       quantity,
//       location,
//       date,
//       image: req.file ? req.file.path : null,
//       status,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Event created successfully",
//       data: newEvent,
//     });
//   } catch (error) {
//     console.error("Error creating event:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating event",
//       error: error.message,
//     });
//   }
// };

// Get all events
export const getEvents = async (req, res,) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};



//get organier id of event
export const getEventsByOrganizerid = async (req, res) => {
  
  const organizerid = req.params.organizerid;
  try {
    const events = await Event.find({ organizerid:organizerid });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};





// Get a single event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};


// Update an event
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Update fields if provided in the request
    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.popularity = req.body.popularity || event.popularity;
    event.event_type = req.body.event_type || event.event_type;
    event.ticket_price = req.body.ticket_price || event.ticket_price;
    event.quantity = req.body.quantity || event.quantity;
    event.location = req.body.location || event.location;
    event.date = req.body.date || event.date;
    event.image = req.file ? req.file.path : event.image; 
    event.status = req.body.status || event.status;

    if (req.body.password) {
      event.password = req.body.password;
    }

    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedEvent._id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        popularity: updatedEvent.popularity,
        event_type: updatedEvent.event_type,
        ticket_price: updatedEvent.ticket_price,
        quantity: updatedEvent.quantity,
        location: updatedEvent.location,
        events: updatedEvent.events,
        image: updatedEvent.image,
        status: updatedEvent.status,
      },
      message: "Event updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};