# Identity Reconciliation Service

This service helps identify and link customer contacts across multiple purchases, even when different contact information is used.

## Features

- Creates and manages customer identity records
- Links related contact information
- Maintains primary and secondary contact relationships
- Provides consolidated contact information

## API Endpoints

### POST /identify

Processes contact information and returns consolidated contact details.

**Request Body:**
```json
{
  "email": "string",
  "phoneNumber": "string"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": number,
    "emails": string[],
    "phoneNumbers": string[],
    "secondaryContactIds": number[]
  }
}
```

## Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Technical Details

- Built with Node.js and Express
- Uses SQLite for data storage
- Includes comprehensive test suite
- Implements efficient contact linking algorithm

## Database Schema

```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phoneNumber TEXT,
  email TEXT,
  linkedId INTEGER,
  linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  FOREIGN KEY (linkedId) REFERENCES contacts(id)
);
```