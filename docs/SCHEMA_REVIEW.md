# Skyflow Vault Schema Review

## Issue Identified

The current implementation is trying to store text data in **reference fields** (`identifiers_skyflow_id` and `contacts_skyflow_id`), which are designed to store Skyflow IDs that reference other tables, not text data.

### Problem Fields:
- `identifiers_skyflow_id`: Type `SkyflowID` - Reference to `identifiers` table
- `contacts_skyflow_id`: Type `SkyflowID[]` - Array of references to `contacts` table

These fields **cannot tokenize text** because they expect Skyflow IDs, not text values.

## Schema Structure

The `persons` table has:
1. **Direct fields**: `date_of_birth`, `nationality`, `gender`, `race`, `ethnicity`, etc.
2. **Reference fields**: `identifiers_skyflow_id`, `contacts_skyflow_id` (foreign keys)
3. **Embedded schemas**: `name`, `addresses`, `phone_numbers`, `emails` (contain text fields)

## Recommended Solution

Since we're repurposing this schema for moments data, we have two options:

### Option 1: Use Embedded Schema Fields (Recommended)
Use fields from embedded schemas that can store text:
- `name.first_name` - Can store moment text (has name validation, but may work)
- `addresses.line_1` - Can store location/text
- `emails.value` - Can store text (has email validation)

### Option 2: Create Records in Referenced Tables First
1. Create a record in `identifiers` table with the moment text
2. Create records in `contacts` table for location/emotion/tags
3. Reference those IDs in `identifiers_skyflow_id` and `contacts_skyflow_id`

### Option 3: Use Available Direct Fields
Repurpose other direct fields that accept strings:
- Store text in fields that don't have strict validation
- Note: This is a workaround and not ideal

## Current Workaround Status

The code currently tries to store text directly in reference fields, which will:
- ✅ Work for insertion (Skyflow may accept it)
- ❌ **NOT tokenize** the text (reference fields don't tokenize)
- ❌ Return tokens as `undefined` or empty

## Next Steps

1. **Immediate Fix**: Use embedded schema fields that can tokenize text
2. **Long-term**: Consider creating a custom schema for moments data, or properly use the referenced tables

