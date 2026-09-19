const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testReminderSystem() {
  try {
    console.log('=== TESTING REMINDER SYSTEM ===\n');

    // Get a booking to test with
    const booking = await pool.query('SELECT id, booking_number, event_date FROM bookings LIMIT 1');
    
    if (booking.rows.length === 0) {
      console.log('No bookings found to test with');
      return;
    }

    const testBooking = booking.rows[0];
    console.log('Testing with booking:', testBooking.booking_number, 'ID:', testBooking.id);

    if (!testBooking.event_date) {
      console.log('Setting a test event date for the booking');
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 30); // 30 days from now
      await pool.query('UPDATE bookings SET event_date = $1 WHERE id = $2', [testDate.toISOString().split('T')[0], testBooking.id]);
    }

    // Get updated booking with event date
    const updatedBooking = await pool.query('SELECT id, booking_number, event_date, workspace_id FROM bookings WHERE id = $1', [testBooking.id]);
    const bookingData = updatedBooking.rows[0];
    console.log('Event date:', bookingData.event_date);

    // Check if reminders already exist
    const existingReminders = await pool.query('SELECT COUNT(*) as count FROM reminders WHERE booking_id = $1', [bookingData.id]);
    console.log('Existing reminders:', existingReminders.rows[0].count);

    // Test the reminder generation by calling the function directly
    console.log('\nSimulating reminder generation...');
    
    const reminderDays = [1, 3, 7, 15, 30, 60];
    let createdCount = 0;

    for (const daysBefore of reminderDays) {
      const scheduledDate = new Date(bookingData.event_date);
      scheduledDate.setDate(scheduledDate.getDate() - daysBefore);

      const existingCheck = await pool.query(
        `SELECT id FROM reminders WHERE booking_id = $1 AND reminder_type = 'client_reminder' AND days_before_event = $2`,
        [bookingData.id, daysBefore]
      );

      if (existingCheck.rows.length === 0) {
        const reminderResult = await pool.query(
          `INSERT INTO reminders (workspace_id, booking_id, reminder_type, days_before_event, scheduled_date, recipient_email, subject, message_content, status)
           VALUES ($1, $2, 'client_reminder', $3, $4, 'test@example.com', $5, $6, 'pending')
           RETURNING id`,
          [
            bookingData.workspace_id,
            bookingData.id,
            daysBefore,
            scheduledDate.toISOString().split('T')[0],
            `Test Reminder - ${daysBefore} Days Before Event`,
            `This is a test reminder for booking ${bookingData.booking_number}.`
          ]
        );
        createdCount++;
        console.log(`Created reminder: ${daysBefore} days before event (${scheduledDate.toISOString().split('T')[0]})`);
      }
    }

    // Add crew reminder
    const crewReminderDate = new Date(bookingData.event_date);
    crewReminderDate.setDate(crewReminderDate.getDate() - 3);

    const existingCrewCheck = await pool.query(
      `SELECT id FROM reminders WHERE booking_id = $1 AND reminder_type = 'crew_details_customer' AND days_before_event = 3`,
      [bookingData.id]
    );

    if (existingCrewCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO reminders (workspace_id, booking_id, reminder_type, days_before_event, scheduled_date, recipient_email, subject, message_content, status)
         VALUES ($1, $2, 'crew_details_customer', 3, $3, 'test@example.com', $4, $5, 'pending')
         RETURNING id`,
        [
          bookingData.workspace_id,
          bookingData.id,
          crewReminderDate.toISOString().split('T')[0],
          'Crew Details Reminder - 3 Days Before Event',
          'This is a test crew reminder.'
        ]
      );
      createdCount++;
      console.log('Created crew reminder: 3 days before event');
    }

    // Verify created reminders
    const finalReminders = await pool.query('SELECT * FROM reminders WHERE booking_id = $1 ORDER BY scheduled_date', [bookingData.id]);
    console.log(`\nTotal reminders for booking: ${finalReminders.rows.length}`);
    finalReminders.rows.forEach(r => {
      console.log(`- ${r.reminder_type}: ${r.days_before_event} days before (${r.scheduled_date}) - ${r.status}`);
    });

    console.log('\n=== TEST COMPLETE ===');
    console.log(`Successfully created ${createdCount} new reminders`);

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await pool.end();
  }
}

testReminderSystem();
