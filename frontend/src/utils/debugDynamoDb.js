// src/utils/debugDynamoDb.js
/**
 * Debugging utilities for DynamoDB data structures
 * Use these functions to help verify your DynamoDB data structure implementation
 */

// Output colored console logging for DynamoDB entities
export function logDynamoEntity(entity, entityType = 'Item') {
  if (!entity) {
    console.log('%c⚠️ Null or undefined entity provided', 'color: orange; font-weight: bold');
    return;
  }
  
  console.group(`%c🔍 DynamoDB ${entityType} Structure`, 'color: #4287f5; font-weight: bold');
  
  // Log keys section
  console.group('%c🔑 Keys', 'color: #42adf5; font-weight: bold');
  console.log('PK:', entity.PK || 'Missing');
  console.log('SK:', entity.SK || 'Missing');
  if (entity.GSI1PK) console.log('GSI1PK:', entity.GSI1PK);
  if (entity.GSI1SK) console.log('GSI1SK:', entity.GSI1SK);
  if (entity.GSI2PK) console.log('GSI2PK:', entity.GSI2PK);
  if (entity.GSI2SK) console.log('GSI2SK:', entity.GSI2SK);
  console.groupEnd();
  
  // Log metadata
  console.group('%c📋 Metadata', 'color: #42f5ad; font-weight: bold');
  console.log('id:', entity.id || 'Missing');
  console.log('type:', entity.type || 'Missing');
  if (entity.createdAt) console.log('createdAt:', entity.createdAt);
  if (entity.updatedAt) console.log('updatedAt:', entity.updatedAt);
  console.groupEnd();
  
  // Log entity-specific attributes
  console.group('%c📝 Attributes', 'color: #f542a7; font-weight: bold');
  const skipFields = ['PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK', 'id', 'type', 'createdAt', 'updatedAt'];
  for (const [key, value] of Object.entries(entity)) {
    if (!skipFields.includes(key)) {
      console.log(`${key}:`, value);
    }
  }
  console.groupEnd();
  
  console.groupEnd();
}

// Verify if an object follows the expected DynamoDB structure
export function verifyDynamoStructure(entity, entityType = 'PATIENT') {
  if (!entity) {
    console.error('❌ Null or undefined entity provided');
    return false;
  }
  
  let isValid = true;
  const errors = [];
  
  // Required fields for all entities
  if (!entity.PK) {
    errors.push('Missing PK');
    isValid = false;
  }
  
  if (!entity.SK) {
    errors.push('Missing SK');
    isValid = false;
  }
  
  if (!entity.type) {
    errors.push('Missing type');
    isValid = false;
  }
  
  // Entity specific validation
  switch (entityType) {
    case 'PATIENT':
      if (!entity.id) {
        errors.push('Missing patient id');
        isValid = false;
      }
      
      // Check if PK matches pattern
      if (entity.PK && !entity.PK.startsWith('PAT#')) {
        errors.push(`PK should start with 'PAT#' but got '${entity.PK}'`);
        isValid = false;
      }
      
      // GSI checks
      if (!entity.GSI1PK || !entity.GSI1SK) {
        errors.push('Missing GSI1PK/GSI1SK for patient');
        isValid = false;
      }
      break;
      
    case 'APPOINTMENT':
      if (!entity.id) {
        errors.push('Missing appointment id');
        isValid = false;
      }
      
      if (entity.PK && !entity.PK.startsWith('APPT#')) {
        errors.push(`PK should start with 'APPT#' but got '${entity.PK}'`);
        isValid = false;
      }
      break;
      
    default:
      // Generic validation
  }
  
  // Output results
  if (isValid) {
    console.log(`%c✅ Valid ${entityType} DynamoDB structure`, 'color: green; font-weight: bold');
    return true;
  } else {
    console.error(`%c❌ Invalid ${entityType} DynamoDB structure:`, 'color: red; font-weight: bold');
    errors.forEach(err => console.error(`- ${err}`));
    return false;
  }
}

// Add this debugging utility to window in development
if (import.meta.env.DEV) {
  window.dynamoDb = {
    logEntity: logDynamoEntity,
    verify: verifyDynamoStructure
  };
  
  console.log(
    '%cDynamoDB Debug Tools Available', 
    'background: #0066CC; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold'
  );
  console.log(
    '%cUse window.dynamoDb.logEntity(entity) to inspect DynamoDB entities',
    'color: #0066CC'
  );
  console.log(
    '%cUse window.dynamoDb.verify(entity, "PATIENT") to validate DynamoDB entities',
    'color: #0066CC'
  );
}

export default {
  logDynamoEntity,
  verifyDynamoStructure
};
