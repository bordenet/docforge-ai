/**
 * Acceptance Criteria Form Data Fixture
 * Field IDs match plugins/acceptance-criteria/config.js formFields.
 */

export default {
  issueTitle: 'Implement User Profile Photo Upload',
  whatNeedsToBeDone:
    'Users should be able to upload a profile photo from their settings page. ' +
    'The photo must be cropped to a square aspect ratio, support common image formats ' +
    '(JPEG, PNG, WebP), and be compressed to under 500KB before storage.',
  relatedContext:
    'This is part of the user personalization initiative. The design mockups are in Figma ' +
    '(link: figma.com/file/xyz). Backend already has an S3 bucket configured for user media. ' +
    'The upload component from our design system should be used.',
  edgeCases:
    'Consider: Very large files (>10MB), unsupported formats (GIF, BMP), ' +
    'corrupted files, network timeouts during upload, user canceling mid-upload, ' +
    'simultaneous uploads from multiple tabs, and users on slow connections.',
  outOfScope:
    'Video uploads, multiple photos, photo editing beyond cropping, ' +
    'integration with external profile services (Gravatar), ' +
    'and batch upload functionality.',
};

