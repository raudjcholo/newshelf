import { getTableConfig } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';

import {
  inboundAddresses,
  issueStates,
  issues,
  newsletters,
  rawEmails,
  rawEmailStatuses,
} from '.';

const newshelfTables = [
  inboundAddresses,
  rawEmails,
  newsletters,
  issues,
  issueStates,
];

describe('Newshelf database schema', () => {
  it('enables row-level security on every user-owned table', () => {
    for (const table of newshelfTables) {
      expect(getTableConfig(table).enableRLS).toBe(true);
    }
  });

  it('uses the documented raw email statuses', () => {
    expect(rawEmailStatuses).toEqual([
      'received',
      'queued',
      'processing',
      'processed',
      'failed',
    ]);
  });

  it('defines composite ownership foreign keys', () => {
    const ownershipForeignKeys = [rawEmails, issues, issueStates]
      .flatMap((table) => getTableConfig(table).foreignKeys)
      .filter((foreignKey) => foreignKey.reference().columns.length === 2);

    expect(
      ownershipForeignKeys.map((foreignKey) => foreignKey.getName()),
    ).toEqual(
      expect.arrayContaining([
        'raw_emails_user_inbound_address_fk',
        'issues_user_newsletter_fk',
        'issues_user_raw_email_fk',
        'issue_states_user_issue_fk',
      ]),
    );

    for (const foreignKey of ownershipForeignKeys) {
      expect(foreignKey.onDelete).toBe('cascade');
    }
  });
});
