// frontend/src/utils/s3Utils.test.js
import { getDisplayableS3Url } from './s3Utils';

describe('getDisplayableS3Url', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clears the process.env mock before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restores the original process.env after all tests
    process.env = originalEnv;
  });

  test('should return null for null or undefined input', () => {
    expect(getDisplayableS3Url(null)).toBeNull();
    expect(getDisplayableS3Url(undefined)).toBeNull();
    expect(getDisplayableS3Url('')).toBeNull(); // Adjusted to expect null for empty string as per implementation
  });

  test('should return existing HTTPS URL directly', () => {
    const httpsUrl = 'https://my-bucket.s3.us-west-2.amazonaws.com/my-key.jpg';
    expect(getDisplayableS3Url(httpsUrl)).toBe(httpsUrl);
  });

  test('should convert valid S3 URI to HTTPS URL using default region', () => {
    delete process.env.REACT_APP_AWS_REGION; // Ensure default is used
    const s3Uri = 's3://my-doc-bucket/patient-photos/image.png';
    const expectedUrl = 'https://my-doc-bucket.s3.us-east-1.amazonaws.com/patient-photos/image.png';
    expect(getDisplayableS3Url(s3Uri)).toBe(expectedUrl);
  });

  test('should convert valid S3 URI to HTTPS URL using REACT_APP_AWS_REGION env variable', () => {
    process.env.REACT_APP_AWS_REGION = 'eu-central-1';
    const s3Uri = 's3://another-bucket/reports/report.pdf';
    const expectedUrl = 'https://another-bucket.s3.eu-central-1.amazonaws.com/reports/report.pdf';
    expect(getDisplayableS3Url(s3Uri)).toBe(expectedUrl);
  });

  test('should return null for malformatted S3 URI (missing bucket)', () => {
    const s3Uri = 's3:///reports/report.pdf';
    expect(getDisplayableS3Url(s3Uri)).toBeNull();
  });

  test('should return null for malformatted S3 URI (missing key but has bucket)', () => {
    const s3Uri = 's3://my-bucket/';
    expect(getDisplayableS3Url(s3Uri)).toBeNull();
  });
  
  test('should return the original string if format is unrecognized', () => {
    const unrecognizedFormat = 'ftp://my-server/file.zip';
    expect(getDisplayableS3Url(unrecognizedFormat)).toBe(unrecognizedFormat);
    const justAString = 'justAStringValue'; // Does not start with s3:// or https://
    expect(getDisplayableS3Url(justAString)).toBe(justAString);
  });

  test('should handle S3 URI with special characters in key (though S3 keys have restrictions)', () => {
    delete process.env.REACT_APP_AWS_REGION;
    const s3Uri = 's3://my-bucket/path with spaces/file+name.jpg';
    const expectedUrl = 'https://my-bucket.s3.us-east-1.amazonaws.com/path with spaces/file+name.jpg';
    // Note: URL encoding for spaces is typically handled by browsers or specific URL generation tools,
    // this function currently doesn't explicitly encode the key part.
    expect(getDisplayableS3Url(s3Uri)).toBe(expectedUrl);
  });
});
