
import Contact from "../models/contactModel.js";



//create contact
export const createContact = async (req, res) => {
        const { firstName, lastName, email, contactNumber, subject, reason } = req.body;
    
        try {
            const newContact = new Contact({
                firstName,
                lastName,
                email,
                contactNumber,
                subject,
                reason,
            });
    
            await newContact.save();
    
            res.status(201).json({ message: "Contact created successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error creating contact", error: error.message });
        }
    };


    //get all contacts
    export const getContacts = async (req, res) => {
        try {
            const contacts = await Contact.find();
    
            res.status(200).json(contacts);
        } catch (error) {
            res.status(500).json({ message: "Error getting contacts", error: error.message });
        }
    };



    //delete contact
    export const deleteContact = async (req, res) => {
        const { contactId } = req.params;
    
        try {
            const deletedContact = await Contact.findByIdAndDelete(contactId);
    
            if (!deletedContact) {
                return res.status(404).json({ message: "Contact not found" });
            }
    
            res.status(200).json({ message: "Contact deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting contact", error: error.message });
        }
    }