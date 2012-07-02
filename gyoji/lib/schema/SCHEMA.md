Tuppari Schema
==============

Relations
---------

- Account has applications.
- Application has id, label and keys (apiKey and apiSecret) sets.
- Application has messages

Details
-------

### Account

    {
      id: String, // Hash key
      created_at: Date,
      updated_at: Date,
      deleted_at: Date,
      memo: String
    }

### Application

    {
      account_id: String, // Hash key
      app_id: String,     // Range key
      label: String,
      description: String,
      created_at: Date,
      updated_at: Date
    }

### Message

    {
      app_id: String,      // Hash key
      channel: String      // Range key,
      body,
      created_at: Date
    }
