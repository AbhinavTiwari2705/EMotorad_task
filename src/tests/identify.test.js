import request from 'supertest';
import app from '../index.js';
import { setupDatabase,teardownDatabase  } from '../database.js';

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

describe('POST /identify', () => {
  let createdContactIds = [];

  test('should create new primary contact when no matches exist', async () => {
    const response = await request(app)
      .post('/identify')
      .send({
        email: 'doc1@example.com',
        phoneNumber: '+1234567890'
      });

    expect([200, 201]).toContain(response.status);  
    expect(response.body.contact).toHaveProperty('primaryContactId');
    expect(response.body.contact.emails).toContain('doc1@example.com');
    expect(response.body.contact.phoneNumbers).toContain('+1234567890');
    expect(response.body.contact.secondaryContactIds).toHaveLength(0);

    createdContactIds.push(response.body.contact.primaryContactId);
  });

  test('should link new contact as secondary when email matches', async () => {
    const primaryResponse = await request(app)
      .post('/identify')
      .send({
        email: 'doc2@example.com',
        phoneNumber: '+1234567891'
      });

    expect([200, 201]).toContain(primaryResponse.status);  
    const primaryContactId = primaryResponse.body.contact.primaryContactId;
    createdContactIds.push(primaryContactId);

    const secondaryResponse = await request(app)
      .post('/identify')
      .send({
        email: 'doc2@example.com',
        phoneNumber: '+1234567892'
      });

    expect([200, 201]).toContain(secondaryResponse.status);  
    expect(secondaryResponse.body.contact.phoneNumbers.length).toBeGreaterThan(0);
    expect(secondaryResponse.body.contact.secondaryContactIds.length).toBeGreaterThan(0);

    createdContactIds.push(...secondaryResponse.body.contact.secondaryContactIds);
  });

  test('should return 400 when no contact information provided', async () => {
    const response = await request(app)
      .post('/identify')
      .send({});

    expect(response.status).toBe(400);
  });

  afterEach(async () => {
    for (const contactId of createdContactIds) {
      await request(app).delete(`/contacts/${contactId}`);
    }
    createdContactIds = [];
  });
});
