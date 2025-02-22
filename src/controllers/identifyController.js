import {
  findContactsByEmailOrPhone,
  createContact,
  updateContactsLinkedId,
  getLinkedContacts
} from '../database.js';

export const identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // Input validation
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: 'At least one contact method (email or phoneNumber) is required'
      });
    }

    // Find existing contacts by email or phone number
    const existingContacts = await findContactsByEmailOrPhone(email, phoneNumber);

    // If no existing contacts are found, create a new primary contact
    if (existingContacts.length === 0) {
      const newContactId = await createContact({
        email,
        phoneNumber,
        linkedId: null,
        linkPrecedence: 'primary'
      });

      return res.status(201).json({
        contact: {
          primaryContactId: newContactId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      });
    }

    // Determine the primary contact
    let primaryContact = existingContacts.find(c => c.linkPrecedence === 'primary') || existingContacts[0];

    // Retrieve all linked contacts
    const allLinkedContacts = await getLinkedContacts(primaryContact.id);

    // Check for overlapping contacts with the same email or phone number
    const overlappingContacts = existingContacts.filter(c =>
      (email && c.email === email) || (phoneNumber && c.phoneNumber === phoneNumber)
    );

    // Determine the oldest primary contact among overlapping contacts
    const oldestPrimaryContact = overlappingContacts
      .filter(c => c.linkPrecedence === 'primary')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

    // If the current primary contact is not the oldest, update its precedence
    if (oldestPrimaryContact && primaryContact.id !== oldestPrimaryContact.id) {
      await updateContact(primaryContact.id, {
        linkedId: oldestPrimaryContact.id,
        linkPrecedence: 'secondary'
      });
      primaryContact = oldestPrimaryContact;
    }

    // Add new contact information if it doesn't exist
    const existingEmails = new Set(allLinkedContacts.map(c => c.email).filter(Boolean));
    const existingPhones = new Set(allLinkedContacts.map(c => c.phoneNumber).filter(Boolean));

    if ((email && !existingEmails.has(email)) || (phoneNumber && !existingPhones.has(phoneNumber))) {
      const newContact = await createContact({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary'
      });

      // Add the new contact to the linked contacts list
      allLinkedContacts.push({
        id: newContact.id,
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary'
      });
    }

    // Prepare the response payload
    const uniqueEmails = [...new Set(allLinkedContacts.map(c => c.email).filter(Boolean))];
    const uniquePhones = [...new Set(allLinkedContacts.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryContactIds = allLinkedContacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c.id);

    res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: uniqueEmails,
        phoneNumbers: uniquePhones,
        secondaryContactIds
      }
    });
  } catch (error) {
    console.error('Error in identifyContact:', error);
    res.status(500).json({
      error: 'An unexpected error occurred while processing the request'
    });
  }
};
