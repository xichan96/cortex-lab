export interface JsonField {
  key: string;
  value: any;
  isJson?: boolean;
  nestedFields?: JsonField[];
}

export interface ParseJsonResult {
  isJson: boolean;
  data: any;
  fields: JsonField[];
}

export const parseJsonValue = (value: string): ParseJsonResult => {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const fields = Object.entries(parsed).map(([key, val]) => {
        const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
        const nestedJson = typeof val === 'object' && val !== null && !Array.isArray(val) 
          ? parseJsonValue(valStr) 
          : null;
        
        if (nestedJson && nestedJson.isJson) {
          return {
            key,
            value: valStr,
            isJson: true,
            nestedFields: nestedJson.fields,
          };
        }
        return {
          key,
          value: valStr,
          isJson: false,
        };
      });
      return { isJson: true, data: parsed, fields };
    }
  } catch {
    // Not valid JSON
  }
  return { isJson: false, data: null, fields: [] };
};

export const buildJsonFromFields = (jsonFields: JsonField[]): string => {
  const jsonObj: Record<string, any> = {};
  jsonFields.forEach((field) => {
    if (field.nestedFields && field.nestedFields.length > 0) {
      const nestedObj: Record<string, any> = {};
      field.nestedFields.forEach((nested) => {
        try {
          nestedObj[nested.key] = JSON.parse(nested.value);
        } catch {
          nestedObj[nested.key] = nested.value;
        }
      });
      jsonObj[field.key] = nestedObj;
    } else {
      try {
        jsonObj[field.key] = JSON.parse(field.value);
      } catch {
        jsonObj[field.key] = field.value;
      }
    }
  });
  return JSON.stringify(jsonObj);
};

