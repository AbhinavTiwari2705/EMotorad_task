import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

// Initialize the Neon client with the database URL from environment variables
const sql = neon(process.env.NEON_DATABASE_URL);

/**
 * Sets up the database by creating the 'contacts' table and necessary indexes.
 */
export async function setupDatabase() {
  // Create 'contacts' table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      phoneNumber TEXT,
      email TEXT,
      linkedId INTEGER,
      linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')) NOT NULL,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deletedAt TIMESTAMP WITH TIME ZONE,
      FOREIGN KEY (linkedId) REFERENCES contacts(id)
    )
  `;

  // Create index on 'email' column
  await sql`
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
  `;

  // Create index on 'phoneNumber' column
  await sql`
    CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phoneNumber);
  `;

  // Create index on 'linkedId' column
  await sql`
    CREATE INDEX IF NOT EXISTS idx_contacts_linked ON contacts(linkedId);
  `;
}

/**
 * Finds contacts by email or phone number.
 * @param {string} email - The email to search for.
 * @param {string} phoneNumber - The phone number to search for.
 * @returns {Promise<Array>} - A promise that resolves to an array of contacts.
 */
export async function findContactsByEmailOrPhone(email, phoneNumber) {
  return await sql`
    SELECT * FROM contacts 
    WHERE (email = ${email} OR phoneNumber = ${phoneNumber}) 
    AND deletedAt IS NULL
    ORDER BY createdAt ASC
  `;
}

/**
 * Creates a new contact.
 * @param {Object} contact - The contact object containing phoneNumber, email, linkedId, and linkPrecedence.
 * @returns {Promise<number>} - A promise that resolves to the ID of the created contact.
 */
export async function createContact(contact) {
  const result = await sql`
    INSERT INTO contacts (
      phoneNumber, 
      email, 
      linkedId, 
      linkPrecedence
    ) VALUES (
      ${contact.phoneNumber},
      ${contact.email},
      ${contact.linkedId},
      ${contact.linkPrecedence}
    )
    RETURNING id
  `;
  return result[0].id;
}

/**
 * Updates the linkedId and linkPrecedence of multiple contacts.
 * @param {Array<number>} contactIds - An array of contact IDs to update.
 * @param {number} primaryId - The primary contact ID to link to.
 */
export async function updateContactsLinkedId(contactIds, primaryId) {
  await sql`
    UPDATE contacts 
    SET 
      linkedId = ${primaryId}, 
      linkPrecedence = 'secondary',
      updatedAt = CURRENT_TIMESTAMP
    WHERE id IN (${sql.join(contactIds, ', ')})
  `;
}

/**
 * Retrieves contacts linked to a primary contact.
 * @param {number} primaryId - The primary contact ID.
 * @returns {Promise<Array>} - A promise that resolves to an array of linked contacts.
 */
export async function getLinkedContacts(primaryId) {
  return await sql`
    SELECT * FROM contacts 
    WHERE (id = ${primaryId} OR linkedId = ${primaryId})
    AND deletedAt IS NULL
    ORDER BY createdAt ASC
  `;
}

export async function teardownDatabase() {
  await sql`TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;`;
}

export default sql;
