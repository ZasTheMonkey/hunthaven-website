import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const bookingActionsSource = await readFile(
  new URL('../../../outfitter-booking-actions.js', import.meta.url),
  'utf8',
);

test('outfitter trip message keeps the draft and recovers after session expiry', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.setContent('<main><h1>Messaging recovery harness</h1></main>');
  await page.addScriptTag({ content: bookingActionsSource });
  await page.evaluate(() => {
    window.__qaAuthUser = null;
    window.__qaInsertedMessages = [];
    const messageBuilder = {
      select() { return this; },
      eq() { return this; },
      order() { return this; },
      limit() { return Promise.resolve({ data: [], error: null }); },
      insert(payload) {
        window.__qaInsertedMessages.push(payload);
        return Promise.resolve({ data: [payload], error: null });
      },
    };
    window.__qaDb = {
      auth: {
        getUser() {
          return Promise.resolve({ data: { user: window.__qaAuthUser }, error: null });
        },
      },
      from(table) {
        if (table !== 'outfitter_booking_messages') throw new Error('Unexpected table: ' + table);
        return messageBuilder;
      },
      channel() {
        return {
          on() { return this; },
          subscribe() { return this; },
        };
      },
      removeChannel() {
        return Promise.resolve();
      },
    };
    window.leasewildOutfitterBookingActions(window.__qaDb, 'qa-booking-id', 'message', false);
  });

  const dialog = page.getByRole('dialog', { name: 'Outfitter messages' });
  const draft = dialog.getByPlaceholder('Write a message about this booking');
  const send = dialog.getByRole('button', { name: 'Send message' });
  const status = dialog.getByRole('status');

  await draft.fill('Please confirm the meeting location.');
  await send.click();
  await expect(status).toHaveText('Sign in again to send this message.');
  await expect(send).toBeEnabled();
  await expect(draft).toHaveValue('Please confirm the meeting location.');
  expect(await page.evaluate(() => window.__qaInsertedMessages.length)).toBe(0);

  await page.evaluate(() => {
    window.__qaAuthUser = { id: '00000000-0000-4000-8000-000000000001' };
  });
  await send.click();
  await expect(status).toHaveText('Message sent.');
  await expect(send).toBeEnabled();
  await expect(draft).toHaveValue('');
  expect(await page.evaluate(() => window.__qaInsertedMessages)).toEqual([
    {
      booking_id: 'qa-booking-id',
      sender_id: '00000000-0000-4000-8000-000000000001',
      body: 'Please confirm the meeting location.',
    },
  ]);
  expect(pageErrors).toEqual([]);

  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toHaveCount(0);
});
